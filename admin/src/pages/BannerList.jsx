// src/admin/components/BannerManager.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { serverUrl } from '../../config';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { IoMdCloudUpload, IoMdAdd } from 'react-icons/io';
import { FaTimes, FaEdit, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';

const BannerManager = () => {
  const [banners, setBanners] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${serverUrl}/api/banners/admin`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setBanners(data);
    } catch (err) {
      toast.error('Error fetching banners!');
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (banner = null) => {
    if (banner) {
      setForm({
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        description: banner.description || '',
        discount: banner.discount || '',
        from: banner.from || '',
        sale: banner.sale || '',
        buttonText: banner.buttonText || 'Shop Fresh',
        isActive: banner.isActive || false,
      });
      setEditingId(banner._id);
      setImagePreview(banner.image || null);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      title: '',
      subtitle: '',
      description: '',
      discount: '',
      from: '',
      sale: '',
      buttonText: 'Shop Fresh',
      isActive: false,
    });
    setEditingId(null);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.warn('Please enter the banner title');
      return;
    }

    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      formData.append(key, key === 'isActive' ? (form[key] ? 'true' : 'false') : form[key]);
    });
    if (imageFile) formData.append('image', imageFile);

    try {
      setLoading(true);
      if (editingId) {
        await axios.put(`${serverUrl}/api/banners/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        toast.success('Banner updated successfully!');
      } else {
        await axios.post(`${serverUrl}/api/banners`, formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        toast.success('Banner added successfully!');
      }
      closeModal();
      fetchBanners();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving banner');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${serverUrl}/api/banners/${deletingId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      toast.success('Deleted banner successfully!');
      setIsDeleteModalOpen(false);
      fetchBanners();
    } catch (err) {
      toast.error('Error deleting banner');
    }
  };

  const activeCount = banners.filter((b) => b.isActive).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Banners</h1>
          <p className="text-gray-600 mt-1">Customize the banners displayed on the homepage</p>
        </div>
        <button
          onClick={() => openModal()}
          className="mt-4 sm:mt-0 flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition"
        >
          <IoMdAdd className="text-xl" />
          Add New Banner
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 text-sm text-gray-600 bg-gray-50 inline-block px-4 py-2 rounded-lg">
        Show: <span className="font-semibold text-indigo-600">{activeCount}</span> banner
      </div>

      {/* Banner Grid */}
      {loading && banners.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl">
          <p className="text-xl text-gray-500">No banners available</p>
          <button
            onClick={() => openModal()}
            className="mt-4 text-indigo-600 hover:underline font-medium"
          >
            Add the first banner →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div
              key={banner._id}
              className={`relative group bg-white rounded-xl shadow-md overflow-hidden border-2 transition-all ${
                banner.isActive ? 'border-gray-300' : 'border-transparent'
              }`}
            >
              <div className="aspect-w-16 aspect-h-9 h-56 overflow-hidden">
                <img
                  src={banner.image || '/placeholder.jpg'}
                  alt={banner.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {banner.isActive && (
                  <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <FaEye /> Currently Showing
                  </div>
                )}
              </div>

              <div className="p-5">
                <h3 className="font-bold text-lg text-gray-900 truncate">{banner.title}</h3>
                {banner.subtitle && <p className="text-sm text-gray-600 mt-1">{banner.subtitle}</p>}
                {banner.discount && <p className="text-2xl font-bold text-indigo-600 mt-2">{banner.discount}</p>}

                <div className="mt-4 flex justify-between items-center">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      banner.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {banner.isActive ? 'Showing' : 'Hidden'}
                  </span>

                  <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openModal(banner)}
                      className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => confirmDelete(banner._id)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-40" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingId ? 'Edit Banner' : 'Add New Banner'}
                    </h2>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                      <FaTimes className="text-xl" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
                        <input
                          type="text"
                          value={form.title}
                          onChange={(e) => setForm({ ...form, title: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phụ đề</label>
                        <input
                          type="text"
                          value={form.subtitle}
                          onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                      <textarea
                        rows={3}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                        <input
                          type="text"
                          value={form.discount}
                          onChange={(e) => setForm({ ...form, discount: e.target.value })}
                          placeholder="50% OFF"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">From Price</label>
                        <input
                          type="text"
                          value={form.from}
                          onChange={(e) => setForm({ ...form, from: e.target.value })}
                          placeholder="From $99"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sale</label>
                        <input
                          type="text"
                          value={form.sale}
                          onChange={(e) => setForm({ ...form, sale: e.target.value })}
                          placeholder="Sale"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button</label>
                        <input
                          type="text"
                          value={form.buttonText}
                          onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Banner Image</label>
                      <div className="flex items-center gap-4">
                        {imagePreview && (
                          <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border" />
                        )}
                        <label className="cursor-pointer">
                          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                          <div className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-5 py-3 rounded-lg transition">
                            <IoMdCloudUpload className="text-xl text-indigo-600" />
                            <span className="text-sm font-medium">Choose Image</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={form.isActive}
                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                        Display this banner on the homepage
                      </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-70 transition flex items-center gap-2"
                      >
                        {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                        {editingId ? 'Cập nhật' : 'Thêm Banner'}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Delete Confirmation Modal */}
      <Transition appear show={isDeleteModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsDeleteModalOpen(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black bg-opacity-40" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                    <FaTrash className="text-3xl text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Confirm Delete?</h3>
                  <p className="mt-2 text-gray-600">This banner will be permanently deleted and cannot be recovered.</p>
                  <div className="mt-6 flex gap-3 justify-center">
                    <button
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      Delete Permanently
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default BannerManager;