import json
import os
import asyncio
import cognee

def parse_slack_export(json_content_or_filepath: str) -> list[str]:
    """
    Parses Slack export JSON (channel message list or thread export) and formats
    discussions into semantic text chunks for Cognee ingestion.
    """
    if os.path.exists(json_content_or_filepath):
        with open(json_content_or_filepath, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
            except Exception as e:
                raise ValueError(f"Invalid JSON file: {e}")
    else:
        try:
            data = json.loads(json_content_or_filepath)
        except Exception as e:
            raise ValueError(f"Invalid JSON content string: {e}")

    if isinstance(data, dict):
        data = [data]

    chunks = []
    # Slack exports can be list of messages with 'replies' or thread structures
    for msg in data:
        text = msg.get("text", "")
        user = msg.get("user") or msg.get("username", "unknown")
        ts = msg.get("ts", "")
        channel = msg.get("channel", "general")

        # Extract thread replies if present
        replies_text = ""
        if "replies" in msg and isinstance(msg["replies"], list):
            for rep in msg["replies"]:
                rep_user = rep.get("user", "unknown")
                rep_text = rep.get("text", "")
                replies_text += f"\n  - @{rep_user}: {rep_text}"

        # Filter: only include threads that discuss config keywords or numbers
        combined_text = (text + replies_text).upper()
        if any(kw in combined_text for kw in ["CONFIG", "ENV", "_", "POOL", "TIMEOUT", "LIMIT", "RAM", "OOM", "CRASH", "SETTING", "FLAG", "INCIDENT"]):
            summary = f"Slack Discussion in #{channel} (ts: {ts}) initiated by @{user}:\n"
            summary += f"Message: {text}"
            if replies_text:
                summary += f"\nThread Replies:{replies_text}"
            chunks.append(summary.strip())

    return chunks

async def ingest_slack_threads(json_content_or_filepath: str, dataset_name: str = "slack_threads") -> int:
    chunks = parse_slack_export(json_content_or_filepath)
    if not chunks:
        print("ℹ️ No config-related Slack discussions found in JSON.")
        return 0

    print(f"🧠 Ingesting {len(chunks)} Slack thread summaries into Cognee dataset '{dataset_name}'...")
    for idx, chunk in enumerate(chunks, 1):
        print(f"   [{idx}/{len(chunks)}] Ingesting Slack thread...")
        try:
            await cognee.remember(chunk, dataset_name=dataset_name)
        except Exception as e:
            print(f"⚠️ Error ingesting Slack chunk {idx}: {e}")

    print(f"🎉 Slack archaeology ingestion complete for dataset '{dataset_name}'!")
    return len(chunks)
