// routes/blogRouter.mjs
import express from "express";
import {
  getBlogsAdmin,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController.mjs";
import upload from "../middleware/multer.mjs";
import adminAuth from "../middleware/adminAuth.js";

const blogRouter = express.Router();
const routeValue = "/api/blogs";

// Public
blogRouter.get(`${routeValue}/:id`, getBlogById);

// Admin only
blogRouter.get(`${routeValue}`, adminAuth, getBlogsAdmin);
blogRouter.post(
  `${routeValue}`,
  adminAuth,
  upload.single("featuredImage"),
  createBlog
);
blogRouter.put(
  `${routeValue}/:id`,
  adminAuth,
  upload.single("featuredImage"),
  updateBlog
);
blogRouter.delete(`${routeValue}/:id`, adminAuth, deleteBlog);

export default blogRouter;