import { Router } from "express";
import { 
    setReview, 
    getReviewsByOrder, 
    getProductReviews, 
    getProductRatings } 
from "../controllers/reviewController.mjs";

import userAuth from "../middleware/userAuth.js";

const router = Router();

// Process checkout and update product stock
router.post("/api/review/order/:orderId/product/:productId", userAuth, setReview);
router.get("/api/review/order/:orderId", userAuth, getReviewsByOrder);

// Public route to get reviews for a product
router.get("/api/review/product/:productId/reviews", getProductReviews);
router.get("/api/review/product/:productId/ratings", getProductRatings);
export default router;
