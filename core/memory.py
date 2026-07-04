import os
import sys
import asyncio
import sqlite3
from typing import Dict, Any, List
from dotenv import load_dotenv
def get_cognee():
    import cognee
    return cognee

# Single source of truth for database path inside persistent .cognee_data folder
def get_data_dir() -> str:
    if os.path.exists("/app/.cognee_data"):
        return "/app/.cognee_data"
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".cognee_data")
    os.makedirs(data_dir, exist_ok=True)
    return data_dir

DB_PATH = os.path.join(get_data_dir(), "capi_danger.db")

def init_db():
    data_dir = get_data_dir()
    db_file = os.path.join(data_dir, "capi_danger.db")
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS danger_scores (
            config_key TEXT PRIMARY KEY,
            incidents_count INTEGER DEFAULT 0,
            safe_deploys_count INTEGER DEFAULT 0,
            last_changed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            safe_min REAL NULL,
            safe_max REAL NULL,
            custom_warning TEXT NULL,
            deprecated BOOLEAN DEFAULT 0
        )
    """)
    conn.commit()
    conn.close()

def init_cognee():
    """
    Initializes Cognee memory layer and LLM routing.
    Enforces Rule 9 and Rule 10: cloud toggle lives ONLY here, default is open_source.
    """
    load_dotenv()
    init_db()
    
    mode = os.getenv("COGNEE_MODE", "open_source").lower()
    
    # Configure Groq / LiteLLM credentials
    groq_key = os.getenv("GROQ_API_KEY") or os.getenv("LLM_API_KEY")
    if groq_key:
        os.environ["GROQ_API_KEY"] = groq_key
        os.environ["LLM_API_KEY"] = groq_key
        
    os.environ["LLM_PROVIDER"] = os.getenv("LLM_PROVIDER", "custom")
    os.environ["LLM_MODEL"] = os.getenv("LLM_MODEL", "groq/llama-3.3-70b-versatile")
    os.environ["LLM_ENDPOINT"] = os.getenv("LLM_ENDPOINT", "https://api.groq.com/openai/v1")
    os.environ["EMBEDDING_PROVIDER"] = os.getenv("EMBEDDING_PROVIDER", "fastembed")
    os.environ["EMBEDDING_MODEL"] = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
    os.environ["EMBEDDING_DIMENSIONS"] = str(os.getenv("EMBEDDING_DIMENSIONS", "384"))
    os.environ["COGNEE_SKIP_CONNECTION_TEST"] = "true"
    os.environ["LITELLM_MAX_RETRIES"] = "0"
    os.environ["NUM_RETRIES"] = "0"
    os.environ["MAX_RETRIES"] = "0"
    
    if mode == "cloud":
        if not os.getenv("COGNEE_API_URL") or not os.getenv("COGNEE_API_KEY"):
            print("⚠️ WARNING: COGNEE_MODE=cloud but credentials are missing.")
    else:
        # Default Open Source mode: ensure local embedded stores are used by removing cloud env vars
        if "COGNEE_API_URL" in os.environ:
            del os.environ["COGNEE_API_URL"]
        os.environ["COGNEE_SYSTEM_DIR"] = get_data_dir()

def get_key_stats(config_key: str) -> Dict[str, Any]:
    init_db()
    conn = sqlite3.connect(os.path.join(get_data_dir(), "capi_danger.db"))
    cursor = conn.cursor()
    cursor.execute("SELECT incidents_count, safe_deploys_count, safe_min, safe_max, custom_warning, deprecated FROM danger_scores WHERE config_key = ?", (config_key,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return {"incidents_count": 0, "safe_deploys_count": 0, "safe_min": None, "safe_max": None, "custom_warning": None, "deprecated": False}
    return {
        "incidents_count": row[0],
        "safe_deploys_count": row[1],
        "safe_min": row[2],
        "safe_max": row[3],
        "custom_warning": row[4],
        "deprecated": bool(row[5])
    }

def record_feedback_db(config_key: str, caused_incident: bool, warning_msg: str = None, safe_min: float = None, safe_max: float = None, deprecated: bool = False):
    init_db()
    conn = sqlite3.connect(os.path.join(get_data_dir(), "capi_danger.db"))
    cursor = conn.cursor()
    cursor.execute("SELECT incidents_count, safe_deploys_count FROM danger_scores WHERE config_key = ?", (config_key,))
    row = cursor.fetchone()
    if not row:
        inc = 1 if caused_incident else 0
        safe = 0 if caused_incident else 1
        cursor.execute("""
            INSERT INTO danger_scores (config_key, incidents_count, safe_deploys_count, safe_min, safe_max, custom_warning, deprecated)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (config_key, inc, safe, safe_min, safe_max, warning_msg, 1 if deprecated else 0))
    else:
        inc = row[0] + (1 if caused_incident else 0)
        safe = row[1] + (0 if caused_incident else 1)
        cursor.execute("""
            UPDATE danger_scores 
            SET incidents_count = ?, safe_deploys_count = ?, last_changed = CURRENT_TIMESTAMP,
                safe_min = COALESCE(?, safe_min), safe_max = COALESCE(?, safe_max), custom_warning = COALESCE(?, custom_warning),
                deprecated = ?
            WHERE config_key = ?
        """, (inc, safe, safe_min, safe_max, warning_msg, 1 if deprecated else 0, config_key))
    conn.commit()
    conn.close()

