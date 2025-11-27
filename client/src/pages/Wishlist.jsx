import { motion } from "framer-motion";
import Container from "../components/Container";
import { FaHeart, FaShoppingBag, FaArrowLeft, FaTrash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { serverUrl } from "../../config";
import PriceContainer from "../components/PriceContainer";
import AddToCartButton from "../components/AddToCartButton";


const Wishlist = () => {
  const userInfo = useSelector((state) => state.orebiReducer.userInfo);
  const navigate = useNavigate();

  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userInfo) {
      navigate("/signin");
      return;
    }

    const fetchWishlist = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${serverUrl}/api/user/wishlist`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        setWishlistItems(data.wishlist || []);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      }
      finally {
        setLoading(false);
      }
    }
    fetchWishlist();

  }, [userInfo, navigate]);

  const handleProductDetails = () => {
    navigate(`/product/${item?._id}`);
  };

  const removeFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${serverUrl}/api/user/wishlist/remove`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });
      const data = await response.json();

      if (data.success) {
        setWishlistItems((prevItems) =>
          prevItems.filter((item) => item._id !== productId)
        );
      }
    } catch (error) {
      console.error("Error removing item from wishlist:", error);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm p-8 mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                  <FaHeart className="text-2xl text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    My Wishlist
                  </h1>
                  <p className="text-gray-600">
                    Save your favorite items for later
                  </p>
                </div>
              </div>
              <Link
                to="/profile"
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <FaArrowLeft />
                Back to Profile
              </Link>
            </div>
          </motion.div>

          {/* Wishlist Items Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div
                className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"
                role="status"
              >
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                  Loading...
                </span>
              </div>
              <div className="mt-4 text-center text-gray-700">Loading wishlist...</div>
            </div>

          ) : wishlistItems.length === 0 ? (
            <div>
              {/* Empty State */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm p-12 text-center"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaHeart className="text-4xl text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Your wishlist is empty
                </h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Start building your wishlist by adding items you love. You can
                  save items while browsing and come back to them later.
                </p>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  <FaShoppingBag />
                  Start Shopping
                </Link>
              </motion.div>

              {/* Feature Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                <div className="bg-white rounded-lg p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <FaHeart className="text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Save Favorites
                  </h3>
                  <p className="text-sm text-gray-600">
                    Keep track of items you love and want to purchase later
                  </p>
                </div>
                <div className="bg-white rounded-lg p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <FaShoppingBag className="text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Quick Purchase
                  </h3>
                  <p className="text-sm text-gray-600">
                    Easily move items from wishlist to cart when ready to buy
                  </p>
                </div>
                <div className="bg-white rounded-lg p-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <FaHeart className="text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Never Forget</h3>
                  <p className="text-sm text-gray-600">
                    Your wishlist syncs across devices so you never lose your
                    favorites
                  </p>
                </div>
              </motion.div>
            </div>

          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-sm overflow-hidden group hover:shadow-xl transition-shadow"
                >
                  <div className="relative">
                    <div onClick={() => handleProductDetails} className="cursor-pointer">
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <button
                      onClick={() => removeFromWishlist(item._id)}
                      className="absolute top-3 right-3 w-10 h-10 bg-white/90 hover:bg-red-500 text-red-500 hover:text-white rounded-full flex items-center justify-center shadow-lg transition-all"
                      title="Remove from Wishlist"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                    {item.stock === 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <Link to={`/product/${item._id}`}>
                      <h3 className="font-medium text-gray-900  group-hover:opacity-80 transition-all duration-300">
                        {item.name}
                      </h3>
                    </Link>

                    <div className="mt-4 space-y-2">
                      <PriceContainer item={item} />
                      <AddToCartButton item={item} />
                    </div>
                  </div>

                </motion.div>
              ))}
            </div>
          )}

        </div>
      </Container>
    </div>

  );
};

export default Wishlist;
