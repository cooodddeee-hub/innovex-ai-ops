def answer_copilot_query(query, company_context):
    """
    Answers operations copilot queries strictly based on verified platform analysis data.
    """
    query_clean = str(query).lower().strip()
    
    maint_data = company_context.get("maintenance", {})
    inv_data = company_context.get("inventory", {})
    prod_data = company_context.get("production", {})
    reflow_data = company_context.get("reflow", {})
    log_data = company_context.get("logistics", {})
    impact_data = company_context.get("impact", {})
    
    # 1. Machine inspection query
    if "machine" in query_clean and ("inspect" in query_clean or "first" in query_clean or "risk" in query_clean or "critical" in query_clean):
        if not maint_data.get("has_sufficient_data"):
            return {
                "answer": "I don't have enough data to answer that reliably. No predictive maintenance dataset has been uploaded or analyzed yet.",
                "data_source": "Predictive Maintenance Engine",
                "has_sufficient_data": False
            }
        machines = maint_data.get("machines", [])
        criticals = [m for m in machines if m.get("status") in ["Critical", "Degraded"]]
        if criticals:
            top = sorted(criticals, key=lambda x: x.get("risk_score", 0), reverse=True)[0]
            return {
                "answer": f"Asset {top.get('machine_id')} ({top.get('machine_type')}) should be inspected first. It currently has a health score of {top.get('health_score')}/100 and a failure risk score of {top.get('risk_score')}. Explanation: {top.get('explanation')}. Estimated Remaining Useful Life (RUL): {top.get('rul')}.",
                "data_source": "Predictive Maintenance Engine",
                "asset_id": top.get("machine_id"),
                "has_sufficient_data": True
            }
        else:
            return {
                "answer": f"All {len(machines)} monitored assets are currently operating within healthy baseline parameters. No immediate critical inspection is required.",
                "data_source": "Predictive Maintenance Engine",
                "has_sufficient_data": True
            }
            
    # 2. Highest impact operational issue
    if "highest" in query_clean and ("impact" in query_clean or "risk" in query_clean or "issue" in query_clean):
        if impact_data and impact_data.get("impact_items"):
            top_item = impact_data["impact_items"][0]
            fin_str = impact_data.get("financial_impact_display", "High operational impact")
            return {
                "answer": f"The highest operational impact issue is in {top_item.get('module')} for {top_item.get('entity')} ({top_item.get('risk_type')}). Evidence: {top_item.get('evidence')}. Total estimated business impact across modules: {fin_str}.",
                "data_source": "Unified Business Impact Engine",
                "has_sufficient_data": True
            }
        return {
            "answer": "I don't have enough data to answer that reliably. Please run analysis on operational datasets first.",
            "data_source": "Business Impact Engine",
            "has_sufficient_data": False
        }

    # 3. Material over-consumption / Production query
    if "material" in query_clean or "consumption" in query_clean or "waste" in query_clean or "production" in query_clean:
        if not prod_data.get("has_sufficient_data"):
            return {
                "answer": "I don't have enough data to answer that reliably. Production material consumption dataset has not been analyzed.",
                "data_source": "Production Intelligence Engine",
                "has_sufficient_data": False
            }
        excess_cost = prod_data.get("total_excess_cost", 0.0)
        alerts = prod_data.get("active_alerts", [])
        if alerts:
            top_alert = alerts[0]
            return {
                "answer": f"Material over-consumption is highest in batch {top_alert.get('batch_id')} ({top_alert.get('material')}) in department {top_alert.get('department')}, with a variance of {top_alert.get('variance_percentage')}. Total estimated excess material cost across all batches is ${excess_cost:,.2f}.",
                "data_source": "Production Intelligence Engine",
                "has_sufficient_data": True
            }
        return {
            "answer": f"Production material consumption is within standard tolerance limits across all analyzed batches.",
            "data_source": "Production Intelligence Engine",
            "has_sufficient_data": True
        }

    # 4. Inventory stockout query
    if "inventory" in query_clean or "stockout" in query_clean or "stock" in query_clean:
        if not inv_data.get("has_sufficient_data"):
            return {
                "answer": "I don't have enough data to answer that reliably. Inventory & Demand dataset has not been analyzed.",
                "data_source": "Inventory & Demand Engine",
                "has_sufficient_data": False
            }
        risks = [p for p in inv_data.get("products", []) if p.get("stockout_risk") in ["High", "Medium"]]
        if risks:
            p_names = ", ".join([p["product"] for p in risks[:3]])
            return {
                "answer": f"Stockout risk is detected for {len(risks)} product(s): {p_names}. Current stock levels will not cover fulfillment lead times without immediate reordering.",
                "data_source": "Inventory & Demand Engine",
                "has_sufficient_data": True
            }
        return {
            "answer": "All inventory items currently maintain sufficient days of supply relative to lead times.",
            "data_source": "Inventory & Demand Engine",
            "has_sufficient_data": True
        }

    # 5. ReFlow / process rework query
    if "rework" in query_clean or "reflow" in query_clean or "process" in query_clean or "error" in query_clean:
        if not reflow_data.get("has_sufficient_data"):
            return {
                "answer": "I don't have enough data to answer that reliably. ReFlow dataset has not been analyzed.",
                "data_source": "ReFlow AI Engine",
                "has_sufficient_data": False
            }
        total_hrs = reflow_data.get("total_rework_hours", 0)
        total_cost = reflow_data.get("total_rework_cost", 0)
        depts = reflow_data.get("department_summary", {})
        top_dept = sorted(depts.items(), key=lambda x: x[1].get("rework_cost", 0), reverse=True)
        top_str = f" Highest concentration is in department '{top_dept[0][0]}' with ${top_dept[0][1]['rework_cost']:,.2f} rework cost." if top_dept else ""
        return {
            "answer": f"Process errors have accumulated {total_hrs:.1f} hours of rework costing ${total_cost:,.2f}.{top_str}",
            "data_source": "ReFlow AI Engine",
            "has_sufficient_data": True
        }

    # General Fallback
    return {
        "answer": "I can assist you with machine failure risks, material consumption, stockout warnings, logistics risks, and process rework leakage based on your company's uploaded operational datasets. Please ask a specific query regarding maintenance, inventory, production, logistics, or reflow.",
        "data_source": "AI Operations Copilot",
        "has_sufficient_data": True
    }
