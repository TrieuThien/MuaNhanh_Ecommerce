// utils/deductStock.js
import productModel from "../models/productModel.js";

/**
 * Deduct stock and increase sold quantity for the given items
 * @param {Array} items - [{ productId: ObjectId, quantity: number }, ...]
 */
const deductStock = async (items) => {
  const operations = items.map((item) => {
    const productId = item.productId || item._id;
    const qty = item.quantity || 1;

    return {
      updateOne: {
        filter: { _id: productId },
        update: {
          $inc: {
            stock: -qty,          // Deduct stock
            soldQuantity: qty,    // Increase sold quantity
          },
        },
      },
    };
  });

  if (operations.length > 0) {
    await productModel.bulkWrite(operations);
  }
};

export default deductStock;