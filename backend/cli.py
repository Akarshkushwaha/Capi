import os
import sys
import asyncio
import typer
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.markdown import Markdown
from dotenv import load_dotenv

load_dotenv()

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import cognee
from services.git_ingester import ingest_repo_git_history, is_config_file
from services.pr_ingester import ingest_github_prs
from services.incident_ingester import ingest_incident
from services.slack_ingester import ingest_slack_threads
from services.danger_score import calculate_danger_score, record_feedback, seed_demo_danger_scores
from services.git_hook import check_staged_config_changes, install_git_hook

app = typer.Typer(
    name="capi",
    help="🧠 Capi (Config Archaeology) — AI-powered configuration provenance & pre-commit guardrails.",
    add_completion=False,
)
ingest_app = typer.Typer(help="📥 Ingest code history, PRs, Slack threads, or incident reports into Cognee.")
app.add_typer(ingest_app, name="ingest")

console = Console()

def run_async(coro):
    return asyncio.run(coro)

@ingest_app.command("git")
def ingest_git(repo_path: str = typer.Argument(".", help="Path to local git repository"), max_commits: int = typer.Option(20, help="Max commits to scan")):
    """Scan local git repository for historical config modifications."""
    console.print(Panel(f"[bold cyan]📥 Capi Archaeology: Ingesting Git History from {repo_path}[/bold cyan]"))
    count = run_async(ingest_repo_git_history(repo_path, max_commits=max_commits))
    console.print(f"[bold green]✅ Ingested {count} historical git commits into Cognee.[/bold green]")

@ingest_app.command("pr")
def ingest_pr(repo_name: str = typer.Argument(..., help="GitHub repo 'owner/name' (e.g. fastapi/fastapi)"), limit: int = typer.Option(10, help="Max PRs to check")):
    """Fetch closed/merged GitHub PRs discussing configuration."""
    console.print(Panel(f"[bold cyan]📥 Capi Archaeology: Ingesting GitHub PRs from {repo_name}[/bold cyan]"))
    count = run_async(ingest_github_prs(repo_name, limit=limit))
    console.print(f"[bold green]✅ Ingested {count} GitHub PR discussions into Cognee.[/bold green]")

@ingest_app.command("incident")
def ingest_inc(file_or_text: str = typer.Argument(..., help="Path to post-mortem file or raw string")):
    """Ingest production outage / incident report into memory."""
    console.print(Panel("[bold cyan]📥 Capi Archaeology: Ingesting Incident Post-Mortem[/bold cyan]"))
    success = run_async(ingest_incident(file_or_text))
    if success:
        console.print("[bold green]✅ Incident report ingested and linked to config graph.[/bold green]")

@ingest_app.command("slack")
def ingest_slack(json_file: str = typer.Argument(..., help="Path to Slack export JSON file")):
    """Ingest emergency Slack thread discussions into memory."""
    console.print(Panel("[bold cyan]📥 Capi Archaeology: Ingesting Slack Threads[/bold cyan]"))
    count = run_async(ingest_slack_threads(json_file))
    console.print(f"[bold green]✅ Ingested {count} Slack thread summaries into Cognee.[/bold green]")

@app.command("query")
def query_config(key: str = typer.Argument(..., help="Configuration key name (e.g. DB_POOL_SIZE)")):
    """🔎 Query Capi for the full provenance, reasoning, and danger score of a config key."""
    console.print(f"\n[bold cyan]🔎 Capi Config Archaeology Query:[/bold cyan] [bold white]{key}[/bold white]\n")
    
    # 1. Danger Score Badge
    stats = calculate_danger_score(key)
    level = stats["level"]
    score = stats["score"]
    range_str = stats["safe_range"]
    reasons = stats["reasons"]

    if level == "DANGER":
        badge = f"[bold red]🔴 DANGER SCORE: {score}/100 ({level})[/bold red]"
        border_style = "red"
    elif level == "CAUTION":
        badge = f"[bold yellow]🟡 DANGER SCORE: {score}/100 ({level})[/bold yellow]"
        border_style = "yellow"
    else:
        badge = f"[bold green]🟢 DANGER SCORE: {score}/100 ({level})[/bold green]"
        border_style = "green"

    panel_text = f"{badge}\n\n[bold white]{range_str}[/bold white]\n\n[bold cyan]Historical Risk Analysis:[/bold cyan]\n"
    for r in reasons:
        panel_text += f" • {r}\n"

    console.print(Panel(panel_text, title=f"Risk Assessment: {key}", border_style=border_style))

    # 2. Cognee Graph Recall
    console.print("[dim]Retrieving semantic graph history from Cognee memory layer...[/dim]")
    query_str = f"Explain why {key} is set to its current value. Who changed it, what incident caused it, and what are the historical trade-offs?"
    try:
        results = run_async(cognee.recall(query_str))
        console.print("\n[bold magenta]🧠 Cognee Knowledge Graph Provenance:[/bold magenta]")
        for idx, res in enumerate(results, 1):
            txt = getattr(res, "text", str(res))
            console.print(Panel(Markdown(txt), title=f"Source Context #{idx}", border_style="blue"))
    except Exception as e:
        console.print(f"[yellow]⚠️ Could not recall from Cognee (maybe no data ingested yet): {e}[/yellow]")

