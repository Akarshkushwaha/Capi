import os
import re
import requests
import asyncio
from datetime import datetime, timezone, timedelta
from typing import List
from git import Repo

from core.memory import remember_content

CONFIG_EXTENSIONS = [
    ".env", ".yaml", ".yml", ".json", ".ini", ".toml", ".conf", ".cfg", ".properties"
]

CONFIG_KEYWORDS = [
    "config", "settings", "constants", "requirements", "package", "docker", "vite", "eslint", "oxlint", "main", "routes", "setup", "timeout", "pool", "limit", "memory", "retry"
]

async def get_git_history(repo_path: str, file_path: str, service_name: str) -> int:
    """
    Uses GitPython to walk commit history for a specific config file (or general repo if file_path is empty/root).
    Extracts diff, author, date, and commit message.
    Calls remember_content(..., dataset_name=config_{service}).
    """
    if not os.path.exists(repo_path):
        print(f"⚠️ Repository path not found: {repo_path}")
        return 0
        
    try:
        repo = Repo(repo_path, search_parent_directories=True)
    except Exception as e:
        print(f"⚠️ Failed to initialize Git repo at {repo_path}: {e}")
        return 0

    if repo.bare:
        print(f"⚠️ Repository at {repo_path} is bare.")
        return 0

    dataset = f"config_{service_name}"
    chunks = []
    
    # Iterate commits
    max_commits = 30
    count = 0
    
    kwargs = {"max_count": max_commits * 3}
    if file_path and file_path != "." and os.path.exists(os.path.join(repo_path, file_path)):
        kwargs["paths"] = file_path

    for commit in repo.iter_commits(**kwargs):
        if count >= max_commits:
            break

        parents = commit.parents
        diffs = commit.diff(parents[0] if parents else None, create_patch=True)

        config_diffs = []
        for diff_item in diffs:
            fpath = diff_item.b_path or diff_item.a_path
            if fpath:
                if not file_path or file_path == "." or fpath.endswith(file_path):
                    try:
                        patch = diff_item.diff.decode("utf-8", errors="replace") if diff_item.diff else ""
                        if patch.strip():
                            config_diffs.append((fpath, patch))
                    except Exception:
                        pass

        if config_diffs:
            count += 1
            author = commit.author.name
            email = commit.author.email
            date_str = datetime.fromtimestamp(commit.committed_date).strftime("%Y-%m-%d %H:%M:%S")
            hash_short = commit.hexsha[:8]
            message = commit.message.strip()

            summary = f"Git Commit {hash_short} on {date_str} by {author} ({email}):\n"
            summary += f"Commit Message: '{message}'\n\n"
            summary += "Configuration modifications:\n"
            for fpath, patch in config_diffs:
                patch_snippet = patch[:1500] + "\n...[truncated]" if len(patch) > 1500 else patch
                summary += f"--- {fpath} ---\n{patch_snippet}\n\n"

            chunks.append(summary.strip())

    for chunk in chunks:
        await remember_content(chunk, dataset_name=dataset)

    return len(chunks)

async def get_pr_descriptions(repo_path: str, service_name: str) -> int:
    """
    Pulls PR titles and descriptions from GitHub API for the last 6 months.
    Filters for PRs mentioning config keywords and calls remember_content(..., dataset_name=config_{service}).
    repo_path can be 'owner/repo' or extracted from local git remote.
    """
    repo_name = repo_path
    if os.path.exists(repo_path):
        try:
            repo = Repo(repo_path, search_parent_directories=True)
            for remote in repo.remotes:
                urls = list(remote.urls)
                if urls:
                    match = re.search(r"github\.com[:/]([^/]+/[^/\.]+)", urls[0])
                    if match:
                        repo_name = match.group(1)
                        break
        except Exception:
            pass

    if "/" not in repo_name:
        print(f"ℹ️ Could not resolve GitHub 'owner/repo' from '{repo_path}'. Skipping PR ingestion.")
        return 0

    url = f"https://api.github.com/repos/{repo_name}/pulls?state=closed&per_page=30&sort=updated&direction=desc"
    headers = {"Accept": "application/vnd.github.v3+json"}
    
    token = os.getenv("GITHUB_TOKEN")
    if token and token != "your_github_token_here":
        headers["Authorization"] = f"token {token}"

    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 404:
            print(f"⚠️ Repository '{repo_name}' not found or private on GitHub.")
            return 0
        response.raise_for_status()
        prs = response.json()
    except Exception as e:
        print(f"⚠️ Error fetching PRs from GitHub API for {repo_name}: {e}")
        return 0

    dataset = f"config_{service_name}"
    chunks = []
    six_months_ago = datetime.now(timezone.utc) - timedelta(days=180)

    for pr in prs:
        updated_str = pr.get("updated_at")
        if updated_str:
            try:
                updated_dt = datetime.fromisoformat(updated_str.replace("Z", "+00:00"))
                if updated_dt < six_months_ago:
                    continue
            except Exception:
                pass

        pr_number = pr.get("number")
        title = pr.get("title", "")
        body = pr.get("body") or ""
        user = pr.get("user", {}).get("login", "unknown")
        merged_at = pr.get("merged_at") or pr.get("updated_at", "")

        # Check keyword filter
        text_to_check = (title + " " + body).lower()
        if any(kw in text_to_check for kw in CONFIG_KEYWORDS):
            summary = f"GitHub PR #{pr_number} by @{user} (Merged: {merged_at}):\n"
            summary += f"Title: {title}\n"
            summary += f"PR Description:\n{body[:2000]}\n"
            chunks.append(summary.strip())

    for chunk in chunks:
        await remember_content(chunk, dataset_name=dataset)

    return len(chunks)

async def get_incident_reports(folder_path: str, service_name: str) -> int:
    """
    Scans a folder for markdown/text files (.md, .txt).
    Reads content and calls remember_content(..., dataset_name=incidents_{service}).
    """
    if not os.path.exists(folder_path):
        print(f"⚠️ Incident folder not found: {folder_path}")
        return 0

    dataset = f"incidents_{service_name}"
    count = 0

    for root, _, files in os.walk(folder_path):
        for file in files:
            if file.endswith((".md", ".txt", ".log")):
                fpath = os.path.join(root, file)
                try:
                    with open(fpath, "r", encoding="utf-8", errors="replace") as f:
                        content = f.read().strip()
                    if content:
                        report_text = f"=== PRODUCTION INCIDENT REPORT ({file}) ===\n{content}"
                        await remember_content(report_text, dataset_name=dataset)
                        count += 1
                except Exception as e:
                    print(f"⚠️ Failed reading incident file {file}: {e}")

    return count

def parse_env_file(file_path: str) -> List[str]:
    """
    Reads a .env or config file and returns a list of key names
    (ignoring comments and empty lines).
    """
    if not os.path.exists(file_path):
        return []

    keys = []
    try:
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                # Match KEY=value or export KEY=value or KEY : value
                if "=" in line:
                    key = line.split("=")[0].replace("export ", "").strip()
                    if re.match(r"^[A-Za-z0-9_]+$", key):
                        keys.append(key)
                elif ":" in line:
                    key = line.split(":")[0].strip()
                    if re.match(r"^[A-Za-z0-9_]+$", key):
                        keys.append(key)
    except Exception as e:
        print(f"⚠️ Error parsing env file {file_path}: {e}")

    return keys
