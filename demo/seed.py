#!/usr/bin/env python3
"""
Capi Demo Seeding Script
Seeds realistic e-commerce outage story (DB_POOL_SIZE on t2.micro) into Cognee memory.
Enforces Rule 12: PR increases value -> incident -> value reduced -> improve() fires -> danger score rises.
"""
import os
import sys
import asyncio
from rich.console import Console
from rich.panel import Panel

# Ensure project root is in path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.memory import remember_content, record_incident, record_safe_change, init_cognee, record_feedback_db

console = Console()

async def run_seed():
    console.print(Panel("[bold cyan]🌱 Capi Config Archaeology — Seeding Demo Story Data[/bold cyan]", border_style="cyan"))
    
    init_cognee()
    service = "payments-api"
    
    console.print("[yellow]1/5 Ingesting PR description: Increasing DB_POOL_SIZE to 20 for scaling...[/yellow]")
    pr_text = (
        "PR #89 by @asmith (merged 3 months ago):\n"
        "Title: Increase DB_POOL_SIZE for upcoming marketing campaign scaling\n"
        "Body: Increasing DB_POOL_SIZE from 8 to 20 to handle concurrent checkout traffic during the flash sale. "
        "Tested locally with mock load generator."
    )
    await remember_content(pr_text, dataset_name=f"config_{service}")
    
    console.print("[yellow]2/5 Ingesting Incident Report INC-47: OOM crashes on t2.micro...[/yellow]")
    inc_text = (
        "INCIDENT REPORT INC-47 (March 14, 2024):\n"
        "Service: payments-api | Severity: P1 Critical | Author: @jsmith\n"
        "Summary: Production database server became unresponsive and OOM killed under load.\n"
        "Root Cause: PR #89 increased DB_POOL_SIZE to 20. Our database cluster runs on AWS t2.micro instances with 512MB RAM. "
        "Each Postgres connection takes ~25MB RAM. 20 connections exceeded available physical memory (500MB+), triggering Linux OOM killer.\n"
        "Resolution: Immediately reduced DB_POOL_SIZE from 20 to 10."
    )
    await remember_content(inc_text, dataset_name=f"incidents_{service}")
    
    console.print("[yellow]3/5 Ingesting Git Commit: Reducing DB_POOL_SIZE to 10...[/yellow]")
    commit_text = (
        "GIT COMMIT 89a4f21 by @jsmith on March 14, 2024:\n"
        "Message: fix config for t2.micro db server to prevent OOM (INC-47)\n"
        "Diff: -DB_POOL_SIZE=20\n+DB_POOL_SIZE=10\n"
        "Reasoning: Capping pool size at 10 leaves 260MB buffer for OS operations on t2.micro."
    )
    await remember_content(commit_text, dataset_name=f"config_{service}")
    
    console.print("[yellow]4/5 Firing improve() negative feedback loop for DB_POOL_SIZE...[/yellow]")
    # Set safe boundaries explicitly for clear demonstration
    record_feedback_db("DB_POOL_SIZE", caused_incident=True, warning_msg="Outage INC-47: Setting pool size to 20 caused OOM memory exhaustion on t2.micro (512MB RAM). Max stable connection count is 10.", safe_min=5, safe_max=15)
    await record_incident(
        key="DB_POOL_SIZE",
        service=service,
        notes="Outage INC-47: Setting pool size to 20 caused OOM memory exhaustion on t2.micro (512MB RAM). Max stable connection count is 10.",
        severity="P1"
    )
    
    console.print("[yellow]5/5 Recording safe change & improve() positive feedback for WORKER_THREADS...[/yellow]")
    worker_commit = (
        "GIT COMMIT 55f1a23 by @asmith on May 10, 2024:\n"
        "Message: safely bump WORKER_THREADS from 2 to 4 after server CPU core upgrade.\n"
        "Diff: -WORKER_THREADS=2\n+WORKER_THREADS=4"
    )
    await remember_content(worker_commit, dataset_name=f"config_{service}")
    record_feedback_db("WORKER_THREADS", caused_incident=False, warning_msg="Safe operational thread count.", safe_min=2, safe_max=8)
    await record_safe_change("WORKER_THREADS", service=service)
    
    # Also seed REQUEST_TIMEOUT
    record_feedback_db("REQUEST_TIMEOUT", caused_incident=True, warning_msg="Billing API hanging: External API takes up to 25s under load. Set timeout to 30000ms.", safe_min=30000, safe_max=60000)
    
    console.print("\n[bold green]✅ Demo story seeded successfully! All 4 Cognee operations initialized.[/bold green]\n")
    console.print("[bold white]Run: [cyan]capi query --key DB_POOL_SIZE --service payments-api[/cyan][/bold white]\n")

if __name__ == "__main__":
    asyncio.run(run_seed())
