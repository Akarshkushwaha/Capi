import os
import requests
import asyncio
import cognee

def fetch_github_prs(repo_name: str, state: str = "closed", limit: int = 10) -> list[str]:
    """
    Fetches merged/closed pull requests from GitHub API for a given repo (e.g. 'owner/repo')
    and extracts PR discussions and config file changes.
    """
    url = f"https://api.github.com/repos/{repo_name}/pulls?state={state}&per_page={limit}&sort=updated&direction=desc"
    headers = {"Accept": "application/vnd.github.v3+json"}
    
    token = os.getenv("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"token {token}"

    print(f"🔍 Fetching GitHub PRs for repository '{repo_name}'...")
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 404:
            print(f"⚠️ Repository '{repo_name}' not found or private.")
            return []
        response.raise_for_status()
        prs = response.json()
    except Exception as e:
        print(f"⚠️ Error fetching PRs from GitHub API: {e}")
        return []

    chunks = []
    for pr in prs:
        if not pr.get("merged_at") and state == "closed":
            # Only focus on merged PRs if looking at closed
            continue
            
        pr_number = pr.get("number")
        title = pr.get("title", "")
        body = pr.get("body") or ""
        user = pr.get("user", {}).get("login", "unknown")
        merged_at = pr.get("merged_at") or pr.get("updated_at", "")

        # Check files modified in this PR
        files_url = pr.get("url") + "/files"
        config_files_touched = []
        try:
            files_res = requests.get(files_url, headers=headers, timeout=10)
            if files_res.status_code == 200:
                for f in files_res.json():
                    filename = f.get("filename", "")
                    if any(p in filename for p in [".env", "config", "settings", "constants", ".yaml", ".yml", ".json", ".ini"]):
                        config_files_touched.append(filename)
        except Exception:
            pass

        # If it touched a config file or explicitly discusses config variables in title/body
        if config_files_touched or any(kw in (title + " " + body).upper() for kw in ["CONFIG", "ENV", "TIMEOUT", "POOL", "LIMIT", "RAM", "OOM"]):
            summary = f"GitHub PR #{pr_number} by @{user} (Merged: {merged_at}):\n"
            summary += f"Title: {title}\n"
            if config_files_touched:
                summary += f"Config Files Modified: {', '.join(config_files_touched)}\n"
            summary += f"PR Description:\n{body[:2000]}\n"
            chunks.append(summary.strip())

    print(f"✅ Extracted {len(chunks)} config-related PRs from '{repo_name}'.")
    return chunks

async def ingest_github_prs(repo_name: str, limit: int = 10, dataset_name: str = "pr_history") -> int:
    chunks = fetch_github_prs(repo_name, limit=limit)
    if not chunks:
        print("ℹ️ No config-related PRs found.")
        return 0

    print(f"🧠 Ingesting {len(chunks)} PR summaries into Cognee dataset '{dataset_name}'...")
    for idx, chunk in enumerate(chunks, 1):
        print(f"   [{idx}/{len(chunks)}] Ingesting PR snippet...")
        try:
            await cognee.remember(chunk, dataset_name=dataset_name)
        except Exception as e:
            print(f"⚠️ Error ingesting PR chunk {idx}: {e}")

    print(f"🎉 PR archaeology ingestion complete for dataset '{dataset_name}'!")
    return len(chunks)

if __name__ == "__main__":
    # Test on a known public repo or mock
    asyncio.run(ingest_github_prs("fastapi/fastapi", limit=5))
