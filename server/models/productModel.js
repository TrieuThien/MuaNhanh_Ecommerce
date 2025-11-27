import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",             
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: [1, "Rating tối thiểu là 1"],
      max: [5, "Rating tối đa là 5"],
    },
    comment: {
      type: String,
      trim: true,
      default: "",
      maxlength: [1000, "Bình luận không được quá 1000 ký tự"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false } // No _id for subdocuments
);

const productSchema = new mongoose.Schema(
  {
    _type: { type: String },
    name: { type: String, required: true },
    images: { type: Array, required: true },
    price: { type: Number, required: true },
    discountedPercentage: { type: Number, required: true, default: 10 },
    stock: { type: Number, required: true, default: 0 },
    soldQuantity: { type: Number, default: 0 },
    category: { type: String, required: true },
    brand: { type: String },
    badge: { type: Boolean },
    isAvailable: { type: Boolean },
    offer: { type: Boolean },
    description: { type: String, required: true },
    tags: { type: Array },
    threshold: { type: Number },

    reviews: [reviewSchema], 
  },
  {
    timestamps: true,
  }
);

// Tối ưu tìm kiếm nhanh (nếu cần lọc theo user/order)
productSchema.index({ "reviews.userId": 1 });
productSchema.index({ "reviews.orderId": 1 });

const productModel =
  mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;