// models/analyticsDashboardModel.js
import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema({
  monthKey: { type: String, required: true, unique: true }, // "2025-04"
  totalRevenue: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  totalUsers: { type: Number, default: 0 },
  uniqueBuyers: { type: Number, default: 0 },
  conversionRate: { type: String, default: "0.00%" },
  growth: {
    revenue: { type: String, default: "0.0%" },
    orders: { type: String, default: "0.0%" },
    users: { type: String, default: "0.0%" },
    conversionRate: { type: String, default: "0.0%" },
  },
  calculatedAt: { type: Date, default: Date.now },
});

const AnalyticsDashboard = mongoose.models.analyticsDashboard || 
  mongoose.model("analyticsDashboard", analyticsSchema);

export default AnalyticsDashboard;