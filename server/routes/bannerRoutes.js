// routes/bannerRoutes.js
import express from 'express';
import upload from '../middleware/multer.mjs'; // ĐÚNG ĐƯỜNG DẪN CỦA BẠN
import {
  getBannersAdmin,
  getActiveBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../controllers/bannerController.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

const routeValue = '/api/banners';
// Public
router.get(`${routeValue}/active`, getActiveBanners);

// Admin
router.get(`${routeValue}/admin`, adminAuth, getBannersAdmin);
router.post(routeValue, adminAuth, upload.single('image'), createBanner);
router.put(`${routeValue}/:id`, adminAuth, upload.single('image'), updateBanner);
router.delete(`${routeValue}/:id`, adminAuth, deleteBanner);

export default router;