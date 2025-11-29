// src/admin/components/BannerManager.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { serverUrl } from '../../config';
import Title from "../components/ui/title";
import { IoMdCloudUpload, IoMdAdd } from 'react-icons/io';
import { FaTimes  } from 'react-icons/fa'; // thêm icon xóa

const BannerManager = () => {
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    discount: '',
    from: '',
    sale: '',
    buttonText: 'Shop Fresh',
    isActive: false,
  });

  // ảnh preview + file thực tế
  const [imageFile, setImageFile] = useState(null);   // để gửi lên server
  const [imagePreview, setImagePreview] = useState(null); // để hiển thị

  // Xử lý chọn ảnh
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Xóa ảnh đã chọn
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Reset form
  const resetForm = () => {
    setForm({
      title: '',
      subtitle: '',
      description: '',
      discount: '',
      from: '',
      sale: '',
      buttonText: '',
      isActive: false,
    });
    setImageFile(null);
    setImagePreview(null);
  };

  // Hàm submit – chỉ tạo mới banner
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra bắt buộc
    if (!form.title.trim()) {
      toast.error('Title is required!');
      return;
    }
    if (!imageFile) {
      toast.error('Please select a banner image!');
      return;
    }

    const formData = new FormData();
    formData.append('title', form.title.trim());
    formData.append('subtitle', form.subtitle.trim());
    formData.append('description', form.description.trim());
    formData.append('discount', form.discount.trim());
    formData.append('from', form.from || '');
    formData.append('sale', form.sale.trim());
    formData.append('buttonText', form.buttonText.trim());
    formData.append('isActive', form.isActive); // true/false
    formData.append('image', imageFile);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${serverUrl}/api/banners`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success('Banner added successfully!');
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error adding banner');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <IoMdAdd className="text-white text-xl" />
        </div>
        <div>
          <Title className="text-xl sm:text-2xl font-bold text-gray-800">
            Add New Banner
          </Title>
          <p className="text-sm text-gray-500 mt-1">
            Create a new banner for your website.
          </p>
        </div>
      </div>
      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white mt-4  p-6 rounded-lg shadow-md mb-8">
        {/* Image Upload Section */}
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Banner Image
          </h3>
          <div className="relative">
            <label className="block">
              <div className="relative group cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors duration-200 min-h-[120px] flex flex-col items-center justify-center bg-white">
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full max-h-48 object-contain rounded-md mb-2"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeImage();
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                    <span className="text-xs text-gray-600">Change image</span>
                  </>
                ) : (
                  <>
                    <IoMdCloudUpload className="text-3xl text-gray-400 mb-2" />
                    <span className="text-xs text-gray-600">Upload Image</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </div>
            </label>
            <p className="text-sm text-gray-500 mt-3">
              Upload image will be the main banner image (recommended 1920×800px).
            </p>
          </div>
        </div>

        {/* Các field khác */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block mb-1 font-medium">Title *</label>
            <input
              type="text"
              required
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Subtitle</label>
            <input
              type="text"
              placeholder="Subtitle"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              className="w-full border p-2 rounded"
            />
          </div>

          <div className="col-span-2">
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border p-2 rounded"
              rows={3}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Discount</label>
            <input
              type="text"
              placeholder="Discount (e.g., Free delivery over $50)"
              value={form.discount}
              onChange={(e) => setForm({ ...form, discount: e.target.value })}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">From Price</label>
            <input
              type="number"
              placeholder="From Price"
              value={form.from}
              onChange={(e) => setForm({ ...form, from: e.target.value })}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Sale tag</label>
            <input
              type="text"
              placeholder="Sale tag"
              value={form.sale}
              onChange={(e) => setForm({ ...form, sale: e.target.value })}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Button Text</label>
            <input
              type="text"
              placeholder="Button Text"
              value={form.buttonText}
              onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
              className="w-full border p-2 rounded"
            />
          </div>

          <div className="col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              <span>Display on website</span>
            </label>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Add new
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default BannerManager;