# Incident Report INC-47: Database Out of Memory (OOM) Outage

**Date:** March 14, 2024  
**Service:** payments-api  
**Severity:** P1 (Critical)  
**Author:** John Smith (@jsmith)  

## Summary
At 14:22 UTC, the production database server for `payments-api` became unresponsive and started rejecting incoming TCP connections. Monitoring dashboards indicated sudden spike in memory consumption followed by Linux OOM Killer terminating the database process.

## Root Cause
An engineer had previously merged PR #89 increasing `DB_POOL_SIZE` from 8 to 20 to support "scaling" during a marketing campaign. However, our database cluster runs on AWS `t2.micro` instances which have only 512MB of RAM. Each Postgres connection consumes roughly 25-30MB of RAM under load. With 20 active connections, memory consumption exceeded 512MB, causing instantaneous OOM crashes.

## Resolution & Prevention
We immediately reduced `DB_POOL_SIZE` from 20 to 10 in commit `89a4f21`. This stabilized memory usage at roughly 320MB (leaving 192MB buffer for OS operations).
**Guardrail:** Setting `DB_POOL_SIZE` above 12 on `t2.micro` instances is extremely dangerous and will result in production outages.
