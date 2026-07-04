import os
import sqlite3
import asyncio
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from core.memory import recall_config, record_incident, record_safe_change, get_data_dir, init_cognee

router = APIRouter()

class QueryRequest(BaseModel):
    key: str
    service: str = "payments-api"

class IncidentRequest(BaseModel):
    key: str
    service: str = "payments-api"
    notes: str
    severity: str = "P2"

class SafeRequest(BaseModel):
    key: str
    service: str = "payments-api"

@router.get("/")
async def health_check():
    """
    Health check endpoint returning Capi engine status and Cognee mode.
    """
    mode = os.getenv("COGNEE_MODE", "open_source").lower()
    return {
        "status": "Capi engine running",
        "cognee_mode": mode,
        "service": "Capi Config Archaeology Layer"
    }

@router.post("/query")
async def query_config(req: QueryRequest):
    """
    Query Cognee knowledge graph for the origin, provenance, and historical risks of a configuration variable.
    """
    try:
        res = await recall_config(key_name=req.key, service_name=req.service)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/incident")
async def report_incident(req: IncidentRequest):
    """
    Record a production incident or outage caused by a config variable.
    Enforces Rule 3: Triggers cognee.improve() negative feedback loop immediately.
    """
    try:
        await record_incident(key=req.key, service=req.service, notes=req.notes, severity=req.severity)
        return {
            "status": "success",
            "message": f"Recorded {req.severity} incident for {req.key} on {req.service}. Negative feedback loop triggered.",
            "key": req.key,
            "severity": req.severity
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/safe")
async def report_safe(req: SafeRequest):
    """
    Record a successful, clean deployment of a config variable.
    Enforces Rule 3: Triggers cognee.improve() positive feedback loop immediately.
    """
    try:
        await record_safe_change(key=req.key, service=req.service)
        return {
            "status": "success",
            "message": f"Recorded safe deployment for {req.key} on {req.service}. Positive feedback loop triggered.",
            "key": req.key
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/graph")
async def get_knowledge_graph(service: str = Query("payments-api", description="Service name to generate graph for")):
    """
    Returns D3-compatible JSON structure {'nodes': [...], 'links': [...]} representing config keys, PRs, commits, and incidents stored in that service's graph.
    """
    # Initialize base nodes for known variables in demo / architecture
    nodes = []
    links = []
    
    # 1. Add config variables
    variables = [
        {"id": "DB_POOL_SIZE", "label": "DB_POOL_SIZE", "group": "config", "val": 25, "status": "DANGER", "score": 50},
        {"id": "REQUEST_TIMEOUT", "label": "REQUEST_TIMEOUT", "group": "config", "val": 20, "status": "DANGER", "score": 35},
        {"id": "MAX_RETRIES", "label": "MAX_RETRIES", "group": "config", "val": 20, "status": "DANGER", "score": 45},
        {"id": "CACHE_TTL", "label": "CACHE_TTL", "group": "config", "val": 15, "status": "SAFE", "score": 10},
        {"id": "WORKER_THREADS", "label": "WORKER_THREADS", "group": "config", "val": 15, "status": "SAFE", "score": 10},
        {"id": "LOG_LEVEL", "label": "LOG_LEVEL", "group": "config", "val": 15, "status": "SAFE", "score": 10},
        {"id": "ENABLE_FEATURE_X", "label": "ENABLE_FEATURE_X", "group": "config", "val": 15, "status": "SAFE", "score": 10},
        {"id": "OLD_FEATURE_FLAG", "label": "OLD_FEATURE_FLAG", "group": "config", "val": 10, "status": "DEPRECATED", "score": 0}
    ]
    
    # Update scores from live SQLite danger database if available
    try:
        db_path = os.path.join(get_data_dir(), "capi_danger.db")
        if os.path.exists(db_path):
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT key_name, score, caused_incident, warning_msg, deprecated FROM danger_scores")
            rows = cursor.fetchall()
            db_scores = {r[0]: {"score": r[1], "inc": r[2], "msg": r[3], "dep": r[4]} for r in rows}
            conn.close()
            
            for v in variables:
                k = v["id"]
                if k in db_scores:
                    s = db_scores[k]["score"]
                    v["score"] = s
                    if db_scores[k]["dep"]:
                        v["status"] = "DEPRECATED"
                    elif s >= 40:
                        v["status"] = "DANGER"
                    elif s >= 20:
                        v["status"] = "CAUTION"
                    else:
                        v["status"] = "SAFE"
    except Exception:
        pass

    nodes.extend(variables)
    
    # 2. Add historical commit and PR provenance nodes
    provenance = [
        {"id": "commit_89a4f21", "label": "Commit 89a4f21 (@jdoe): Set pool size to 10 for t2.micro", "group": "commit", "val": 12, "target": "DB_POOL_SIZE"},
        {"id": "pr_89", "label": "PR #89 (@asmith): Increased pool to 20 for load", "group": "pr", "val": 12, "target": "DB_POOL_SIZE"},
        {"id": "commit_55f1a23", "label": "Commit 55f1a23 (@asmith): WORKER_THREADS 2->4", "group": "commit", "val": 10, "target": "WORKER_THREADS"},
        {"id": "commit_42c8e90", "label": "Commit 42c8e90 (@asmith): REQUEST_TIMEOUT=30000", "group": "commit", "val": 10, "target": "REQUEST_TIMEOUT"},
        {"id": "commit_d8a1c90", "label": "Commit d8a1c90 (@bjones): Restored CACHE_TTL=86400", "group": "commit", "val": 10, "target": "CACHE_TTL"},
        {"id": "commit_77b2e11", "label": "Commit 77b2e11 (@asmith): MAX_RETRIES=3 standard", "group": "commit", "val": 10, "target": "MAX_RETRIES"},
        {"id": "commit_a1b2c3d", "label": "Commit a1b2c3d (@asmith): Rollout UI feature flag", "group": "commit", "val": 10, "target": "ENABLE_FEATURE_X"}
    ]
    
    for p in provenance:
        nodes.append({"id": p["id"], "label": p["label"], "group": p["group"], "val": p["val"]})
        links.append({"source": p["id"], "target": p["target"], "relationship": "MODIFIED_BY"})
        
    # 3. Add production incident nodes
    incidents = [
        {"id": "INC-47", "label": "🚨 INC-47 (P1 Outage): OOM Crash on t2.micro db server", "group": "incident", "val": 18, "target": "DB_POOL_SIZE"},
        {"id": "INC-12", "label": "⚠️ INC-12 (P2 Outage): Billing worker starvation", "group": "incident", "val": 15, "target": "REQUEST_TIMEOUT"}
    ]
    
    for inc in incidents:
        nodes.append({"id": inc["id"], "label": inc["label"], "group": inc["group"], "val": inc["val"]})
        links.append({"source": inc["id"], "target": inc["target"], "relationship": "CAUSED_OUTAGE"})

    return {
        "service": service,
        "nodes": nodes,
        "links": links
    }
