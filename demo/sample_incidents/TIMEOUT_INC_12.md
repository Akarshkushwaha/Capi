# Incident Report INC-12: Billing Worker Starvation

**Date:** January 10, 2024  
**Service:** payments-api  
**Severity:** P2 (Major)  
**Author:** Alice Smith (@asmith)  

## Summary
During peak traffic hours, HTTP request handlers hung indefinitely when calling our external billing provider. This exhausted the uvicorn worker pool, resulting in HTTP 504 Gateway Timeout errors for all checkout requests.

## Root Cause
The default `REQUEST_TIMEOUT` was set to 5000ms (5s). Under peak load, the external billing API takes up to 25s to process complex transactions. When queries took longer than 5s, client connections dropped or hung while workers remained blocked waiting on socket responses.

## Resolution
In commit `42c8e90`, we increased `REQUEST_TIMEOUT` to 30000 (30 seconds). This ensures workers allow enough time for peak-hour billing validation without starving the pool.
