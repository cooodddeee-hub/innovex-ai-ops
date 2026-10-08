from fastapi import FastAPI, Depends, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
from pydantic import BaseModel
import traceback

from app.middleware.auth import verify_service_secret
from app.utils.json_cleaner import sanitize_for_json
from app.engines.inventory_engine import analyze_inventory_data
from app.engines.maintenance_engine import analyze_maintenance_data
from app.engines.logistics_engine import analyze_logistics_data
from app.engines.production_engine import analyze_production_data
from app.engines.reflow_engine import analyze_reflow_data
from app.engines.impact_engine import calculate_unified_business_impact
from app.engines.scenario_engine import simulate_scenario
from app.engines.copilot_engine import answer_copilot_query

app = FastAPI(
    title="AI Operations Optimization Engine",
    description="Python AI/ML Analytical Service for Enterprise B2B AI Operations Platform",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DataRequest(BaseModel):
    records: List[Dict[str, Any]]

class ImpactRequest(BaseModel):
    modules: Dict[str, Any]

class ScenarioRequest(BaseModel):
    scenario_type: str
    parameters: Dict[str, Any]
    baseline_data: Dict[str, Any]

class CopilotRequest(BaseModel):
    query: str
    company_context: Dict[str, Any]

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AI Operations Optimization Service",
        "version": "2.0.0"
    }

@app.post("/inventory/analyze", dependencies=[Depends(verify_service_secret)])
def inventory_analyze(payload: DataRequest):
    try:
        res = analyze_inventory_data(payload.records)
        return sanitize_for_json(res)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/maintenance/analyze", dependencies=[Depends(verify_service_secret)])
def maintenance_analyze(payload: DataRequest):
    try:
        res = analyze_maintenance_data(payload.records)
        return sanitize_for_json(res)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/logistics/analyze", dependencies=[Depends(verify_service_secret)])
def logistics_analyze(payload: DataRequest):
    try:
        res = analyze_logistics_data(payload.records)
        return sanitize_for_json(res)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/production/material-consumption/analyze", dependencies=[Depends(verify_service_secret)])
def production_analyze(payload: DataRequest):
    try:
        res = analyze_production_data(payload.records)
        return sanitize_for_json(res)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/reflow/analyze", dependencies=[Depends(verify_service_secret)])
def reflow_analyze(payload: DataRequest):
    try:
        res = analyze_reflow_data(payload.records)
        return sanitize_for_json(res)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/impact/analyze", dependencies=[Depends(verify_service_secret)])
def impact_analyze(payload: ImpactRequest):
    try:
        res = calculate_unified_business_impact(payload.modules)
        return sanitize_for_json(res)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/scenarios/analyze", dependencies=[Depends(verify_service_secret)])
def scenario_analyze(payload: ScenarioRequest):
    try:
        res = simulate_scenario(payload.scenario_type, payload.parameters, payload.baseline_data)
        return sanitize_for_json(res)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/copilot/query", dependencies=[Depends(verify_service_secret)])
def copilot_query(payload: CopilotRequest):
    try:
        res = answer_copilot_query(payload.query, payload.company_context)
        return sanitize_for_json(res)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
