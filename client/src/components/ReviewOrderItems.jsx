import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FaStar, FaRegStar, FaCheckCircle } from "react-icons/fa";
import PriceFormat from "./PriceFormat";
import { serverUrl } from "../../config";

const OrderReviewForm = ({ orderId, items, existingReviews = [], onReviewSuccess }) => {
  // State for ratings and comments per product
  const [ratings, setRatings] = useState({});     // { productId: 4 }
  const [comments, setComments] = useState({});   // { productId: "Sản phẩm tốt..." }
  const [submitting, setSubmitting] = useState(null);
  const [submitted, setSubmitted] = useState([]); // [productId, ...]

  // Restore existing reviews on mount
  useEffect(() => {
    if (existingReviews.length > 0) {
      const ratingMap = {};
      const commentMap = {};
      const submittedList = [];

      existingReviews.forEach((rev) => {
        ratingMap[rev.productId] = rev.rating;
        commentMap[rev.productId] = rev.comment || "";
        submittedList.push(rev.productId);
      });

      setRatings(ratingMap);
      setComments(commentMap);
      setSubmitted(submittedList);
    }
  }, [existingReviews]);

  const setRatingForProduct = (productId, rating) => {
    if (submitted.includes(productId)) return;
    setRatings(prev => ({ ...prev, [productId]: rating }));
  };

  const setCommentForProduct = (productId, comment) => {
    if (submitted.includes(productId)) return;
    setComments(prev => ({ ...prev, [productId]: comment }));
  };

  const handleSubmit = async (productId) => {
    const rating = ratings[productId];
    if (!rating || rating < 1) {
      toast.error("Vui lòng chọn số sao cho sản phẩm này");
      return;
    }
   
    setSubmitting(productId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${serverUrl}/api/review/order/${orderId}/product/${productId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating,
            comment: (comments[productId] || "").trim(),
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || "Review submitted successfully");
        setSubmitted(prev => [...prev, productId]);
        onReviewSuccess?.();
      } else {
        toast.error(data.message || "Cannot submit review");
      }
    } catch (err) {
      console.error("Review error:", err);
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(null);
    }
  };

  const isSubmitted = (productId) => submitted.includes(productId);
  const getCurrentRating = (productId) => ratings[productId] || 0;

  return (
    <div className="mt-12 bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <FaStar className="w-8 h-8" />
          Comment Your Orders
        </h2>
        <p className="text-indigo-100 mt-2">
          Every review helps us improve our products and services!
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {items.map((item) => {
          const productId = item.productId || item._id || item.product._id;

          if (!productId) {
            console.error("Missing productId:", item);
            return null;
          }
          const currentRating = getCurrentRating(productId);
          const alreadyReviewed = isSubmitted(productId);

          return (
            <div key={productId} className="p-8 hover:bg-gray-50 transition-colors">
              <div  className="flex flex-col md:flex-row gap-8">
                {/* Ảnh sản phẩm */}
                <div className="w-28 h-28 bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 flex-shrink-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                      No image
                    </div>
                  )}
                </div>

                {/* Form đánh giá */}
                <div className="flex-1 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Quantity: {item.quantity}  × <PriceFormat amount={item.price} />
                    </p>
                  </div>

                  {/* Đánh giá sao - độc lập cho từng sản phẩm */}
                  <div>
                    <p className="font-small text-gray-700 mb-3 text-lg">
                      How many stars would you rate this product?
                    </p>
                    <div className="flex items-center gap-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          disabled={alreadyReviewed}
                          onClick={() => setRatingForProduct(productId, star)}
                          className="transition-all duration-200 hover:scale-125 disabled:cursor-not-allowed"
                        >
                          {currentRating >= star ? (
                            <FaStar className="w-6 h-6 text-yellow-400 drop-shadow-md" />
                          ) : (
                            <FaRegStar className="w-6 h-6 text-gray-300 hover:text-gray-400" />
                          )}
                        </button>
                      ))}
                      <span className="ml-6 text-xl font-bold text-gray-800">
                        {currentRating > 0 ? `${currentRating} stars` : "Not selected"}
                      </span>
                    </div>
                  </div>

                  {/* Review */}
                  <div>
                    <label className="block font-medium text-gray-700 mb-2">
                      Your Review (optional):
                    </label>
                    <textarea
                      rows={4}
                      disabled={alreadyReviewed}
                      value={comments[productId] || ""}
                      onChange={(e) => setCommentForProduct(productId, e.target.value)}
                      placeholder="e.g., Great product, careful packaging, fast delivery..."
                      className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all resize-none disabled:bg-gray-50"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    {alreadyReviewed ? (
                      <div className="inline-flex items-center gap-3 bg-green-50 text-green-700 px-6 py-4 rounded-xl font-semibold">
                        <FaCheckCircle className="w-6 h-6" />
                        Review Submitted
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSubmit(productId)}
                        disabled={submitting === productId || currentRating === 0}
                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold text-sm rounded-xl hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        {submitting === productId ? "Sending..." : "Submit Review"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderReviewForm;