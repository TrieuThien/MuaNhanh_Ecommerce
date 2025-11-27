import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import orderModel from "../models/orderModel.js";
import DashboardStats from "../models/dashboardStatsModel.js";
import AnalyticsDashboard from "../models/analyticsDashboardModel.js";

// Get dashboard statistics with caching
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const getDashboardStats = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.json({
        success: false,
        message: "Admin access required",
      });
    }

    // Check if cache is still fresh
    const latestCache = await DashboardStats.findOne().sort({ cachedAt: -1 });

    if (latestCache && Date.now() - latestCache.cachedAt < CACHE_TTL) {
      return res.json({
        success: true,
        stats: latestCache.toObject(),
        cached: true,
        message: "Dashboard stats from cache",
      });
    }

    // If no valid cache, recalculate stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const endOfYesterday = new Date(today);
    endOfYesterday.setMilliseconds(-1);

    const [
      totalUsers,
      totalProducts,
      totalOrders,
      revenueResult,
      totalUsersYesterday,
      totalProductsYesterday,
      totalOrdersYesterday,
      revenueYesterdayAgg,
      recentOrdersRaw,
      topProductsRaw,
      ordersByStatusRaw,
      recentUsersRaw,
    ] = await Promise.all([
      userModel.countDocuments(),
      productModel.countDocuments(),
      orderModel.countDocuments(),
      orderModel.aggregate([
        { $match: { status: { $in: ["delivered", "shipped", "confirmed"] } } },
        { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
      ]),
      userModel.countDocuments({ createdAt: { $lt: today } }),
      productModel.countDocuments({ createdAt: { $lt: today } }),
      orderModel.countDocuments({ date: { $lt: today } }),
      orderModel.aggregate([
        {
          $match: {
            status: { $in: ["delivered", "shipped", "confirmed"] },
            date: { $gte: yesterday, $lte: endOfYesterday },
          },
        },
        { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
      ]),
      orderModel.find({}).populate("userId", "name email").sort({ date: -1 }).limit(5).lean(),
      productModel.find({}).sort({ createdAt: -1 }).limit(5).lean(),
      orderModel.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      userModel.find({}).sort({ createdAt: -1 }).limit(5).select("name email createdAt").lean(),
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;
    const totalRevenueYesterday = revenueYesterdayAgg[0]?.totalRevenue || 0;

    const calcGrowth = (today, yesterday) => {
      if (yesterday === 0) return today > 0 ? 100 : 0;
      return ((today - yesterday) / yesterday) * 100;
    };

    const growth = {
      users: calcGrowth(totalUsers, totalUsersYesterday).toFixed(1),
      products: calcGrowth(totalProducts, totalProductsYesterday).toFixed(1),
      orders: calcGrowth(totalOrders, totalOrdersYesterday).toFixed(1),
      revenue: calcGrowth(totalRevenue, totalRevenueYesterday).toFixed(1),
    };

    const statsData = {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      growth,
      recentOrders: recentOrdersRaw,
      topProducts: topProductsRaw,
      recentUsers: recentUsersRaw,
      ordersByStatus: ordersByStatusRaw,
      cachedAt: new Date(),
    };

    // Lưu vào DB (upsert để tránh tạo nhiều document)
    await DashboardStats.findOneAndUpdate(
      {}, // tìm document đầu tiên (chỉ nên có 1)
      statsData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({
      success: true,
      stats: statsData,
      cached: false,
      message: "Dashboard stats refreshed",
    });
  } catch (error) {
    console.error("Get Dashboard Stats Error:", error);
    res.json({ success: false, message: error.message });
  }
};

// Get analytics data
const SUCCESS_STATUSES = ["delivered"];
const PAID_PAYMENT_STATUS = ["paid"];

const getAnalyticsByMonth = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.json({ success: false, message: "Admin access required" });
    }

    const { month } = req.query; // format: "2025-04"
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.json({ success: false, message: "Invalid month format." });
    }

    const [year, monthNum] = month.split("-").map(Number);
    const startDate = new Date(year, monthNum - 1, 1); // 1/4/2025
    const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999); // 30/4/2025

    const prevMonth = monthNum === 1 
      ? `${year - 1}-12` 
      : `${year}-${String(monthNum - 1).padStart(2, "0")}`;

    // Check cache 
    const cached = await AnalyticsDashboard.findOne({ monthKey: month });
    if (cached.calculatedAt && (Date.now() - cached.calculatedAt.getTime() < CACHE_TTL)) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
        message: `Data for month ${month} (cached)`
      });
    }

    // Calculate current month data
    const currentMonthData = await Promise.all([
      orderModel.aggregate([
        {
          $match: {
            date: { $gte: startDate, $lte: endDate },
            status: { $in: SUCCESS_STATUSES },
            paymentStatus: { $in: PAID_PAYMENT_STATUS }
          }
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$amount" },
            orders: { $sum: 1 }
          }
        }
      ]),
      orderModel.aggregate([
        {
          $match: {
            date: { $gte: startDate, $lte: endDate },
            status: { $in: SUCCESS_STATUSES },
            paymentStatus: { $in: PAID_PAYMENT_STATUS }
          }
        },
        { $group: { _id: "$userId" } },
        { $count: "uniqueBuyers" }
      ]),
      userModel.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      })
    ]);

    const revenueResult = currentMonthData[0][0] || { revenue: 0, orders: 0 };
    const uniqueBuyersResult = currentMonthData[1][0]?.uniqueBuyers || 0;
    const totalUsers = currentMonthData[2];

    const current = {
      totalRevenue: revenueResult.revenue,
      totalOrders: revenueResult.orders,
      totalUsers,
      uniqueBuyers: uniqueBuyersResult,
      conversionRate: totalUsers > 0 ? (uniqueBuyersResult / totalUsers) * 100 : 0
    };

    // Get previous month data for growth calculation
    const prevCached = await AnalyticsDashboard.findOne({ monthKey: prevMonth });
    const prev = prevCached ? {
      totalRevenue: prevCached.totalRevenue,
      totalOrders: prevCached.totalOrders,
      totalUsers: prevCached.totalUsers,
      conversionRate: parseFloat(prevCached.conversionRate)
    } : null;

    const calcGrowth = (curr, prev) => {
      if (!prev || prev === 0) return curr > 0 ? "+100.0" : "0.0";
      const growth = ((curr - prev) / prev) * 100;
      return growth > 0 ? `+${growth.toFixed(1)}` : growth.toFixed(1);
    };

    const growth = prev ? {
      revenue: calcGrowth(current.totalRevenue, prev.totalRevenue),
      orders: calcGrowth(current.totalOrders, prev.totalOrders),
      users: calcGrowth(current.totalUsers, prev.totalUsers),
      conversionRate: calcGrowth(current.conversionRate, prev.conversionRate)
    } : {
      revenue: "0.0", orders: "0.0", users: "0.0", conversionRate: "0.0"
    };

    // Save to DB (only one record per month)
    const analyticsDoc = await AnalyticsDashboard.findOneAndUpdate(
      { monthKey: month },
      {
        monthKey: month,
        totalRevenue: current.totalRevenue,
        totalOrders: current.totalOrders,
        totalUsers: current.totalUsers,
        uniqueBuyers: current.uniqueBuyers,
        conversionRate: current.conversionRate.toFixed(2) + "%",
        growth,
        calculatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: analyticsDoc,
      message: `Calculated & saved data for month ${month}`
    });

  } catch (error) {
    console.error("Analytics Error:", error);
    res.json({ success: false, message: error.message });
  }
};

