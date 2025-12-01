// routes/blogRouter.mjs
import express from "express";
import {
  getBlogsAdmin,
  getBlogs,
  getBlogByIdOrSlug,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController.mjs";
import upload from "../middleware/multer.mjs";
import adminAuth from "../middleware/adminAuth.js";

const blogRouter = express.Router();
const routeValue = "/api/blogs";

// Public
blogRouter.get(`${routeValue}`, getBlogs);
blogRouter.get(`${routeValue}/:identifier`, getBlogByIdOrSlug)

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