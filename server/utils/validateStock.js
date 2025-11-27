// utils/validateStock.js
import productModel from "../models/productModel.js";

/**
 * Check if there is enough stock for the requested items
 * @param {Array} items - [{ productId: ObjectId, quantity: number }, ...]
 * @returns {Object} { valid: true } or { valid: false, message: "...", productName: "..." }
 */
const validateStock = async (items) => {
  const productIds = items.map((item) => item.productId || item._id).filter(Boolean);

  if (productIds.length === 0) {
    return { valid: false, message: "No valid products to check stock for" };
  }

  const products = await productModel
    .find({ _id: { $in: productIds } })
    .select("name stock isAvailable")
    .lean();

  const productMap = {};
  products.forEach((p) => {
    productMap[p._id.toString()] = p;
  });

  for (const item of items) {
    const pid = (item.productId || item._id).toString();
    const product = productMap[pid];

    if (!product) {
      return {
        valid: false,
        message: "Product does not exist or has been deleted",
        productId: pid,
      };
    }

    const requestedQty = item.quantity || 1;

    // If there is an isAvailable field 
    if (product.isAvailable === false) {
      return {
        valid: false,
        message: `"${product.name}" is currently out of stock`,
      };
    }

    if (product.stock < requestedQty) {
      return {
        valid: false,
        message: `Product "${product.name}" does not have enough stock.`,
      };
    }
  }

  return { valid: true };
};

export default validateStock;