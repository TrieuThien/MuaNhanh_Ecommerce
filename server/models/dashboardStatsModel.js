// models/dashboardStatsModel.js
import mongoose from "mongoose";

const dashboardStatsSchema = new mongoose.Schema(
  {
    totalUsers: { type: Number, default: 0 },
    totalProducts: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    growth: {
      users: { type: String, default: "0" },
      products: { type: String, default: "0" },
      orders: { type: String, default: "0" },
      revenue: { type: String, default: "0" },
    },
    recentOrders: [{ type: Object }],
    topProducts: [{ type: Object }],
    recentUsers: [{ type: Object }],
    ordersByStatus: [{ _id: String, count: Number }],
    cachedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const DashboardStats = mongoose.models.dashboardStats || mongoose.model("dashboardStats", dashboardStatsSchema);
export default DashboardStats;