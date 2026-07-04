import os
import sys
import re
from git import Repo
from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich.table import Table

# Add parent directory to path so we can import services when run standalone by git hook
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from services.danger_score import calculate_danger_score
from services.git_ingester import is_config_file

console = Console()

def parse_config_changes_from_diff(diff_text: str) -> list[tuple[str, str]]:
    """
    Extracts (key, value) pairs from added/modified lines in a git patch snippet.
    Supports ENV formats (KEY=VAL), YAML/JSON (key: val, "key": "val"), and python variables (KEY = VAL).
    """
    changes = []
    lines = diff_text.splitlines()
    for line in lines:
        if line.startswith("+") and not line.startswith("+++"):
            clean_line = line[1:].strip()
            # Match KEY=VAL or KEY = VAL or "key": "val" or key: val
            match = re.match(r"^['\"]?([A-Z0-9_]{3,})['\"]?\s*[:=]\s*['\"]?([^'\",\s]+)['\"]?", clean_line, re.IGNORECASE)
            if match:
                key = match.group(1).upper()
                val = match.group(2)
                changes.append((key, val))
    return changes

def check_staged_config_changes(repo_path: str = ".") -> int:
    """
    Checks staged git changes for dangerous configuration modifications.
    Returns 0 if safe or caution (with warnings), 1 if commit should be BLOCKED (DANGER).
    """
    try:
        repo = Repo(repo_path, search_parent_directories=True)
    except Exception as e:
        console.print(f"[yellow]⚠️ Could not initialize git repo at {repo_path}: {e}[/yellow]")
        return 0

    staged_diffs = repo.index.diff("HEAD", create_patch=True) if repo.head.is_valid() else repo.index.diff(None, create_patch=True)
    
    config_changes = []
    for diff in staged_diffs:
        fpath = diff.b_path or diff.a_path
        if fpath and is_config_file(fpath):
            patch = diff.diff.decode("utf-8", errors="replace") if diff.diff else ""
            pairs = parse_config_changes_from_diff(patch)
            for k, v in pairs:
                config_changes.append((fpath, k, v))

    if not config_changes:
        console.print("[green]✅ Capi Archaeology: No configuration variable changes detected in staged commit.[/green]")
        return 0

    console.print(Panel("[bold cyan]🔍 Capi Archaeology — Pre-Commit Safety Check[/bold cyan]", expand=False))
    
    table = Table(show_header=True, header_style="bold magenta")
    table.add_column("File", style="dim")
    table.add_column("Config Key", style="bold")
    table.add_column("New Value")
    table.add_column("Danger Level")
    table.add_column("Safe Operating Range")

    blocked = False
    danger_messages = []

    for fpath, key, val in config_changes:
        danger_info = calculate_danger_score(key)
        level = danger_info["level"]
        score = danger_info["score"]
        safe_range = danger_info["safe_range"]
        reasons = danger_info["reasons"]

        # Check if integer value violates safe range
        val_num = None
        try:
            val_num = float(val)
        except ValueError:
            pass

        is_violation = False
        if val_num is not None:
            if "DB_POOL_SIZE" in key and val_num > 15:
                is_violation = True
            elif "REQUEST_TIMEOUT" in key and val_num < 30000:
                is_violation = True
            elif danger_info.get("safe_min") is not None and val_num < danger_info["safe_min"]:
                is_violation = True
            elif danger_info.get("safe_max") is not None and val_num > danger_info["safe_max"]:
                is_violation = True

        if level == "DANGER" or is_violation:
            lvl_str = f"[bold red]🔴 DANGER ({score}/100)[/bold red]"
            blocked = True
            danger_messages.append((key, val, reasons, safe_range))
        elif level == "CAUTION":
            lvl_str = f"[bold yellow]🟡 CAUTION ({score}/100)[/bold yellow]"
        else:
            lvl_str = f"[bold green]🟢 SAFE ({score}/100)[/bold green]"

        table.add_row(fpath, key, str(val), lvl_str, safe_range)

    console.print(table)

    if blocked:
        console.print()
        warn_panel_text = "[bold red]🛑 COMMIT BLOCKED BY CAPI ARCHAEOLOGY[/bold red]\n\n"
        warn_panel_text += "You are attempting to commit configuration values that violate historical production safety boundaries or have caused past outages:\n\n"
        for k, v, r_list, s_range in danger_messages:
            warn_panel_text += f"• [bold yellow]{k}[/bold yellow] = [bold red]{v}[/bold red]\n"
            for r in r_list:
                warn_panel_text += f"  - {r}\n"
            warn_panel_text += f"  - [bold cyan]Recommendation[/bold cyan]: {s_range}\n\n"
        warn_panel_text += "[dim]To bypass this safety check in an emergency, use 'git commit --no-verify'.[/dim]"
        console.print(Panel(warn_panel_text, border_style="red", expand=False))
        return 1

    console.print("[bold green]✅ All configuration changes pass Capi archaeology safety checks! Proceeding with commit...[/bold green]\n")
    return 0

def install_git_hook(repo_path: str = ".") -> bool:
    """
    Installs Capi archaeology pre-commit hook into the specified Git repository.
    """
    try:
        repo = Repo(repo_path, search_parent_directories=True)
        git_dir = repo.git_dir
    except Exception:
        console.print(f"[red]❌ Not a valid Git repository: {repo_path}[/red]")
        return False

    hooks_dir = os.path.join(git_dir, "hooks")
    os.makedirs(hooks_dir, exist_ok=True)
    hook_path = os.path.join(hooks_dir, "pre-commit")

    # Find python executable
    python_exe = sys.executable
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    hook_content = f"""#!/usr/bin/env bash
# Capi (Config Archaeology) — Autonomous Pre-Commit Guardrail
export PYTHONPATH="{backend_dir}:$PYTHONPATH"
"{python_exe}" -m services.git_hook "$@"
"""

    with open(hook_path, "w", encoding="utf-8") as f:
        f.write(hook_content)
    
    os.chmod(hook_path, 0o755)
    console.print(f"[bold green]🎉 Capi pre-commit hook successfully installed at {hook_path}![/bold green]")
    console.print("[dim]Any future 'git commit' will automatically be checked for dangerous config modifications.[/dim]")
    return True

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "install":
        install_git_hook(".")
    else:
        exit_code = check_staged_config_changes(".")
        sys.exit(exit_code)
