import {
  FaChartLine,
  FaUsers,
  FaShoppingCart,
  FaDollarSign,
} from "react-icons/fa";
import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { MdTrendingUp, MdTrendingDown } from "react-icons/md";
import axios from "axios";
import { serverUrl } from "../../config";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, Bar, BarChart } from "recharts";

// Fake data generator for testing
// const generateMockData = (year, month) => {
//   const daysInMonth = new Date(year, month, 0).getDate();
//   return Array.from({ length: daysInMonth }, (_, i) => {
//     const day = i + 1;
//     const baseOrders = 600 + Math.random() * 400;
//     const isWeekend = new Date(year, month - 1, day).getDay() === 0 || new Date(year, month - 1, day).getDay() === 6;
//     const multiplier = isWeekend ? 1.6 : 1;
//     return {
//       date: `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}`,
//       orders: Math.floor(baseOrders * multiplier + Math.random() * 200),
//       revenue: Math.floor((baseOrders * multiplier + Math.random() * 200) * 320000), // trung bình 320k/đơn
//     };
//   });
// };

const months = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
]

const years = [
  { value: "2025", label: "2025" },
  { value: "2026", label: "2026" },
  { value: "2027", label: "2027" },
  { value: "2028", label: "2028" },
  { value: "2029", label: "2029" },
];

const Analytics = () => {

  // // Set mock data state
  // const [chartData, setChartData] = useState([]);

  // // Update chartData when month or year changes
  // useEffect(() => {
  //   const data = generateMockData(parseInt(selectedYear), parseInt(selectedMonth));
  //   setChartData(data);
  // }, [selectedMonth, selectedYear]);

  const { token } = useSelector((state) => state.auth);

  // Khởi tạo đúng ngay từ đầu
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Tạo monthKey đúng định dạng: "2025-04"
  const monthKey = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    conversionRate: "0.00%",
    growth: { revenue: 0, orders: 0, users: 0, conversionRate: 0 },
    calculatedAt: null,
    loading: false,
    error: null,
  });

  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);

  // Chỉ gọi API khi monthKey đã hợp lệ và token có sẵn
  const fetchStatistics = useCallback(async () => {
    if (!token || !monthKey || monthKey.includes("undefined")) return;

    setStats(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await axios.get(
        `${serverUrl}/api/dashboard/analytics?month=${monthKey}`, // hoặc analytics?month=
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const data = response.data.data;
        setStats({
          totalRevenue: data.totalRevenue || 0,
          totalOrders: data.totalOrders || 0,
          totalUsers: data.totalUsers || 0,
          conversionRate: data.conversionRate || "0.00%",
          growth: data.growth || {},
          calculatedAt: data.calculatedAt || null,
          loading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error("Lỗi lấy thống kê:", error);
      setStats(prev => ({ ...prev, loading: false, error: "Không tải được dữ liệu" }));
    }
  }, [token, monthKey]);

  // Fetch chart data
  const fetchChartData = useCallback(async () => {
    if (!token || !monthKey || monthKey.includes("undefined")) return;

    setChartLoading(true);
    try {
      const [revRes, ordRes] = await Promise.all([
        axios.get(`${serverUrl}/api/dashboard/chart/revenue/${monthKey}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${serverUrl}/api/dashboard/chart/orders/${monthKey}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (revRes.data.success && ordRes.data.success) {
        const merged = revRes.data.data.map((rev, i) => ({
          date: rev.date,
          revenue: rev.revenue || 0,
          orders: ordRes.data.data[i]?.orders || 0
        }));
        setChartData(merged);
      }
    } catch (err) {
      console.error("Lỗi load biểu đồ:", err);
    } finally {
      setChartLoading(false);
    }
  }, [token, monthKey]);

  // Gọi API khi monthKey thay đổi
  useEffect(() => {
    if (monthKey && token) {
      fetchStatistics();
      fetchChartData();
    }
  }, [monthKey, token, fetchStatistics, fetchChartData]);

  // Cập nhật monthKey khi chọn tháng/năm
  useEffect(() => {
  }, [selectedMonth, selectedYear]);

  const statsData = [
    {
      title: "Total Revenue",
      value: stats.totalRevenue
        ? `$${stats.totalRevenue.toLocaleString()}`
        : "$0",
      change: stats.growth.revenue ? `${stats.growth.revenue}%` : "+0.0%",
      trend: stats.growth.revenue >= 0 ? "up" : "down",
      icon: <FaDollarSign />,
      color: stats.growth.revenue >= 0 ? "green" : "red",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders ? stats.totalOrders.toLocaleString() : "0",
      change: stats.growth.orders ? `${stats.growth.orders}%` : "+0.0%",
      trend: stats.growth.orders >= 0 ? "up" : "down",
      icon: <FaShoppingCart />,
      color: stats.growth.orders >= 0 ? "blue" : "red",
    },
    {
      title: "Total Users",
      value: stats.totalUsers ? stats.totalUsers.toLocaleString() : "0",
      change: stats.growth.users ? `${stats.growth.users}%` : "+0.0%",
      trend: stats.growth.users >= 0 ? "up" : "down",
      icon: <FaUsers />,
      color: stats.growth.users >= 0 ? "purple" : "red",
    },
    {
      title: "Conversion Rate",
      value: stats.conversionRate,
      change: stats.conversionRate ? `${stats.conversionRate}` : "N/A",
      trend: stats.growth.conversionRate >= 0 ? "up" : "down",
      icon: <FaChartLine />,
      color: stats.growth.conversionRate >= 0 ? "teal" : "red",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600">
          {"Track your business performance and insights (In monthly view - compared to the previous month - only applied completed orders)."}
        </p>
        <p className="text-sm text-gray-500 mt-2">Last calculated at: {stats.calculatedAt ? new Date(stats.calculatedAt).toLocaleString() : "N/A"}</p>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          {/* Month */}
          <div className="w-full sm:w-48">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 
                 text-sm font-medium text-gray-900 
                 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div className="w-full sm:w-48">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 
                 text-sm font-medium text-gray-900 
                 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              {years.map((year) => (
                <option key={year.value} value={year.value}>
                  {year.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-lg bg-${stat.color}-100 text-${stat.color}-600`}
              >
                {stat.icon}
              </div>
              <div
                className={`flex items-center gap-1 text-sm ${stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
              >
                {stat.trend === "up" ? <MdTrendingUp /> : <MdTrendingDown />}
                {stat.change}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {stat.value}
            </h3>
            <p className="text-gray-600 text-sm">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      {chartLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : chartData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Revenue Chart</h3>
              <span className="text-sm text-gray-500">
                {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `${(value / 1e9).toFixed(1)}tỷ`} />
                <Tooltip
                  formatter={(value) => `${value.toLocaleString()}đ`}
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Order Trends Chart */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Order Trends</h3>
              <span className="text-sm text-gray-500">
                {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => value.toLocaleString()}
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#3b82f6"
                  strokeWidth={4}
                  dot={{ fill: "#3b82f6", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>) : (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>)}
    </div>
  );
};

export default Analytics;