@app.command("blame")
def blame_file(file_path: str = typer.Argument(..., help="Path to config file (.env, config.yaml, etc.)")):
    """📜 Semantic AI Blame: explain WHY each config variable in a file is set to its current value."""
    if not os.path.exists(file_path):
        console.print(f"[red]❌ File not found: {file_path}[/red]")
        raise typer.Exit(1)

    console.print(f"\n[bold cyan]📜 Capi Semantic Blame:[/bold cyan] [bold white]{file_path}[/bold white]\n")
    with open(file_path, "r", encoding="utf-8", errors="replace") as f:
        lines = f.readlines()

    table = Table(show_header=True, header_style="bold magenta")
    table.add_column("Line", style="dim", width=6)
    table.add_column("Variable / Value", style="bold white", width=28)
    table.add_column("Danger", width=12)
    table.add_column("Historical Provenance & Safe Boundaries")

    for idx, line in enumerate(lines, 1):
        clean = line.strip()
        if not clean or clean.startswith("#") or clean.startswith("//"):
            continue
        
        # Match KEY=VAL or key: val
        parts = clean.split("=", 1) if "=" in clean else clean.split(":", 1)
        if len(parts) == 2:
            key = parts[0].strip().upper()
            val = parts[1].strip()
            stats = calculate_danger_score(key)
            lvl = stats["level"]
            score = stats["score"]
            if lvl == "DANGER":
                lvl_str = f"[red]🔴 DANGER ({score})[/red]"
            elif lvl == "CAUTION":
                lvl_str = f"[yellow]🟡 CAUTION ({score})[/yellow]"
            else:
                lvl_str = f"[green]🟢 SAFE ({score})[/green]"
            
            summary_reasons = stats["safe_range"] + " — " + (stats["reasons"][0] if stats["reasons"] else "No incidents linked.")
            table.add_row(str(idx), f"{key} = {val[:15]}", lvl_str, summary_reasons)

    console.print(table)

@app.command("check")
def pre_commit_check(repo_path: str = typer.Option(".", help="Path to repository")):
    """🛑 Check staged git commit changes for dangerous configuration violations."""
    exit_code = check_staged_config_changes(repo_path)
    if exit_code != 0:
        raise typer.Exit(exit_code)

@app.command("install-hook")
def install_hook_cmd(repo_path: str = typer.Option(".", help="Path to repository")):
    """🛡️ Install Capi pre-commit safety hook into your Git repository."""
    success = install_git_hook(repo_path)
    if not success:
        raise typer.Exit(1)

@app.command("demo")
def seed_demo():
    """⚡ One-click demo seed: load sample e-commerce outage story into Capi in 5 seconds."""
    console.print(Panel("[bold cyan]⚡ Capi One-Click Demo Mode — Seeding E-Commerce Outage Story[/bold cyan]"))
    seed_demo_danger_scores()
    
    mock_items = [
        "Commit 89a4f21 by @jdoe on March 14, 2024: Set DB_POOL_SIZE=10. Diff: -DB_POOL_SIZE=20 +DB_POOL_SIZE=10. Message: fix config for t2.micro db server to prevent OOM.",
        "Slack thread in #eng-backend on March 14, 2024: 'Hey everyone, the db crashed again. Looks like memory exhaustion. We are running on a t2.micro which has 512MB RAM. If we go above 12 connections, it OOMs. Let's set DB_POOL_SIZE to 10 for now.'",
        "Incident Report INC-47 (March 14, 2024): Production database became unresponsive due to out of memory error. Root cause: connection pool size was 20, exceeding available RAM on t2.micro instance. Resolution: DB_POOL_SIZE changed to 10.",
        "Commit 42c8e90 by @asmith on Jan 10, 2024: Added REQUEST_TIMEOUT=30000. Message: external billing API takes up to 25s under load, adding a 30s timeout to prevent worker starvation."
    ]
    
    for item in mock_items:
        try:
            run_async(cognee.remember(item, dataset_name="demo_story"))
        except Exception as e:
            pass
            
    console.print("[bold green]🎉 Demo story successfully seeded! Try querying running: capi query DB_POOL_SIZE[/bold green]")

@app.command("serve")
def start_server(port: int = typer.Option(8000, help="Port to listen on"), reload: bool = typer.Option(True, help="Enable auto-reload")):
    """🚀 Start the Capi FastAPI backend server for the web dashboard."""
    import uvicorn
    console.print(Panel(f"[bold green]🚀 Starting Capi Archaeology API Server on http://0.0.0.0:{port}[/bold green]"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=reload)

if __name__ == "__main__":
    app()