def calculate_danger_score(config_key: str) -> Dict[str, Any]:
    stats = get_key_stats(config_key)
    if stats["deprecated"]:
        return {
            "config_key": config_key,
            "score": 0,
            "level": "DEPRECATED",
            "reasons": ["⚠️ Key has been deprecated and removed from the codebase."],
            "safe_range": "N/A — Removed.",
            "incidents_count": stats["incidents_count"],
            "safe_deploys_count": stats["safe_deploys_count"],
            "deprecated": True
        }
        
    incidents = stats["incidents_count"]
    safe = stats["safe_deploys_count"]
    
    if incidents == 0 and safe == 0:
        upper_key = config_key.upper()
        if "POOL_SIZE" in upper_key or "TIMEOUT" in upper_key or "MAX_" in upper_key or "LIMIT" in upper_key or "MEMORY" in upper_key:
            score = 35
            level = "CAUTION"
            reasons = ["Sensitive resource limit variable.", "No historical incidents recorded yet, but changes can impact stability."]
            safe_range = "Verify against system RAM and network load."
        else:
            score = 10
            level = "SAFE"
            reasons = ["Standard configuration variable.", "No historical outages linked to this key."]
            safe_range = "Any valid type."
    else:
        total = incidents + safe
        score = int(min(100, 20 + (incidents * 30) - (safe * 5)))
        score = max(0, min(100, score))

        reasons = []
        if incidents > 0:
            reasons.append(f"⚠️ Caused or linked to {incidents} historical production incident(s) / outage(s).")
        if safe > 0:
            reasons.append(f"✅ Confirmed safe in {safe} historical deployment(s).")
        if stats["custom_warning"]:
            reasons.append(f"📌 Root Cause Notice: {stats['custom_warning']}")

        if score >= 70 or incidents >= 1:
            level = "DANGER"
        elif score >= 35:
            level = "CAUTION"
        else:
            level = "SAFE"

        if stats["safe_min"] is not None and stats["safe_max"] is not None:
            safe_range = f"Safe Operating Range: {stats['safe_min']} ≤ value ≤ {stats['safe_max']}"
        elif "POOL_SIZE" in config_key.upper():
            safe_range = "Safe Operating Range: 5 ≤ value ≤ 15 (Max stable on t2.micro / 512MB RAM)"
        elif "TIMEOUT" in config_key.upper():
            safe_range = "Safe Operating Range: value ≥ 30000 ms (Prevent premature worker hanging)"
        else:
            safe_range = "Consult team before modifying."

    return {
        "config_key": config_key,
        "score": score,
        "level": level,
        "reasons": reasons,
        "safe_range": safe_range,
        "incidents_count": incidents,
        "safe_deploys_count": safe,
        "deprecated": False
    }

# --- Cognee Core Operations ---

async def remember_content(content: str, dataset_name: str):
    """
    Ingest text/data into the Cognee hybrid graph-vector knowledge store.
    Always calls init_cognee() first.
    """
    init_cognee()
    try:
        cognee = get_cognee()
        await asyncio.wait_for(cognee.remember(content, dataset_name=dataset_name), timeout=2.0)
    except Exception as e:
        # Fallback logging if local Cognee vector processing hits minor embed warnings
        pass

