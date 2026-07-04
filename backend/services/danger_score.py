import sqlite3
import os
import asyncio
from typing import Dict, Any, List

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "capi_danger.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS danger_scores (
            config_key TEXT PRIMARY KEY,
            incidents_count INTEGER DEFAULT 0,
            safe_deploys_count INTEGER DEFAULT 0,
            last_changed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            safe_min REAL NULL,
            safe_max REAL NULL,
            custom_warning TEXT NULL
        )
    """)
    conn.commit()
    conn.close()

init_db()

def get_key_stats(config_key: str) -> Dict[str, Any]:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT incidents_count, safe_deploys_count, safe_min, safe_max, custom_warning FROM danger_scores WHERE config_key = ?", (config_key,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return {"incidents_count": 0, "safe_deploys_count": 0, "safe_min": None, "safe_max": None, "custom_warning": None}
    return {
        "incidents_count": row[0],
        "safe_deploys_count": row[1],
        "safe_min": row[2],
        "safe_max": row[3],
        "custom_warning": row[4]
    }

def record_feedback(config_key: str, caused_incident: bool, warning_msg: str = None, safe_min: float = None, safe_max: float = None):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT incidents_count, safe_deploys_count FROM danger_scores WHERE config_key = ?", (config_key,))
    row = cursor.fetchone()
    if not row:
        inc = 1 if caused_incident else 0
        safe = 0 if caused_incident else 1
        cursor.execute("""
            INSERT INTO danger_scores (config_key, incidents_count, safe_deploys_count, safe_min, safe_max, custom_warning)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (config_key, inc, safe, safe_min, safe_max, warning_msg))
    else:
        inc = row[0] + (1 if caused_incident else 0)
        safe = row[1] + (0 if caused_incident else 1)
        cursor.execute("""
            UPDATE danger_scores 
            SET incidents_count = ?, safe_deploys_count = ?, last_changed = CURRENT_TIMESTAMP,
                safe_min = COALESCE(?, safe_min), safe_max = COALESCE(?, safe_max), custom_warning = COALESCE(?, custom_warning)
            WHERE config_key = ?
        """, (inc, safe, safe_min, safe_max, warning_msg, config_key))
    conn.commit()
    conn.close()

def calculate_danger_score(config_key: str) -> Dict[str, Any]:
    """
    Calculates numerical danger score (0-100), risk level (SAFE, CAUTION, DANGER),
    and safe operating boundaries for a configuration key.
    """
    stats = get_key_stats(config_key)
    incidents = stats["incidents_count"]
    safe = stats["safe_deploys_count"]
    
    # Base heuristic calculation
    if incidents == 0 and safe == 0:
        # Check known critical presets from mock / standard archetypes
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
        # Calculate score from incident ratio
        total = incidents + safe
        incident_ratio = incidents / total if total > 0 else 0
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
        "safe_deploys_count": safe
    }

# Pre-seed known hackathon demo values so demo works instantly out of the box
def seed_demo_danger_scores():
    record_feedback("DB_POOL_SIZE", caused_incident=True, warning_msg="Outage INC-47: Setting pool size to 20 caused OOM memory exhaustion on t2.micro (512MB RAM). Max stable connection count is 10.", safe_min=5, safe_max=15)
    record_feedback("REQUEST_TIMEOUT", caused_incident=True, warning_msg="Billing API hanging: External API takes up to 25s under load. Set timeout to 30000ms.", safe_min=30000, safe_max=60000)
    record_feedback("LOG_LEVEL", caused_incident=False, warning_msg="Safe operational flag.", safe_min=None, safe_max=None)

seed_demo_danger_scores()
