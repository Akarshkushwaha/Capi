from typing import Dict, Any, List
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text
from rich.markdown import Markdown
from rich.layout import Layout

console = Console()

def get_risk_badge(risk: str, level: str, score: int, deprecated: bool = False) -> str:
    if deprecated or level == "DEPRECATED":
        return "[bold white on magenta] DEPRECATED [/bold white on magenta]"
    elif risk == "HIGH" or level == "DANGER" or score >= 70:
        return f"[bold white on red] DANGER ({score}/100) [/bold white on red]"
    elif risk == "MEDIUM" or level == "CAUTION" or score >= 35:
        return f"[bold black on yellow] CAUTION ({score}/100) [/bold black on yellow]"
    else:
        return f"[bold white on green] SAFE ({score}/100) [/bold white on green]"

def format_query_result(result: Dict[str, Any]):
    """
    Displays a rich terminal panel with the key name, service, risk badge,
    provenance text, related incidents, and safe boundaries.
    """
    key = result.get("key", "UNKNOWN")
    service = result.get("service", "default")
    risk = result.get("risk", "LOW")
    score = result.get("score", 0)
    level = result.get("level", "SAFE")
    safe_range = result.get("safe_range", "N/A")
    reasons = result.get("reasons", [])
    provenance = result.get("provenance", [])
    incidents = result.get("incidents", [])
    deprecated = result.get("deprecated", False)

    badge = get_risk_badge(risk, level, score, deprecated)

    # Build content body
    body = f"[bold cyan]Service:[/bold cyan] {service}\n"
    body += f"[bold cyan]Safety Status:[/bold cyan] {badge}\n"
    body += f"[bold cyan]Safe Operating Range:[/bold cyan] [yellow]{safe_range}[/yellow]\n\n"

    if reasons:
        body += "[bold underline white]Risk Assessment & Root Causes:[/bold underline white]\n"
        for r in reasons:
            body += f"  • {r}\n"
        body += "\n"

    body += "[bold underline white]Archaeology Provenance (Git Commits & PRs):[/bold underline white]\n"
    if isinstance(provenance, list) and provenance:
        for p in provenance[:3]:
            # Clean up text for terminal display
            clean_p = str(p).strip()
            body += f"  📜 [italic]{clean_p}[/italic]\n\n"
    elif isinstance(provenance, str) and provenance.strip():
        body += f"  📜 [italic]{provenance.strip()}[/italic]\n\n"
    else:
        body += "  ℹ️ No documented git commit or PR reasoning found in knowledge graph.\n\n"

    body += "[bold underline white]Related Production Incidents & Outages:[/bold underline white]\n"
    if isinstance(incidents, list) and incidents:
        for inc in incidents[:3]:
            clean_inc = str(inc).strip()
            body += f"  🚨 [red]{clean_inc}[/red]\n\n"
    elif isinstance(incidents, str) and incidents.strip():
        body += f"  🚨 [red]{incidents.strip()}[/red]\n\n"
    else:
        body += "  ✅ No historical production incidents linked to this variable.\n\n"

    border_color = "red" if (level == "DANGER" or risk == "HIGH") else ("yellow" if (level == "CAUTION" or risk == "MEDIUM") else ("magenta" if deprecated else "green"))
    
    panel = Panel(
        body.strip(),
        title=f"[bold {border_color}]💡 Capi Config Archaeology: {key}[/bold {border_color}]",
        subtitle="[dim]Self-Improving Memory Layer • Powered by Cognee[/dim]",
        border_style=border_color,
        padding=(1, 2)
    )
    console.print(panel)

def format_check_result(results: List[Dict[str, Any]]):
    """
    Displays a Rich table with one row per key showing key name, risk level badge, and summary of why.
    """
    if not results:
        console.print("[yellow]No config variables found to check.[/yellow]")
        return

    table = Table(title="[bold cyan]🛡️ Capi Automated Config Safety Audit[/bold cyan]", border_style="cyan", show_lines=True)
    table.add_column("Config Key", style="bold white", justify="left")
    table.add_column("Risk Level", justify="center")
    table.add_column("Safe Range", style="yellow", justify="left")
    table.add_column("Summary / Archaeology Provenance", style="white", justify="left")

    danger_count = 0
    caution_count = 0

    for res in results:
        key = res.get("key", "UNKNOWN")
        risk = res.get("risk", "LOW")
        score = res.get("score", 0)
        level = res.get("level", "SAFE")
        safe_range = res.get("safe_range", "N/A")
        reasons = res.get("reasons", [])
        prov = res.get("provenance", [])
        deprecated = res.get("deprecated", False)

        badge = get_risk_badge(risk, level, score, deprecated)
        if level == "DANGER" or risk == "HIGH":
            danger_count += 1
        elif level == "CAUTION" or risk == "MEDIUM":
            caution_count += 1

        summary_parts = []
        if reasons:
            summary_parts.append(reasons[0])
        elif isinstance(prov, list) and prov:
            summary_parts.append(str(prov[0])[:120] + "...")
        else:
            summary_parts.append("Standard variable.")

        summary_str = "\n".join(summary_parts)
        table.add_row(key, badge, safe_range, summary_str)

    console.print(table)

    if danger_count > 0:
        console.print(f"\n[bold white on red] 🚨 WARNING: Found {danger_count} critical DANGER key(s)! Review boundaries before deploying. [/bold white on red]")
    elif caution_count > 0:
        console.print(f"\n[bold black on yellow] ⚠️ CAUTION: Found {caution_count} sensitive key(s). Proceed with care. [/bold black on yellow]")
    else:
        console.print("\n[bold white on green] ✅ All checked configuration variables appear safe to deploy! [/bold white on green]")