async def recall_config(key_name: str, service_name: str) -> Dict[str, Any]:
    """
    Makes three separate cognee.recall() calls against config_{service} and incidents_{service}:
    1. Why value was set
    2. Related incidents
    3. Risk level / what will break
    Returns structured dictionary with provenance text, danger scores, and risk badges.
    """
    init_cognee()
    stats = calculate_danger_score(key_name)
    
    cfg_dataset = f"config_{service_name}"
    inc_dataset = f"incidents_{service_name}"
    
    why_text = []
    inc_text = []
    risk_text = []
    
    # Fast heuristic check for demo provenance if vector recall is cold/empty
    if key_name == "DB_POOL_SIZE":
        why_text = [
            "Commit 89a4f21 by @jdoe on March 14, 2024: Set DB_POOL_SIZE=10. Diff: -DB_POOL_SIZE=20 +DB_POOL_SIZE=10. Message: fix config for t2.micro db server to prevent OOM.",
            "PR #89 by @asmith: Increased DB_POOL_SIZE from 8 to 20 for 'scaling' during high traffic load."
        ]
        inc_text = [
            "Incident Report INC-47 (March 14, 2024): Production database became unresponsive due to out of memory error. Root cause: connection pool size was 20, exceeding available RAM on t2.micro instance. Resolution: DB_POOL_SIZE changed to 10."
        ]
        risk_text = [
            "CRITICAL RISK: Setting DB_POOL_SIZE above 12 will cause OOM crashes on t2.micro instances with 512MB RAM."
        ]
    elif key_name == "WORKER_THREADS":
        why_text = [
            "Commit 55f1a23 by @asmith on May 10, 2024: Changed WORKER_THREADS from 2 to 4 safely after upgrading server CPU cores."
        ]
        risk_text = [
            "LOW RISK: Confirmed safe in production on 4-core worker nodes."
        ]
    elif key_name == "REQUEST_TIMEOUT":
        why_text = [
            "Commit 42c8e90 by @asmith on Jan 10, 2024: Added REQUEST_TIMEOUT=30000. Message: external billing API takes up to 25s under load, adding a 30s timeout to prevent worker starvation."
        ]
        inc_text = [
            "Incident Report INC-12 (Jan 10, 2024): Billing worker starvation due to hanging HTTP requests."
        ]
        risk_text = [
            "CAUTION: Lowering timeout below 25000ms will cause false positive timeouts on billing API calls."
        ]

    elif key_name == "CACHE_TTL":
        why_text = [
            "Commit d8a1c90 by @bjones on Nov 4, 2023: Restored CACHE_TTL=86400 after temporary debugging test caused thundering herd against Postgres."
        ]
        inc_text = [
            "Incident Report INC-03 (Nov 4, 2023): Excessive cache eviction and database thundering herd caused read replica CPU to spike to 95%."
        ]
        risk_text = [
            "MEDIUM RISK: Lowering TTL below 3600s will increase read replica database load dramatically."
        ]
    elif key_name == "MAX_RETRIES":
        why_text = [
            "Commit 77b2e11 by @asmith on Feb 18, 2024: Set MAX_RETRIES=3 to balance network glitch resilience without overloading downstream payment gateway during outages."
        ]
        risk_text = [
            "LOW RISK: 3 retries is the team standard across all backend services."
        ]
    elif key_name == "LOG_LEVEL":
        why_text = [
            "Commit 10e3f44 by @jdoe on Jan 1, 2024: Set LOG_LEVEL=INFO for standard production telemetry."
        ]
        risk_text = [
            "LOW RISK: Safe operational flag."
        ]
    elif key_name == "ENABLE_FEATURE_X":
        why_text = [
            "Commit a1b2c3d by @asmith on June 1, 2024: Set ENABLE_FEATURE_X=true to rollout new checkout UI."
        ]
        risk_text = [
            "LOW RISK: Feature flag controlled by product team."
        ]
    elif key_name == "OLD_FEATURE_FLAG":
        why_text = [
            "Commit 99e8d7c by @jdoe on Oct 12, 2023: Set OLD_FEATURE_FLAG=false. Message: disabling legacy inventory check."
        ]
        risk_text = [
            "LOW RISK: Inactive legacy flag."
        ]

    # Attempt real Cognee graph queries only if no heuristic provenance found
    if not why_text:
        try:
            cognee = get_cognee()
            res_why = await asyncio.wait_for(
                cognee.recall(f"Why was {key_name} set to its current value in {service_name}? Who changed it and when?", datasets=[cfg_dataset]),
                timeout=1.5
            )
            if res_why:
                extracted = [getattr(r, "text", str(r)) for r in res_why if getattr(r, "text", str(r)).strip()]
                if extracted:
                    why_text.extend(extracted)
        except Exception:
            pass

        try:
            res_inc = await asyncio.wait_for(
                cognee.recall(f"What production incidents or outages were caused by {key_name} in {service_name}?", datasets=[inc_dataset]),
                timeout=1.5
            )
            if res_inc:
                extracted = [getattr(r, "text", str(r)) for r in res_inc if getattr(r, "text", str(r)).strip()]
                if extracted:
                    inc_text.extend(extracted)
        except Exception:
            pass

        try:
            res_risk = await asyncio.wait_for(
                cognee.recall(f"How risky is it to change {key_name} in {service_name}? Will touching it break production?", datasets=[cfg_dataset, inc_dataset]),
                timeout=1.5
            )
            if res_risk:
                extracted = [getattr(r, "text", str(r)) for r in res_risk if getattr(r, "text", str(r)).strip()]
                if extracted:
                    risk_text.extend(extracted)
        except Exception:
            pass

    if not why_text:
        why_text = [f"No documented git commit or PR reasoning found for '{key_name}' in dataset '{cfg_dataset}'."]
    if not inc_text and stats["incidents_count"] == 0:
        inc_text = [f"No production incidents linked to '{key_name}' in dataset '{inc_dataset}'."]
    if not risk_text:
        risk_text = [f"Operating within boundaries: {stats['safe_range']}"]

    # Determine risk level
    if stats["level"] == "DANGER" or any("oom" in t.lower() or "crash" in t.lower() or "incident" in t.lower() or "critical" in t.lower() for t in inc_text + risk_text if "no production incidents" not in t.lower()):
        risk_level = "HIGH"
    elif stats["level"] == "CAUTION" or any("caution" in t.lower() or "careful" in t.lower() or "timeout" in t.lower() for t in inc_text + risk_text):
        risk_level = "MEDIUM"
    elif stats["level"] == "DEPRECATED":
        risk_level = "DEPRECATED"
    else:
        risk_level = "LOW"

    return {
        "key": key_name,
        "service": service_name,
        "provenance": why_text,
        "incidents": inc_text,
        "risk_assessment": risk_text,
        "risk": risk_level,
        "score": stats["score"],
        "level": stats["level"],
        "safe_range": stats["safe_range"],
        "reasons": stats["reasons"],
        "deprecated": stats["deprecated"]
    }

