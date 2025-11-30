// controllers/blogController.mjs
import blogModel from "../models/blogModel.js";
import { cloudinary } from "../config/cloudinary.js";
import fs from "fs";

// Helper: Delete temp file
const cleanupTempFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// Get all blogs (admin)
export const getBlogsAdmin = async (req, res) => {
  try {
    const blogs = await blogModel.find().sort({ createdAt: -1 });
    res.json({ success: true, blogs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get blog by ID
export const getBlogById = async (req, res) => {
  try {
    const blog = await blogModel.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }
    res.json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Create new blog
export const createBlog = async (req, res) => {
  try {
    const { title, content, excerpt, author, tags, isPublished } = req.body;

    if (!title || !content || !req.file) {
      cleanupTempFile(req.file?.path);
      return res.status(400).json({ success: false, message: "Title, content and image are required" });
    }

    if (excerpt && excerpt.length > 300) {
      cleanupTempFile(req.file?.path);
      return res.status(400).json({ success: false, message: "Short description must not exceed 300 characters" });
    }
    
    // Upload image to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "muanhanh/blogs",
      transformation: [
        { width: 1200, height: 630, crop: "fill" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });

    cleanupTempFile(req.file.path);

    const newBlog = new blogModel({
      title,
      content,
      excerpt: excerpt || content.slice(0, 200) + "...",
      author: author || "Admin",
      tags: tags ? JSON.parse(tags) : [],
      featuredImage: uploadResult.secure_url,
      isPublished: isPublished === "true",
    });

    await newBlog.save();

    res.json({
      success: true,
      message: "Blog created successfully",
      blog: newBlog,
    });
  } catch (error) {
    cleanupTempFile(req.file?.path);
    console.error("Create blog error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update blog    
export const updateBlog = async (req, res) => {
  try {
    const blog = await blogModel.findById(req.params.id);
    if (!blog) {
      cleanupTempFile(req.file?.path);
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    const { title, content, excerpt, author, tags, isPublished } = req.body;

    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.excerpt = excerpt || blog.excerpt;
    blog.author = author || blog.author;
    blog.tags = tags ? JSON.parse(tags) : blog.tags;
    blog.isPublished = isPublished === "true";

    if (req.file) {
      // Delete old image on Cloudinary
      if (blog.featuredImage) {
        const publicId = blog.featuredImage.split("/").slice(-2).join("/").split(".")[0];
        await cloudinary.uploader.destroy(publicId).catch(() => {});
      }

      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "muanhanh/blogs",
        transformation: [
          { width: 1200, height: 630, crop: "fill" },
          { quality: "auto" },
        ],
      });
      blog.featuredImage = uploadResult.secure_url;
      cleanupTempFile(req.file.path);
    }

    await blog.save();

    res.json({
      success: true,
      message: "Blog updated successfully",
      blog,
    });
  } catch (error) {
    cleanupTempFile(req.file?.path);
    console.error("Update blog error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
// Delete blog
export const deleteBlog = async (req, res) => {
  try {
    const blog = await blogModel.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    // Delete image on Cloudinary
    if (blog.featuredImage) {
      const publicId = blog.featuredImage.split("/").slice(-2).join("/").split(".")[0];
      await cloudinary.uploader.destroy(publicId).catch(() => {});
    }

    await blog.deleteOne();

    res.json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Delete blog error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};