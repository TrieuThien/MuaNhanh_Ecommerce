import { use } from "react";
import { FaBoxes, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";
import { MdOutlineInventory, MdLowPriority } from "react-icons/md";
import axios from "axios"
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useState, useEffect, useCallback } from "react";
import { serverUrl } from "../../config";
import Title from "../components/ui/title";


const Inventory = () => {
  const { token } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    inStock: 0,
    loading: true,
    error: null,
  })

  const [lowStockItems, setLowStockItems] = useState([])

  const fetchStatistics = useCallback(async () => {
    try {
      setStats((prev) => ({ ...prev, loading: true, error: null }));

      // Fetch stats data from server
      const responseStats = await axios.get(`${serverUrl}/api/product/inventory-stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (responseStats.data.success) {
        const { inventoryStats } = responseStats.data;

        setStats({
          totalProducts: inventoryStats.totalProducts || 0,
          lowStock: inventoryStats.lowStockItems || 0,
          outOfStock: inventoryStats.outOfStock || 0,
          inStock: inventoryStats.inStock || 0,
          loading: false
        });
      }
      else {
        throw new Error(responseStats.data.message || "Failed to fetch stats")
      }

      // Fetch low stock item from server
      const responseLowStockItems = await axios.get(`${serverUrl}/api/product/low-stock`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (responseLowStockItems.data.success) {
        const { products } = responseLowStockItems.data;
        setLowStockItems(products);
      }
      else {
        throw new Error(responseStats.data.message || "Failed to fetch stats")
      }
    }
    catch (error) {
      console.log("Error fetching statstics: ", error);
      setStats((prev) => ({
        ...prev,
        loading: false,
        error: error.message || "Failed to load inventory data",
      }))
    }
  }, [token]);

  useEffect(() => {
    fetchStatistics();
  }, [token, fetchStatistics]);

  const inventoryStats = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: <FaBoxes />,
      color: "blue",
    },
    {
      title: "Low Stock Items",
      value: stats.lowStock,
      icon: <FaExclamationTriangle />,
      color: "yellow",
    },
    {
      title: "Out of Stock",
      value: stats.outOfStock,
      icon: <MdLowPriority />,
      color: "red",
    },
    {
      title: "In Stock",
      value: stats.inStock,
      icon: <FaCheckCircle />,
      color: "green",
    },
  ];

  function messageCommingSoon(){
    toast("This feature is coming soon!", { icon: "ℹ️", duration: 1000 });
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Title className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Inventory Management
            </Title>
            <p className="text-gray-600">
              Monitor and manage your product inventory
            </p>
          </div>
        </div>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {inventoryStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-lg bg-${stat.color}-100 text-${stat.color}-600`}
              >
                {stat.icon}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </h3>
                <p className="text-gray-600 text-sm">{stat.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Low Stock Alert */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Low Stock Alert
            </h3>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {lowStockItems.length > 0 ?
              lowStockItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-600">
                      Threshold: {item.threshold} units
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-yellow-600">
                      {item.stock}
                    </span>
                    <p className="text-sm text-gray-600">units left</p>
                  </div>
                </div>
              )) :
              <div>
                <h4 className="font-medium text-gray-900">No low stock items</h4>
              </div>}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/list"
              className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <MdOutlineInventory className="text-2xl text-gray-400 mb-2 mx-auto" />
              <p className="text-sm font-medium text-gray-600">
                Update Inventory
              </p>
            </Link>
            <button onClick={messageCommingSoon} className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
              <FaBoxes className="text-2xl text-gray-400 mb-2 mx-auto" />
              <p className="text-sm font-medium text-gray-600">Bulk Import</p>
            </button>
            <button onClick={messageCommingSoon} className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
              <FaCheckCircle className="text-2xl text-gray-400 mb-2 mx-auto" />
              <p className="text-sm font-medium text-gray-600">Stock Audit</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
