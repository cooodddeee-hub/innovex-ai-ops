def simulate_scenario(scenario_type, parameters, baseline_data):
    """
    Executes what-if simulations based on mathematical model projections.
    Outputs clearly labeled simulation results.
    """
    if not baseline_data or not baseline_data.get("has_sufficient_data"):
        return {
            "has_sufficient_data": False,
            "message": "Insufficient baseline data for scenario simulation. Please analyze dataset first."
        }
        
    result = {
        "is_simulation": True,
        "scenario_type": scenario_type,
        "parameters": parameters,
        "baseline_summary": {},
        "simulated_summary": {},
        "delta": {},
        "recommendation": ""
    }
    
    if scenario_type == "maintenance":
        delay_hours = float(parameters.get("delay_hours", 24))
        load_change_pct = float(parameters.get("load_change_pct", 0))
        
        m_list = baseline_data.get("machines", [])
        crit_machines = [m for m in m_list if m.get("status") in ["Degraded", "Critical"]]
        
        baseline_risk = len(crit_machines)
        simulated_critical_count = baseline_risk
        
        for m in m_list:
            rul = m.get("rul_hours", 40)
            if rul <= delay_hours and m.get("status") not in ["Critical"]:
                simulated_critical_count += 1
                
        risk_increase_pct = round(((simulated_critical_count - baseline_risk) / (baseline_risk if baseline_risk > 0 else 1)) * 100, 1)
        simulated_downtime_cost_increase = (simulated_critical_count - baseline_risk) * 18000.0
        
        result["baseline_summary"] = {
            "critical_degraded_assets": baseline_risk,
            "projected_failure_risk": "Current state"
        }
        result["simulated_summary"] = {
            "critical_degraded_assets": simulated_critical_count,
            "delay_hours": delay_hours,
            "load_change_pct": f"{load_change_pct:+.1f}%",
            "simulated_downtime_cost_impact": f"${simulated_downtime_cost_increase:,.2f}"
        }
        result["delta"] = {
            "additional_high_risk_assets": simulated_critical_count - baseline_risk,
            "risk_elevation_percentage": f"{risk_increase_pct:+.1f}%",
            "estimated_financial_delta": f"${simulated_downtime_cost_increase:,.2f}"
        }
        result["recommendation"] = f"Delaying maintenance by {delay_hours} hours elevates asset failure probability significantly. Maintenance window should be executed as scheduled."
        
    elif scenario_type == "inventory":
        proc_increase_pct = float(parameters.get("procurement_increase_pct", 20))
        
        products = baseline_data.get("products", [])
        baseline_stockout = baseline_data.get("stockout_risk_count", 0)
        
        simulated_stockouts = max(0, int(round(baseline_stockout * (1.0 - (proc_increase_pct / 100.0)))))
        working_capital_impact = round(baseline_data.get("total_estimated_impact", 5000.0) * (proc_increase_pct / 100.0), 2)
        
        result["baseline_summary"] = {
            "stockout_risk_count": baseline_stockout,
            "excess_inventory_count": baseline_data.get("excess_inventory_count", 0)
        }
        result["simulated_summary"] = {
            "stockout_risk_count": simulated_stockouts,
            "procurement_increase": f"{proc_increase_pct:+.1f}%",
            "additional_working_capital_required": f"${working_capital_impact:,.2f}"
        }
        result["delta"] = {
            "stockout_risk_reduction": baseline_stockout - simulated_stockouts,
            "working_capital_delta": f"${working_capital_impact:,.2f}"
        }
        result["recommendation"] = f"Increasing procurement by {proc_increase_pct}% reduces stockout risks from {baseline_stockout} to {simulated_stockouts} items, requiring ${working_capital_impact:,.2f} incremental capital."

    elif scenario_type == "production":
        variance_reduction_pct = float(parameters.get("variance_reduction_pct", 10))
        
        curr_excess = baseline_data.get("total_excess_cost", 0.0)
        savings = round(curr_excess * (variance_reduction_pct / 100.0), 2)
        new_excess = round(curr_excess - savings, 2)
        
        result["baseline_summary"] = {
            "current_excess_material_cost": f"${curr_excess:,.2f}"
        }
        result["simulated_summary"] = {
            "target_variance_reduction": f"{variance_reduction_pct:+.1f}%",
            "simulated_excess_material_cost": f"${new_excess:,.2f}",
            "projected_cost_savings": f"${savings:,.2f}"
        }
        result["delta"] = {
            "direct_annual_savings": f"${savings:,.2f}"
        }
        result["recommendation"] = f"Reducing material over-consumption by {variance_reduction_pct}% yields an estimated ${savings:,.2f} direct cost recovery."
        
    elif scenario_type == "reflow":
        rework_reduction_pct = float(parameters.get("rework_reduction_pct", 20))
        
        curr_cost = baseline_data.get("total_rework_cost", 0.0)
        curr_hours = baseline_data.get("total_rework_hours", 0.0)
        
        saved_cost = round(curr_cost * (rework_reduction_pct / 100.0), 2)
        saved_hours = round(curr_hours * (rework_reduction_pct / 100.0), 1)
        
        result["baseline_summary"] = {
            "rework_cost": f"${curr_cost:,.2f}",
            "rework_hours": curr_hours
        }
        result["simulated_summary"] = {
            "rework_cost": f"${curr_cost - saved_cost:,.2f}",
            "rework_hours": round(curr_hours - saved_hours, 1),
            "projected_cost_savings": f"${saved_cost:,.2f}",
            "projected_hours_saved": saved_hours
        }
        result["delta"] = {
            "annual_cost_savings": f"${saved_cost:,.2f}",
            "operational_hours_recovered": saved_hours
        }
        result["recommendation"] = f"A {rework_reduction_pct}% reduction in process rework recovers {saved_hours} operational hours and ${saved_cost:,.2f} annually."
        
    return result
