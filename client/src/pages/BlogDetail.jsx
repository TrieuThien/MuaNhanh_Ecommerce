// src/pages/BlogDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../../config";
import Container from "../components/Container";
import Breadcrumbs from "../components/Breadcrumbs";
import { IoCalendarOutline, IoPersonOutline, IoTimeOutline, IoShareOutline } from "react-icons/io5";

const BlogDetail = () => {
	const { slug } = useParams();
	const [blog, setBlog] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchBlog = async () => {
			try {
				const res = await axios.get(`${serverUrl}/api/blogs/${slug}`);
				setBlog(res.data.blog);
			} catch (err) {
				console.error("Error loading blog:", err);
			} finally {
				setLoading(false);
			}
		};
		fetchBlog();
	}, [slug]);

	const shareBlog = () => {
		if (navigator.share) {
			navigator.share({
				title: `${blog?.title} - Muanhanh Ecommerce`,
				text: `Check out this blog on Muanhanh Ecommerce`,
				url: window.location.href,
			});
		} else {
			navigator.clipboard.writeText(window.location.href);
			toast.success("Blog link copied to clipboard");
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-2xl text-gray-600 animate-pulse">Loading blog...</div>
			</div>
		);
	}

	if (!blog) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<p className="text-2xl text-red-600 mb-4">Blog not found</p>
					<Link to="/blog" className="text-blue-600 hover:underline">← Back to Blog</Link>
				</div>
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
								<a href="/blog" className="text-gray-900">Blogs</a>
								<span className="mx-2">/</span>
								<a href="/blog" className="text-gray-900">{blog.title}</a>
							</nav>
						</div>
					</Container>
				</div>

				<article className="mt-12 max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
					{/* Featured image */}
					<div className="relative">
						<img
							src={blog.featuredImage}
							alt={blog.title}
							className="w-full h-96 md:h-[500px] object-cover"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
						<div className="absolute bottom-6 left-6 right-6 text-white">
							<h1 className="text-3xl md:text-5xl font-bold leading-tight">{blog.title}</h1>
						</div>
					</div>

					<div className="p-6 md:p-12">
						{/* Meta info */}
						<div className="flex flex-wrap items-center gap-4 md:gap-6 text-gray-600 mb-8 pb-8 border-b">
							<div className="flex items-center gap-2">
								<IoPersonOutline className="w-5 h-5 text-blue-600" />
								<span className="font-medium">{blog.author || "MuaNhanh Team"}</span>
							</div>
							<div className="flex items-center gap-2">
								<IoCalendarOutline className="w-5 h-5 text-green-600" />
								<span>{new Date(blog.createdAt).toLocaleDateString("vi-VN", {
									day: "2-digit",
									month: "long",
									year: "numeric"
								})}</span>
							</div>
							{blog.tags?.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{blog.tags.map((tag) => (
										<span
											key={tag}
											className="text-xs md:text-sm px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full font-medium"
										>
											#{tag}
										</span>
									))}
								</div>
							)}
						</div>

						{/* Main content – keep TinyMCE format */}
						<div className="blog-content">
							<div dangerouslySetInnerHTML={{ __html: blog.content }} />
						</div>

						{/* Share & back buttons */}
						<div className="mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-6">
							<div className="flex items-center gap-4">
								<span className="text-gray-600">Share:</span>
								<button
									onClick={shareBlog}
									className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition">
									<IoShareOutline className="w-5 h-5" />
								</button>
							</div>

							<Link
								to="/blog"
								className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition"
							>
								← Back to Blog List
							</Link>
						</div>
					</div>
				</article>

				{/* CSS to make TinyMCE content look better */}
				<style jsx global>{`
					.blog-content h1,
					.blog-content h2,
					.blog-content h3,
					.blog-content h4,
					.blog-content p,
					.blog-content ul,
					.blog-content ol,
					.blog-content img,
					.blog-content blockquote {
						all: revert !important;   /* Bỏ hết CSS Tailwind đè lên */
					}
					.blog-content img {
						border-radius: 16px !important;
						box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important;
					}
				`}</style>
			</Container>
		</div>
	);
};

export default BlogDetail;