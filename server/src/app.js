const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const companyRoutes = require('./routes/companyRoutes');
const datasetRoutes = require('./routes/datasetRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const riskRoutes = require('./routes/riskRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const alertRoutes = require('./routes/alertRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const logisticsRoutes = require('./routes/logisticsRoutes');
const productionRoutes = require('./routes/productionRoutes');
const reflowRoutes = require('./routes/reflowRoutes');
const scenarioRoutes = require('./routes/scenarioRoutes');
const copilotRoutes = require('./routes/copilotRoutes');

const app = express();

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: [clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(cookieParser());

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/datasets', datasetRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/risks', riskRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/reflow', reflowRoutes);
app.use('/api/scenarios', scenarioRoutes);
app.use('/api/copilot', copilotRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'Node.js Express Backend', timestamp: new Date() });
});

// Centralized error handling
app.use(errorHandler);

module.exports = app;