// Get analytics data for charts
const getRevenueDataChart = async (req, res) => {
  try {
    const { month } = req.params; // format: 2025-04
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      return res.status(400).json({ success: false, message: "Tháng không hợp lệ" });
    }

    const [year, monthNum] = month.split("-").map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999); // cuối tháng

    const revenueByDay = await orderModel.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          status: { $in: ["confirmed", "shipped", "delivered"] },
          paymentStatus: "paid"
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%d/%m", date: "$date" } },
          revenue: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Create a full array of 30/31 days (to avoid gaps on days without orders)
    const daysInMonth = new Date(year, monthNum, 0).getDate();
    const fullData = Array.from({ length: daysInMonth }, (_, i) => {
      const dayStr = `${String(i + 1).padStart(2, "0")}/${String(monthNum).padStart(2, "0")}`;
      const found = revenueByDay.find(item => item._id === dayStr);
      return {
        date: dayStr,
        revenue: found ? found.revenue : 0
      };
    });

    res.json({
      success: true,
      data: fullData,
      meta: { month, totalRevenue: fullData.reduce((sum, d) => sum + d.revenue, 0) }
    });

  } catch (error) {
    console.error("Revenue Chart API Error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

const getOrdersDataChart = async (req, res) => {
  try {
    const { month } = req.params; // 2025-04
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      return res.status(400).json({ success: false, message: "Tháng không hợp lệ" });
    }

    const [year, monthNum] = month.split("-").map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

    const ordersByDay = await orderModel.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          status: { $in: ["confirmed", "shipped", "delivered"] },
          paymentStatus: "paid"
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%d/%m", date: "$date" } },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const daysInMonth = new Date(year, monthNum, 0).getDate();
    const fullData = Array.from({ length: daysInMonth }, (_, i) => {
      const dayStr = `${String(i + 1).padStart(2, "0")}/${String(monthNum).padStart(2, "0")}`;
      const found = ordersByDay.find(item => item._id === dayStr);
      return {
        date: dayStr,
        orders: found ? found.orders : 0
      };
    });

    res.json({
      success: true,
      data: fullData,
      meta: { month, totalOrders: fullData.reduce((sum, d) => sum + d.orders, 0) }
    });

  } catch (error) {
    console.error("Orders Chart API Error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Get quick stats for sidebar
const getQuickStats = async (req, res) => {
  try {
    // Verify admin role
    if (req.user.role !== "admin") {
      return res.json({
        success: false,
        message: "Admin access required for quick statistics",
      });
    }

    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    // Today's sales (sum of today's order amounts)
    const todaysSalesResult = await orderModel.aggregate([
      {
        $match: {
          date: { $gte: startOfDay, $lt: endOfDay },
          status: { $in: ["delivered", "shipped", "confirmed", "pending"] },
        },
      },
      { $group: { _id: null, totalSales: { $sum: "$amount" } } },
    ]);

    const todaysSales =
      todaysSalesResult.length > 0 ? todaysSalesResult[0].totalSales : 0;

    // Today's new orders count
    const todaysOrders = await orderModel.countDocuments({
      date: { $gte: startOfDay, $lt: endOfDay },
    });

    res.json({
      success: true,
      quickStats: {
        todaysSales,
        todaysOrders,
      },
      message: "Quick statistics fetched successfully",
    });
  } catch (error) {
    console.log("Get Quick Stats Error:", error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export { getDashboardStats, getAnalyticsByMonth, getRevenueDataChart, getOrdersDataChart, getQuickStats };
