// src/admin/BlogForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { serverUrl } from '../../config';
import { useParams, useNavigate } from 'react-router-dom';
import { IoMdCloudUpload } from 'react-icons/io';
import { FaTimes } from 'react-icons/fa';

const BlogForm = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const isEdit = !!id;

	const [form, setForm] = useState({
		title: '',
		content: '',
		excerpt: '',
		author: 'Admin',
		tags: '',
		isPublished: false,
	});
	const [imageFile, setImageFile] = useState(null);
	const [imagePreview, setImagePreview] = useState(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (isEdit) {
			fetchBlog();
		}
	}, [id]);

	const resetForm = () => {
		setForm({
			title: '',
			content: '',
			excerpt: '',
			author: 'Admin',
			tags: '',
			isPublished: false,
		});
		setImageFile(null);
		setImagePreview(null);
	};

	const fetchBlog = async () => {
		try {
			const token = localStorage.getItem('token');
			const res = await axios.get(`${serverUrl}/api/blogs/${id}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			const blog = res.data.blog;
			setForm({
				title: blog.title,
				content: blog.content,
				excerpt: blog.excerpt || '',
				author: blog.author,
				tags: blog.tags.join(', '),
				isPublished: blog.isPublished,
			});
			setImagePreview(blog.featuredImage);
		} catch (err) {
			toast.error('Error loading blog data.');
		}
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setImageFile(file);
			setImagePreview(URL.createObjectURL(file));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!form.title || !form.content || (!imageFile && !isEdit)) {
			return toast.error('Title, content, and image are required');
		}

		if (form.excerpt.length > 300) {
			return toast.error('Short description must not exceed 300 characters');
		}

		const formData = new FormData();
		formData.append('title', form.title);
		formData.append('content', form.content);
		formData.append('excerpt', form.excerpt);
		formData.append('author', form.author);
		formData.append('tags', JSON.stringify(form.tags.split(',').map(t => t.trim()).filter(Boolean)));
		formData.append('isPublished', form.isPublished);

		if (imageFile) formData.append('featuredImage', imageFile);

		setLoading(true);
		try {
			const token = localStorage.getItem('token');
			if (isEdit) {
				await axios.put(`${serverUrl}/api/blogs/${id}`, formData, {
					headers: { Authorization: `Bearer ${token}` },
				});
				toast.success('Update successful.');
			} else {
				await axios.post(`${serverUrl}/api/blogs`, formData, {
					headers: { Authorization: `Bearer ${token}` },
				});
				toast.success('Create successful.');
				navigate('/blogs');
			}
		} catch (err) {
			toast.error(err.response?.data?.message || 'Error saving blog post');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="p-6 max-w-5xl mx-auto">
			<h1 className="text-3xl font-bold mb-8">{isEdit ? 'Edit Blog Post' : 'Create New Blog Post'}</h1>

			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="bg-white rounded-xl shadow p-6">
					<label className="block text-sm font-medium mb-3">Featured Image</label>
					<label className="block cursor-pointer">
						<div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-blue-400">
							{imagePreview ? (
								<div className="relative inline-block">
									<img src={imagePreview} alt="Preview" className="max-h-80 mx-auto rounded" />
									<button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
										className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full">
										<FaTimes />
									</button>
								</div>
							) : (
								<>
									<IoMdCloudUpload className="mx-auto text-6xl text-gray-400 mb-4" />
									<p>Click to upload image</p>
								</>
							)}
							<input type="file" accept="image/*" hidden onChange={handleImageChange} />
						</div>
					</label>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div> 
						<label htmlFor='Title' className='ml-2'>Title *</label>
						<input
							type="text"
							placeholder="Blog Title..."
							value={form.title}
							onChange={e => setForm({ ...form, title: e.target.value })}
							className="w-full border rounded-lg px-4 py-3"
							required
						/>

					</div>
					<div>
						<label htmlFor='Author' className='ml-2'>Author</label>
						<input
							type="text"
							placeholder="Author (default: Admin)"
							value={form.author}
							onChange={e => setForm({ ...form, author: e.target.value })}
							className="w-full border rounded-lg px-4 py-3"
						/>
					</div>
				</div>
				<div>
					<label htmlFor='Excerpt' className='ml-2'>Short Description</label>
					<textarea
						placeholder="Write short description here (max 300 characters)"
						value={form.excerpt}
						onChange={e => setForm({ ...form, excerpt: e.target.value })}
						rows={3}
						className="w-full border rounded-lg px-4 py-3"
					/>
				</div>

				<div>
					<label htmlFor='Content' className='ml-2'>Content *</label>
					<textarea
						placeholder="Write content here..."
						value={form.content}
						onChange={e => setForm({ ...form, content: e.target.value })}
						rows={12}
						className="w-full border rounded-lg px-4 py-3 font-mono text-sm"
						required
					/>
				</div>
				<div>
					<label htmlFor='Tags' className='ml-2'>Tags</label>
					<input
						type="text"
						placeholder="Tags (separated by commas)"
						value={form.tags}
						onChange={e => setForm({ ...form, tags: e.target.value })}
						className="w-full border rounded-lg px-4 py-3"
					/>
				</div>

				<div className="flex items-center gap-4">
					<label className="flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							checked={form.isPublished}
							onChange={e => setForm({ ...form, isPublished: e.target.checked })}
							className="w-5 h-5"
						/>
						<span>Publish Immediately</span>
					</label>
				</div>

				<div className="flex gap-4">
					<button
						type="submit"
						disabled={loading}
						className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 disabled:opacity-70"
					>
						{loading ? 'Saving...' : isEdit ? 'Update' : 'Save'}
					</button>
					<button type="button" onClick={resetForm} className="border border-gray-300 px-6 py-3 rounded-lg">
						Cancel
					</button>
				</div>
			</form>
		</div>
	);
};

export default BlogForm;