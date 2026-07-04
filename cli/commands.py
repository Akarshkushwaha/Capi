import os
import asyncio
import typer
from typing import Optional
from rich.console import Console
from rich.panel import Panel

from core.ingestion import get_git_history, get_pr_descriptions, get_incident_reports, parse_env_file
from core.memory import recall_config, record_incident, record_safe_change, deprecate_service, deprecate_key, init_cognee
from core.risk import format_query_result, format_check_result

app = typer.Typer(
    name="capi",
    help="💡 Capi (Config Archaeology) — Self-improving memory layer for your engineering team's config values, powered by Cognee.",
    no_args_is_help=True
)
console = Console()

@app.command("ingest")
def ingest_cmd(
    source: str = typer.Argument(..., help="Data source to ingest: 'git', 'prs', or 'incidents'"),
    path: str = typer.Argument(".", help="Path to repo, file, or incident folder"),
    service: str = typer.Option("default", "--service", "-s", help="Target microservice name (e.g. payments-api)")
):
    """
    Ingest config history from git repositories, GitHub PRs, or incident post-mortems into Cognee memory.
    """
    console.print(f"[bold cyan]🧠 Capi Ingestion Engine — Ingesting from '{source}' for service '{service}'...[/bold cyan]")
    init_cognee()

    if source.lower() == "git":
        count = asyncio.run(get_git_history(repo_path=".", file_path=path, service_name=service))
        console.print(f"[bold green]✅ Successfully ingested {count} commit snippets into dataset config_{service}![/bold green]")
    elif source.lower() in ["prs", "pr", "github"]:
        count = asyncio.run(get_pr_descriptions(repo_path=path, service_name=service))
        console.print(f"[bold green]✅ Successfully ingested {count} pull requests into dataset config_{service}![/bold green]")
    elif source.lower() in ["incidents", "incident", "postmortem"]:
        count = asyncio.run(get_incident_reports(folder_path=path, service_name=service))
        console.print(f"[bold green]✅ Successfully ingested {count} incident reports into dataset incidents_{service}![/bold green]")
    else:
        console.print(f"[bold red]❌ Unknown ingestion source: '{source}'. Valid options: git, prs, incidents.[/bold red]")
        raise typer.Exit(code=1)

@app.command("query")
def query_cmd(
    key: str = typer.Option(..., "--key", "-k", help="Config key name (e.g. DB_POOL_SIZE)"),
    service: str = typer.Option("default", "--service", "-s", help="Service name (e.g. payments-api)")
):
    """
    Query Cognee knowledge graph for the origin, provenance, and historical risks of a configuration variable.
    """
    console.print(f"[dim]Searching archaeology memory for '{key}' in service '{service}'...[/dim]\n")
    res = asyncio.run(recall_config(key_name=key, service_name=service))
    format_query_result(res)

@app.command("check")
def check_cmd(
    env_file: str = typer.Argument(..., help="Path to .env or configuration file to audit"),
    service: str = typer.Option("default", "--service", "-s", help="Service name (e.g. payments-api)")
):
    """
    Audit an entire configuration file against historical incident memory and safe boundaries.
    """
    console.print(f"[dim]Auditing configuration file '{env_file}' for service '{service}'...[/dim]\n")
    keys = parse_env_file(env_file)
    if not keys:
        console.print(f"[bold red]❌ No configuration variables found in file '{env_file}'.[/bold red]")
        raise typer.Exit(code=1)

    results = []
    for k in keys:
        res = asyncio.run(recall_config(key_name=k, service_name=service))
        results.append(res)

    format_check_result(results)

@app.command("incident")
def incident_cmd(
    key: str = typer.Option(..., "--key", "-k", help="Config key that caused the outage"),
    service: str = typer.Option("default", "--service", "-s", help="Service name (e.g. payments-api)"),
    notes: str = typer.Option(..., "--notes", "-n", help="Description of what went wrong and root cause"),
    severity: str = typer.Option("P2", "--severity", "-sev", help="Severity level: P1 (Critical) to P4 (Minor)")
):
    """
    Record a production incident or outage caused by a config variable.
    Enforces Rule 3: Triggers cognee.improve() negative feedback loop immediately.
    """
    console.print(f"[bold red]🚨 Recording P-Incident ({severity}) for key '{key}' on service '{service}'...[/bold red]")
    asyncio.run(record_incident(key=key, service=service, notes=notes, severity=severity))
    
    panel = Panel(
        f"[bold white]Key:[/bold white] {key}\n[bold white]Service:[/bold white] {service}\n[bold white]Severity:[/bold white] [red]{severity}[/red]\n[bold white]Notes:[/bold white] {notes}\n\n[bold yellow]⚡ Cognee improve() negative feedback loop triggered! Danger score increased.[/bold yellow]",
        title="[bold red]🔴 Production Incident Recorded[/bold red]",
        border_style="red"
    )
    console.print(panel)

@app.command("safe")
def safe_cmd(
    key: str = typer.Option(..., "--key", "-k", help="Config key deployed safely"),
    service: str = typer.Option("default", "--service", "-s", help="Service name (e.g. payments-api)")
):
    """
    Record a successful, clean deployment of a config variable.
    Enforces Rule 3: Triggers cognee.improve() positive feedback loop immediately.
    """
    console.print(f"[bold green]✅ Recording safe deployment for key '{key}' on service '{service}'...[/bold green]")
    asyncio.run(record_safe_change(key=key, service=service))
    
    panel = Panel(
        f"[bold white]Key:[/bold white] {key}\n[bold white]Service:[/bold white] {service}\n\n[bold cyan]⚡ Cognee improve() positive feedback loop triggered! Danger score softened.[/bold cyan]",
        title="[bold green]🟢 Safe Deployment Confirmed[/bold green]",
        border_style="green"
    )
    console.print(panel)

@app.command("deprecate")
def deprecate_cmd(
    service: str = typer.Option(..., "--service", "-s", help="Service name to deprecate"),
    key: Optional[str] = typer.Option(None, "--key", "-k", help="Optional specific config key to deprecate")
):
    """
    Deprecate an entire service (calls cognee.forget on datasets) or a specific key.
    """
    if key:
        console.print(f"[bold magenta]🗑️ Deprecating key '{key}' in service '{service}'...[/bold magenta]")
        asyncio.run(deprecate_key(key=key, service=service))
        console.print(f"[bold green]✅ Key '{key}' marked as deprecated in knowledge graph.[/bold green]")
    else:
        console.print(f"[bold magenta]🗑️ Deprecating entire service '{service}' (calling cognee.forget)...[/bold magenta]")
        asyncio.run(deprecate_service(service=service))
        console.print(f"[bold green]✅ Service '{service}' datasets (config_{service} and incidents_{service}) cleared![/bold green]")

if __name__ == "__main__":
    app()
