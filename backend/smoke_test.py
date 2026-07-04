import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

import cognee

async def main():
    print("🔥 Starting Cognee smoke test...")
    print(f"LLM Provider: {os.getenv('LLM_PROVIDER')}")
    print(f"LLM Model: {os.getenv('LLM_MODEL')}")
    print(f"Embedding Provider: {os.getenv('EMBEDDING_PROVIDER')}")
    print(f"Embedding Model: {os.getenv('EMBEDDING_MODEL')}")
    print()

    print("Step 1: Clearing existing memory...")
    await cognee.forget(everything=True)
    print("✅ Memory cleared")

    print("Step 2: Ingesting config context via remember()...")
    await cognee.remember(
        "DB_POOL_SIZE was set to 10 on March 14, 2024 after production incident INC-47. "
        "The database server is a t2.micro with 512MB RAM. At connection pool size 20, "
        "the server experienced OOM (out of memory) errors. Load tests confirmed that 10 "
        "is the maximum stable connection count. Engineer jdoe made this change in PR #1042."
    )
    print("✅ Data ingested into knowledge graph")

    print("Step 3: Querying with recall()...")
    results = await cognee.recall(query_text="Why is DB_POOL_SIZE set to 10?")
    print("✅ Recall complete\n")

    print("=" * 50)
    print("RESULTS:")
    print("=" * 50)
    for i, result in enumerate(results):
        print(f"\n[{i+1}] {result}")
    print("=" * 50)

if __name__ == "__main__":
    asyncio.run(main())
