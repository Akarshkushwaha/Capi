import os
import asyncio
import cognee

def parse_incident_report(content_or_filepath: str) -> str:
    """
    Reads an incident report from a file path or direct string content,
    formatting it with explicit metadata markers for Cognee entity extraction.
    """
    if os.path.exists(content_or_filepath):
        with open(content_or_filepath, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()
        source_name = os.path.basename(content_or_filepath)
    else:
        content = content_or_filepath
        source_name = "Direct Submission"

    formatted = f"=== PRODUCTION INCIDENT POST-MORTEM ({source_name}) ===\n"
    formatted += content.strip()
    return formatted

async def ingest_incident(content_or_filepath: str, dataset_name: str = "incidents") -> bool:
    """
    Ingests an incident report into Cognee to establish causal links between
    config values and system outages.
    """
    report_text = parse_incident_report(content_or_filepath)
    print(f"🧠 Ingesting incident report into Cognee dataset '{dataset_name}'...")
    try:
        await cognee.remember(report_text, dataset_name=dataset_name)
        print(f"✅ Incident report ingested successfully into '{dataset_name}'.")
        return True
    except Exception as e:
        print(f"⚠️ Error ingesting incident report: {e}")
        return False
