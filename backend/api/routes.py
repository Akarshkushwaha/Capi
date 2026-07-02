from fastapi import APIRouter
from pydantic import BaseModel
import cognee

router = APIRouter()

class IngestRequest(BaseModel):
    content: str
    dataset_name: str | None = None

class FeedbackRequest(BaseModel):
    query: str
    suggested: str
    actual: str
    correct: bool

@router.post("/ingest")
async def ingest_data(req: IngestRequest):
    if req.dataset_name:
        await cognee.remember(req.content, dataset_name=req.dataset_name)
    else:
        await cognee.remember(req.content)
    return {"status": "success", "message": "Data ingested successfully"}

@router.get("/query")
async def query_config(key: str):
    query_str = f"Explain the history and reasoning behind the configuration key {key}. Include any relevant incidents, Slack discussions, and PRs."
    results = await cognee.recall(query_str, datasets=["config_archaeology_mock"])
    return {"status": "success", "data": [str(r) for r in results]}

@router.post("/feedback")
async def submit_feedback(req: FeedbackRequest):
    await cognee.improve(
        feedback={
            "query": req.query,
            "suggested": req.suggested,
            "actual": req.actual,
            "correct": req.correct
        }
    )
    return {"status": "success", "message": "Feedback submitted successfully, graph re-weighted"}

@router.delete("/forget")
async def forget_dataset(dataset_name: str):
    await cognee.forget(dataset=dataset_name)
    return {"status": "success", "message": f"Dataset {dataset_name} forgotten"}
