import numpy as np

def calculate_unified_business_impact(module_results):
    """
    Consolidates analysis outputs from Inventory, Maintenance, Logistics, Production, and ReFlow
    into a unified enterprise risk & financial impact score.
    """
    total_financial_impact = 0.0
    impact_items = []
    has_cost_data = False
    
    total_risk_points = 0.0
    max_risk_points = 0.0
    
    # 1. Inventory Risks
    inv_res = module_results.get("inventory", {})
    if inv_res.get("has_sufficient_data"):
        inv_cost = inv_res.get("total_estimated_impact", 0.0)
        if inv_cost > 0:
            has_cost_data = True
            total_financial_impact += inv_cost
        
        for r in inv_res.get("risks", []):
            impact_items.append({
                "module": "Inventory & Demand",
                "entity": r.get("product"),
                "risk_type": r.get("risk_type"),
                "severity": r.get("severity"),
                "financial_impact": r.get("potential_impact"),
                "evidence": r.get("evidence")
            })
            total_risk_points += 20 if r.get("severity") == "High" else 10
            max_risk_points += 20
            
    # 2. Predictive Maintenance Risks
    maint_res = module_results.get("maintenance", {})
    if maint_res.get("has_sufficient_data"):
        for m in maint_res.get("machines", []):
            if m.get("status") in ["Warning", "Degraded", "Critical"]:
                sev = "Critical" if m.get("status") == "Critical" else ("High" if m.get("status") == "Degraded" else "Medium")
                downtime_est = 15000.0 if m.get("criticality") == "Critical" else 5000.0
                has_cost_data = True
                total_financial_impact += downtime_est
                
                impact_items.append({
                    "module": "Predictive Maintenance",
                    "entity": m.get("machine_id"),
                    "risk_type": f"Failure Risk ({m.get('status')})",
                    "severity": sev,
                    "financial_impact": f"${downtime_est:,.2f} potential downtime",
                    "evidence": m.get("explanation")
                })
                total_risk_points += 30 if sev == "Critical" else (20 if sev == "High" else 10)
                max_risk_points += 30

    # 3. Production Material Variance Risks
    prod_res = module_results.get("production", {})
    if prod_res.get("has_sufficient_data"):
        prod_cost = prod_res.get("total_excess_cost", 0.0)
        if prod_cost > 0:
            has_cost_data = True
            total_financial_impact += prod_cost
            
        for a in prod_res.get("active_alerts", []):
            impact_items.append({
                "module": "Production Intelligence",
                "entity": f"Batch {a.get('batch_id')} ({a.get('material')})",
                "risk_type": "Material Over-consumption",
                "severity": a.get("severity"),
                "financial_impact": a.get("estimated_excess_cost"),
                "evidence": f"Variance of {a.get('variance_percentage')} in department {a.get('department')}"
            })
            total_risk_points += 25 if a.get("severity") == "Critical" else 15
            max_risk_points += 25

    # 4. ReFlow Process Leakage Risks
    reflow_res = module_results.get("reflow", {})
    if reflow_res.get("has_sufficient_data"):
        rf_cost = reflow_res.get("total_rework_cost", 0.0)
        if rf_cost > 0:
            has_cost_data = True
            total_financial_impact += rf_cost
            
        for dept, stats in reflow_res.get("department_summary", {}).items():
            if stats.get("rework_cost", 0) > 300:
                impact_items.append({
                    "module": "ReFlow AI",
                    "entity": f"Department {dept}",
                    "risk_type": "Process Error Concentration",
                    "severity": "High" if stats.get("rework_cost") > 600 else "Medium",
                    "financial_impact": f"${stats.get('rework_cost'):,.2f} rework cost",
                    "evidence": f"{stats.get('error_count')} process errors resulting in {stats.get('rework_hours'):.1f} hours rework."
                })
                total_risk_points += 15
                max_risk_points += 15

    # 5. Logistics Delivery Risks
    log_res = module_results.get("logistics", {})
    if log_res.get("has_sufficient_data"):
        for l_risk in log_res.get("late_delivery_risks", []):
            impact_items.append({
                "module": "Logistics Optimization",
                "entity": f"Order {l_risk.get('order_id')}",
                "risk_type": "Late Delivery Risk",
                "severity": l_risk.get("priority"),
                "financial_impact": "SLA breach penalty",
                "evidence": l_risk.get("risk")
            })
            total_risk_points += 20 if l_risk.get("priority") in ["Critical", "High"] else 10
            max_risk_points += 20

    impact_score = min(100, int(round((total_risk_points / (max_risk_points if max_risk_points > 0 else 100)) * 100))) if max_risk_points > 0 else 25
    
    if impact_score >= 75:
        impact_level = "Critical"
    elif impact_score >= 50:
        impact_level = "High"
    elif impact_score >= 25:
        impact_level = "Medium"
    else:
        impact_level = "Low"

    return {
        "impact_score": impact_score,
        "impact_level": impact_level,
        "has_cost_data": has_cost_data,
        "total_estimated_financial_impact": round(total_financial_impact, 2) if has_cost_data else None,
        "financial_impact_display": f"${total_financial_impact:,.2f}" if has_cost_data else "Financial impact unavailable because unit cost/cost data is not available.",
        "impact_items_count": len(impact_items),
        "impact_items": impact_items,
        "confidence": "90%",
        "data_quality": "High"
    }
