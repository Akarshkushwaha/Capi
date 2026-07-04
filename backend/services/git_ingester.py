import os
import re
import asyncio
from datetime import datetime
from git import Repo, Commit
import cognee

CONFIG_EXTENSIONS = [
    ".env", ".yaml", ".yml", ".json", ".ini", ".toml", ".conf", ".cfg", ".properties"
]

CONFIG_KEYWORDS = [
    "config", "settings", "constants", "requirements", "package", "docker", "vite", "eslint", "oxlint", "main", "routes", "setup"
]

def is_config_file(file_path: str, patch_content: str = "") -> bool:
    file_name = os.path.basename(file_path).toLowerCase() if hasattr(os.path.basename(file_path), "toLowerCase") else os.path.basename(file_path).lower()
    
    # Check extension
    for ext in CONFIG_EXTENSIONS:
        if file_name.endswith(ext) or ext in file_name:
            return True
            
    # Check keyword in filename
    for kw in CONFIG_KEYWORDS:
        if kw in file_name:
            return True

    # Check if patch content has environment or uppercase config variable definitions
    if patch_content:
        # Match lines like +PORT = 8000 or +export TIMEOUT=30
        if re.search(r"^\+\s*(export\s+)?[A-Z0-9_]{3,}\s*[:=]", patch_content, re.MULTILINE):
            return True

    return False

def extract_git_config_history(repo_path: str = ".", max_commits: int = 50) -> list[str]:
    """
    Scans a Git repository for historical changes to configuration files, variables,
    and settings, returning semantic text summaries of each commit and diff.
    """
    if not os.path.exists(repo_path):
        raise FileNotFoundError(f"Repository path not found: {repo_path}")
    
    try:
        repo = Repo(repo_path, search_parent_directories=True)
    except Exception as e:
        raise RuntimeError(f"Failed to initialize Git repo at {repo_path}: {e}")

    if repo.bare:
        raise RuntimeError(f"Repository at {repo_path} is bare.")

    chunks = []
    print(f"🔍 Scanning git repository at '{repo.working_dir}' for config changes (max {max_commits} commits)...")

    count = 0
    for commit in repo.iter_commits(max_count=max_commits * 5):
        if count >= max_commits:
            break

        parents = commit.parents
        if not parents:
            diffs = commit.diff(git_tree=None, create_patch=True)
        else:
            diffs = commit.diff(parents[0], create_patch=True)

        config_diffs = []
        for diff_item in diffs:
            file_path = diff_item.b_path or diff_item.a_path
            if file_path:
                try:
                    patch = diff_item.diff.decode("utf-8", errors="replace") if diff_item.diff else ""
                    if patch.strip() and is_config_file(file_path, patch):
                        config_diffs.append((file_path, patch))
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
            summary += "Configuration & Variable Modifications:\n"
            for fpath, patch in config_diffs:
                patch_snippet = patch[:1500] + "\n...[truncated]" if len(patch) > 1500 else patch
                summary += f"--- {fpath} ---\n{patch_snippet}\n\n"

            chunks.append(summary.strip())

    print(f"✅ Extracted {len(chunks)} historical config commits from Git history.")
    return chunks

async def ingest_repo_git_history(repo_path: str = ".", max_commits: int = 20, dataset_name: str = "git_history") -> int:
    """
    Extracts git history and feeds it into Cognee knowledge graph.
    """
    chunks = extract_git_config_history(repo_path, max_commits)
    if not chunks:
        print("ℹ️ No configuration file changes found in the scanned commit history.")
        return 0

    print(f"🧠 Ingesting {len(chunks)} git commit summaries into Cognee dataset '{dataset_name}'...")
    for idx, chunk in enumerate(chunks, 1):
        print(f"   [{idx}/{len(chunks)}] Ingesting commit snippet...")
        try:
            await cognee.remember(chunk, dataset_name=dataset_name)
        except Exception as e:
            print(f"⚠️ Error ingesting chunk {idx}: {e}")
            
    print(f"🎉 Git archaeology ingestion complete for dataset '{dataset_name}'!")
    return len(chunks)

if __name__ == "__main__":
    asyncio.run(ingest_repo_git_history("/home/akarsh/Capi", max_commits=10))