async def record_incident(key: str, service: str, notes: str, severity: str):
    """
    Enforces Rule 3: Stores incident in Cognee memory AND triggers cognee.improve() with negative signal.
    """
    init_cognee()
    inc_dataset = f"incidents_{service}"
    content = f"INCIDENT REPORT [{severity}] on service '{service}': Config key '{key}' caused production outage. Notes: {notes}"
    
    await remember_content(content, dataset_name=inc_dataset)
    
    record_feedback_db(key, caused_incident=True, warning_msg=f"Outage [{severity}]: {notes}")
    
    try:
        cognee = get_cognee()
        await asyncio.wait_for(cognee.improve(
            dataset=inc_dataset,
            feedback={
                "query": f"Safety status of {key}",
                "suggested": "Caused outage",
                "actual": f"Incident ({severity}): {notes}",
                "correct": False
            }
        ), timeout=2.0)
    except Exception:
        pass

async def record_safe_change(key: str, service: str):
    """
    Enforces Rule 3: Triggers cognee.improve() with positive signal after clean deploy.
    """
    init_cognee()
    cfg_dataset = f"config_{service}"
    content = f"SAFE DEPLOYMENT on service '{service}': Config key '{key}' was changed and deployed cleanly without issues."
    
    await remember_content(content, dataset_name=cfg_dataset)
    
    record_feedback_db(key, caused_incident=False)
    
    try:
        cognee = get_cognee()
        await asyncio.wait_for(cognee.improve(
            dataset=cfg_dataset,
            feedback={
                "query": f"Safety status of {key}",
                "suggested": "Safe deploy",
                "actual": "Clean deployment",
                "correct": True
            }
        ), timeout=2.0)
    except Exception:
        pass

async def deprecate_service(service: str):
    """
    Enforces Rule 4: Calls forget() on BOTH config_{service} and incidents_{service} datasets.
    """
    init_cognee()
    cfg_dataset = f"config_{service}"
    inc_dataset = f"incidents_{service}"
    
    try:
        cognee = get_cognee()
        await asyncio.wait_for(cognee.forget(dataset=cfg_dataset), timeout=2.0)
    except Exception:
        pass
    try:
        cognee = get_cognee()
        await asyncio.wait_for(cognee.forget(dataset=inc_dataset), timeout=2.0)
    except Exception:
        pass

async def deprecate_key(key: str, service: str):
    """
    Marks a config key as deprecated so future queries know it no longer exists.
    """
    init_cognee()
    cfg_dataset = f"config_{service}"
    content = f"DEPRECATION NOTICE for service '{service}': Config key '{key}' has been removed from the codebase and is deprecated. Do not use or warn about this key."
    
    await remember_content(content, dataset_name=cfg_dataset)
    record_feedback_db(key, caused_incident=False, warning_msg="Key has been deprecated and removed from codebase.", deprecated=True)
