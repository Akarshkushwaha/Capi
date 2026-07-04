# Incident Report INC-03: Excessive Cache Eviction & Database Thundering Herd

**Date:** November 4, 2023  
**Service:** payments-api  
**Severity:** P3 (Minor)  
**Author:** Bob Jones (@bjones)  

## Summary
Redundant database queries surged by 400%, elevating CPU load on the read replica to 95%.

## Root Cause
`CACHE_TTL` had been temporarily lowered to 600 (10 minutes) during debugging and was accidentally committed to production. With a 10-minute expiration, high-traffic product catalog keys expired simultaneously, causing a thundering herd against Postgres.

## Resolution
Restored `CACHE_TTL` to 86400 (24 hours). This stabilized database read replica CPU at a healthy 18%.
