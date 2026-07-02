import cognee

async def load_mock_data():
    mock_data = [
        "In PR #1042, author 'jdoe' updated DB_POOL_SIZE from 20 to 10. The commit message was 'fix config for t2.micro db server to prevent OOM'.",
        "Slack thread in #eng-backend on March 14, 2024: 'Hey everyone, the db crashed again. Looks like memory exhaustion. We are running on a t2.micro which has 512MB RAM. If we go above 12 connections, it OOMs. Let's set DB_POOL_SIZE to 10 for now.'",
        "Incident Report INC-47 (March 14, 2024): Production database became unresponsive due to out of memory error. Root cause: connection pool size was 20, exceeding the available RAM on the t2.micro instance. Resolution: DB_POOL_SIZE changed to 10.",
        "In PR #89, author 'asmith' added REQUEST_TIMEOUT with value 30000. PR description: 'External API takes up to 25s under load, adding a 30s timeout to prevent our workers from hanging indefinitely.'",
        "Slack thread in #ops on Jan 10, 2024: 'The external billing API is timing out frequently. Let's set REQUEST_TIMEOUT to 30000 (30s).'"
    ]
    
    print("Loading mock dataset for Config Archaeology...")
    for item in mock_data:
        try:
            # We run in background mode for large datasets, but for this mock we can run synchronously
            await cognee.remember(item, dataset_name="config_archaeology_mock")
        except Exception as e:
            print(f"Error loading mock item: {e}")
    print("Mock data loaded successfully.")
