import { Router } from "express";
import {
  getDashboardStats,
  getQuickStats,
  getAnalyticsByMonth,
  getRevenueDataChart,
  getOrdersDataChart,
} from "../controllers/dashboardController.mjs";
import adminAuth from "../middleware/adminAuth.js";

const router = Router();

const routeValue = "/api/dashboard/";

// Admin dashboard routes
router.get(`${routeValue}stats`, adminAuth, getDashboardStats);
router.get(`${routeValue}quick-stats`, adminAuth, getQuickStats);
router.get(`${routeValue}analytics`, adminAuth, getAnalyticsByMonth);
router.get(`${routeValue}chart/revenue/:month`, adminAuth, getRevenueDataChart);
router.get(`${routeValue}chart/orders/:month`, adminAuth, getOrdersDataChart);
export default router;
