// src/admin/BlogList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { serverUrl } from '../../config';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaEye, FaEyeSlash, FaPlus } from 'react-icons/fa';
import Title from "../components/ui/title";

const BlogList = () => {
	const [blogs, setBlogs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [deleteModal, setDeleteModal] = useState(null);

	useEffect(() => {
		fetchBlogs();
	}, []);

	const fetchBlogs = async () => {
		try {
			const token = localStorage.getItem('token');
			const res = await axios.get(`${serverUrl}/api/blogs`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			setBlogs(res.data.blogs || []);
		} catch (err) {
			toast.error('Error loading blogs.');
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		try {
			const token = localStorage.getItem('token');
			await axios.delete(`${serverUrl}/api/blogs/${deleteModal}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			toast.success('Blog deleted successfully.');
			fetchBlogs();
			setDeleteModal(null);
		} catch (err) {
			toast.error('Delete failed.');
		}
	};

	if (loading) return <div className="p-8 text-center">Loading...</div>;
	return (
		<div className="p-6 max-w-7xl mx-auto">
			{/* Header */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div>
						<Title className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
							Blog Management
						</Title>
						<p className="text-gray-600">
							Management of blog posts for your website.
						</p>
					</div>
					<Link
						to="/blog/create"
						className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2"
					>
						<FaPlus /> Create New Blog
					</Link>
				</div>
			</div>

			{/* Blog List */}
			{blogs.length === 0 ? (
				<div className="text-center py-16 bg-gray-50 rounded-xl">
					<p className="text-xl text-gray-600">No blogs available</p>
					<Link to="/blog/create" className="text-blue-600 hover:underline mt-4 inline-block">
						Write the first blog post
					</Link>
				</div>
			) : (
				<div className="grid gap-6">
					{blogs.map((blog) => (
						<div key={blog._id} className="relative bg-white rounded-xl shadow-md overflow-hidden flex flex-col sm:flex-row">
							<img src={blog.featuredImage} alt={blog.title} className="w-full sm:w-64 h-full object-cover" />
							<div className="p-6 flex-1 flex justify-between">
								<div>
									<h3 className="text-xl font-bold text-gray-800">{blog.title}</h3>
									<p className="text-gray-600 mt-1 line-clamp-2">{blog.excerpt || 'No description available'}</p>
									<div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
										<span>Created at: {new Date(blog.createdAt).toLocaleDateString('vi-VN')}</span>
										<span>•</span>
										<span className={`inline-flex items-center gap-1.5 font-medium ${blog.isPublished ? 'text-green-600' : 'text-gray-500'}`}>
											{blog.isPublished ? <FaEye /> : <FaEyeSlash />}
											{blog.isPublished ? 'Published' : 'Draft'}
										</span>
									</div>
								</div>
								<div className="absolute top-2 right-4 flex items-center gap-3">
									<Link
										to={`/blog/edit/${blog._id}`}
										className="text-blue-600 hover:text-blue-800"
									>
										<FaEdit size={20} />
									</Link>
									<button
										onClick={() => setDeleteModal(blog._id)}
										className="text-red-600 hover:text-red-800"
									>
										<FaTrash size={20} />
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Modal confirm delete */}
			{deleteModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 max-w-md w-full">
						<h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
						<p>Are you sure you want to delete this blog post? This action cannot be undone.</p>
						<div className="flex justify-end gap-3 mt-6">
							<button
								onClick={() => setDeleteModal(null)}
								className="px-5 py-2 border border-gray-300 rounded hover:bg-gray-100"
							>
								Cancel
							</button>
							<button
								onClick={handleDelete}
								className="px-5 py-2 bg-red-600 text-white rounded hover:bg-red-700"
							>
								Delete Permanently
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default BlogList;