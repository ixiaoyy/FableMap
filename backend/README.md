# FableMap Backend

Enterprise-style FastAPI backend for the FableMap rebuild.

## Development checks

```powershell
py -3 -m compileall -q backend/src
py -3 -m pytest -q backend/tests --tb=short
```
