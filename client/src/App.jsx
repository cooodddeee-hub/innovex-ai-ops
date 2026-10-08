import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import InventoryPage from './pages/InventoryPage';
import PredictiveMaintenancePage from './pages/PredictiveMaintenancePage';
import MaintenanceCalendarPage from './pages/MaintenanceCalendarPage';
import AssetDigitalTwinPage from './pages/AssetDigitalTwinPage';
import LogisticsPage from './pages/LogisticsPage';
import ProductionPage from './pages/ProductionPage';
import ReflowPage from './pages/ReflowPage';
import RiskCenterPage from './pages/RiskCenterPage';
import RecommendationsPage from './pages/RecommendationsPage';
import BusinessImpactPage from './pages/BusinessImpactPage';
import ScenariosPage from './pages/ScenariosPage';
import DecisionOutcomesPage from './pages/DecisionOutcomesPage';
import CopilotPage from './pages/CopilotPage';
import DatasetsPage from './pages/DatasetsPage';
import DataQualityPage from './pages/DataQualityPage';
import CompanyPage from './pages/CompanyPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Main Command Center Routes */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/operations/inventory" element={<InventoryPage />} />
        <Route path="/operations/maintenance" element={<PredictiveMaintenancePage />} />
        <Route path="/operations/maintenance/calendar" element={<MaintenanceCalendarPage />} />
        <Route path="/operations/maintenance/:id" element={<AssetDigitalTwinPage />} />
        <Route path="/operations/logistics" element={<LogisticsPage />} />
        <Route path="/operations/production" element={<ProductionPage />} />
        <Route path="/operations/reflow" element={<ReflowPage />} />

        <Route path="/intelligence/risks" element={<RiskCenterPage />} />
        <Route path="/intelligence/recommendations" element={<RecommendationsPage />} />
        <Route path="/intelligence/impact" element={<BusinessImpactPage />} />
        <Route path="/intelligence/scenarios" element={<ScenariosPage />} />
        <Route path="/intelligence/outcomes" element={<DecisionOutcomesPage />} />
        <Route path="/intelligence/copilot" element={<CopilotPage />} />

        <Route path="/data/datasets" element={<DatasetsPage />} />
        <Route path="/data/quality" element={<DataQualityPage />} />

        <Route path="/admin/company" element={<CompanyPage />} />
        <Route path="/admin/users" element={<UsersPage />} />
        <Route path="/admin/settings" element={<SettingsPage />} />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
