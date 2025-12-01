// src/admin/BlogForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { serverUrl } from '../../config';
import { useParams, useNavigate } from 'react-router-dom';
import { IoMdCloudUpload, IoMdAdd } from 'react-icons/io';
import { FaTimes, FaEdit } from 'react-icons/fa';
import Title from "../components/ui/title";
import { Editor } from '@tinymce/tinymce-react';

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
		<div className="p-6 max-w-7xl mx-auto xl:max-w-5xl bg-white rounded-xl shadow-sm border border-gray-200">
			{isEdit ? (
				<div className="flex items-center gap-3 mb-6 sm:mb-8">
					<div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
						<FaEdit className="text-white text-xl" />
					</div>
					<div>
						<Title className="text-xl sm:text-2xl font-bold text-gray-800">
							Edit Blog
						</Title>
						<p className="text-sm text-gray-500 mt-1">
							Edit the blog post details.
						</p>
					</div>
				</div>
			) : (
				<div className="flex items-center gap-3 mb-6 sm:mb-8">
					<div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
						<IoMdAdd className="text-white text-xl" />
					</div>
					<div>
						<Title className="text-xl sm:text-2xl font-bold text-gray-800">
							Add New Blog
						</Title>
						<p className="text-sm text-gray-500 mt-1">
							Create a new blog post for your website.
						</p>
					</div>
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="bg-gray-50 rounded-lg p-4 sm:p-6">
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

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 rounded-lg p-4 sm:p-6">
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
				<div className='bg-gray-50 rounded-lg p-4 sm:p-6'>
					<label htmlFor='Excerpt' className='ml-2'>Short Description</label>
					<textarea
						placeholder="Write short description here (max 300 characters)"
						value={form.excerpt}
						onChange={e => setForm({ ...form, excerpt: e.target.value })}
						rows={3}
						className="w-full border rounded-lg px-4 py-3"
					/>
				</div>

				<div className='bg-gray-50 rounded-lg p-4 sm:p-6'>
					<label htmlFor='Content' className='ml-2'>Content *</label>
					{/* <Editor
						tinymceScriptSrc="/tinymce/tinymce.min.js"
						initialValue={isEdit ? form.content : ''}
						value={form.content}
						onEditorChange={(c) => setForm(prev => ({...prev, content: c}))}
						init={{
							height: 500,
							menubar: true,
							plugins: [
								'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
								'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
								'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
							],
							toolbar:
								'undo redo | blocks | bold italic backcolor | ' +
								'alignleft aligncenter alignright alignjustify | ' +
								'bullist numlist outdent indent | link image | ' +
								'removeformat | code | help',
							content_style: "body { font-family: inherit; font-size: 16px }",
							branding: false,
							statusbar: true,
						}}
					/> */}
					<Editor
						tinymceScriptSrc="https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.4/tinymce.min.js"
						value={form.content}
						onEditorChange={(c) => setForm(prev => ({ ...prev, content: c }))}
						init={{
							height: 800,
							menubar: true,
							plugins:
								[
									'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
									'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
									'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
								],
							toolbar:
								'undo redo | blocks | bold italic backcolor | ' +
								'alignleft aligncenter alignright alignjustify | ' +
								'bullist numlist outdent indent | link image | ' +
								'removeformat | code | help',


							content_style: `
								body { font-family: Inter, sans-serif; font-size: 17px; line-height: 1.8; color: #1f2937; }
								h1 { font-size: 2.5rem !important; font-weight: 800 !important; margin: 2.5rem 0 1rem !important; color: #111 !important; }
								h2 { font-size: 2rem !important; font-weight: 700 !important; margin: 2rem 0 1rem !important; color: #1f2937 !important; }
								h3 { font-size: 1.65rem !important; font-weight: 600 !important; margin: 1.8rem 0 0.8rem !important; color: #374151 !important; }
								p  { margin-bottom: 1.4rem !important; }
								img { border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); margin: 2.5rem auto; display: block; max-width: 100%; height: auto; }
							`,


							formats: {
								alignleft: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes: 'text-left' },
								aligncenter: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes: 'text-center' },
								alignright: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes: 'text-right' },
							},
						}}
					/>
				</div>
				<div className='bg-gray-50 rounded-lg p-4 sm:p-6'>
					<label htmlFor='Tags' className='ml-2'>Tags</label>
					<input
						type="text"
						placeholder="Tags (separated by commas)"
						value={form.tags}
						onChange={e => setForm({ ...form, tags: e.target.value })}
						className="w-full border rounded-lg px-4 py-3"
					/>
				</div>

				<div className="flex items-center gap-4 bg-gray-50 rounded-lg p-4 sm:p-6">
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