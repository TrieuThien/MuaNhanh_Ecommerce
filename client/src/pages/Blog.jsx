// src/pages/Blog.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../../config";
import Container from "../components/Container";
import {
  IoCalendarOutline,
  IoBookOutline,
  IoPencilOutline,
  IoTimeOutline,
} from "react-icons/io5";

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/blogs`);
        setBlogs(res.data.blogs || []);
      } catch (err) {
        console.error("Error loading blogs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading blogs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8">
        <div className="bg-gray-50 border-b border-gray-200">
          <Container className="py-4">
            <div className="flex flex-col space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">Blogs</h1>
              <nav className="flex text-sm text-gray-500">
                <a href="/" className="hover:text-gray-700 transition-colors">
                  Home
                </a>
                <span className="mx-2">/</span>
                <span className="text-gray-900">Blogs</span>
              </nav>
            </div>
          </Container>
        </div>

        <div className="mt-12 max-w-4xl mx-auto text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-900 rounded-full mb-6">
            <IoBookOutline className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Blog MuaNhanh</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Update amazing content about products, latest news, and the newest consumer trends.
          </p>
        </div>

        {/* Blogs list */}
        {blogs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500">No blog posts yet.</p>
            <p className="text-gray-400 mt-2">We&apos;re working hard to bring you amazing content about products, latest news, and the newest consumer trends. Stay tuned!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {blogs.map((blog) => (
              <Link
                key={blog._id}
                to={`/blog/${blog.slug}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 block group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={blog.featuredImage}
                    alt={blog.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <IoCalendarOutline className="w-4 h-4 mr-1" />
                    {new Date(blog.createdAt).toLocaleDateString("vi-VN")}
                    <span className="mx-2">•</span>
                    <IoTimeOutline className="w-4 h-4 mr-1" />
                    {blog.author || "MuaNhanh Team"}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {blog.title}
                  </h3>

                  <p className="text-gray-600 line-clamp-3">
                    {blog.excerpt || "Details blog..."}
                  </p>

                  {blog.tags && blog.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {blog.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                      {blog.tags.length > 3 && (
                        <span className="text-xs text-gray-500">...</span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Back to shopping */}
        <div className="text-center mt-12">
          <Link
            to="/shop"
            className="inline-block bg-gray-900 text-white px-8 py-3 rounded-md hover:bg-gray-800 transition"
          >
            Shop Now
          </Link>
        </div>
      </Container>
    </div>
  );
};

export default Blog;