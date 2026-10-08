const axios = require('axios');

const AI_SERVICE_URL = process.env.PYTHON_AI_SERVICE_URL || process.env.AI_SERVICE_URL || 'http://localhost:8000';
const AI_SERVICE_SECRET = process.env.AI_SERVICE_SECRET || 'dev-secret-key-change-in-prod-ai-ops-2026';

const aiClient = axios.create({
  baseURL: AI_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-ai-service-secret': AI_SERVICE_SECRET
  },
  timeout: 30000
});

const analyzeInventory = async (records) => {
  const response = await aiClient.post('/inventory/analyze', { records });
  return response.data;
};

const analyzeMaintenance = async (records) => {
  const response = await aiClient.post('/maintenance/analyze', { records });
  return response.data;
};

const analyzeLogistics = async (records) => {
  const response = await aiClient.post('/logistics/analyze', { records });
  return response.data;
};

const analyzeProduction = async (records) => {
  const response = await aiClient.post('/production/material-consumption/analyze', { records });
  return response.data;
};

const analyzeReflow = async (records) => {
  const response = await aiClient.post('/reflow/analyze', { records });
  return response.data;
};

const analyzeImpact = async (modules) => {
  const response = await aiClient.post('/impact/analyze', { modules });
  return response.data;
};

const analyzeScenario = async (scenario_type, parameters, baseline_data) => {
  const response = await aiClient.post('/scenarios/analyze', { scenario_type, parameters, baseline_data });
  return response.data;
};

const queryCopilot = async (query, company_context) => {
  const response = await aiClient.post('/copilot/query', { query, company_context });
  return response.data;
};

module.exports = {
  analyzeInventory,
  analyzeMaintenance,
  analyzeLogistics,
  analyzeProduction,
  analyzeReflow,
  analyzeImpact,
  analyzeScenario,
  queryCopilot
};
