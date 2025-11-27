import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import mongoose from "mongoose";

const setReview = async (req, res) => {
  try {
    const { orderId, productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    // Validate user existence
    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Valiedate order existence and completed status
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.status !== "delivered") {
      return res
        .status(400)
        .json({ success: false, message: "Cannot review an incomplete order" });
    }

    // Find the product to be reviewed
    const product = await productModel.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Check if the user has already reviewed this product in the order
    const existingReview = product.reviews.find(
      (rev) =>
        rev.userId.toString() === userId.toString() &&
        rev.orderId.toString() === orderId.toString()
    );

    if (existingReview) {
      return res.status(400).json({ success: false, message: "You have already reviewed this product in this order" });
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid rating value" });
    }


    // Add the new review
    product.reviews.push({
      userId,
      orderId,
      rating: Number(rating),
      comment: comment?.trim() || "",
    });

    await product.save();

    return res
      .status(200)
      .json({ success: true, message: "Review submitted successfully" });
  } catch (error) {
    console.error("Error setting review:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getReviewsByOrder = async (req, res) => {
  try {
    // Validate user existence
    const userId = req.user._id;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Validate order existence
    const { orderId } = req.params;
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }

    const reviewsInOrder = await productModel.aggregate([
      // Step 1: Filter products that have reviews for the given orderId
      { $match: { "reviews.orderId": new mongoose.Types.ObjectId(orderId) } },

      // Step 2: Unwind the reviews array
      { $unwind: "$reviews" },

      // Step 3: Filter again to only include reviews for the given orderId
      { $match: { "reviews.orderId": new mongoose.Types.ObjectId(orderId) } },

      // Step 4: Return the necessary information
      {
        $project: {
          _id: 0,
          productId: "$_id",
          comment: "$reviews.comment",
          rating: "$reviews.rating",
        }
      }
    ]);

    if (!reviewsInOrder || reviewsInOrder.length === 0) {
      return res.status(404).json({ success: false, message: "No reviews found for this order" });
    }
    else {
      return res.status(200).json({ success: true, reviews: reviewsInOrder });
    }

  } catch (error) {
    console.error("Error getting reviews by order:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    // Kiểm tra productId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await productModel
      .findById(productId)
      .populate({
        path: "reviews.userId",
        select: "name avatar", // Only get name and avatar of the reviewer
      })
      .select("name images reviews")
      .lean(); // use lean for faster read-only query

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // If there are no reviews
    if (!product.reviews || product.reviews.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          productName: product.name,
          averageRating: 0,
          totalReviews: 0,
          reviews: [],
        },
      });
    }

    // Calculate average rating
    const totalRating = product.reviews.reduce((sum, rev) => sum + rev.rating, 0);
    const averageRating = Math.round((totalRating / product.reviews.length) * 10) / 10; // round to 1 decimal place

    // Format the data returned to the frontend
    const formattedReviews = product.reviews.map((rev) => ({
      reviewerName: rev.userId?.name || "Customer",
      reviewerAvatar: rev.userId?.avatar || null,
      rating: rev.rating,
      comment: rev.comment || "",
      createdAt: rev.createdAt,
    }));

    return res.status(200).json({
      success: true,
      data: {
        averageRating,
        totalReviews: product.reviews.length,
        reviews: formattedReviews,
      },
    });
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getProductRatings = async (req, res) => {
  try {
    const { productId } = req.params;

    // Kiểm tra productId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // If there are no reviews
    if (!product.reviews || product.reviews.length === 0) {
      return res.status(200).json({
        success: true,
        data: averageRating = 0,
      });
    }

    // Calculate average rating
    const totalRating = product.reviews.reduce((sum, rev) => sum + rev.rating, 0);
    const averageRating = Math.round((totalRating / product.reviews.length) * 10) / 10; // round to 1 decimal place

    return res.status(200).json({
      success: true,
      data: averageRating,
    });
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export { setReview, getReviewsByOrder, getProductReviews, getProductRatings };