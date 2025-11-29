// controllers/bannerController.js
import Banner from '../models/bannerModel.js';
import cloudinary from 'cloudinary';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đường dẫn thư mục temp (cùng với multer của bạn)
const TEMP_DIR = path.join(__dirname, '../public/temp');

// Hàm dọn file tạm (dùng fs.promises để async/await sạch sẽ)
const cleanupTempFile = async (filePath) => {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch (err) {
    console.log('Không thể xóa file tạm:', filePath);
  }
};

// === CREATE BANNER ===
export const createBanner = async (req, res) => {
  try {
    const {
      title, subtitle, description, discount, from, sale, buttonText, isActive
    } = req.body;

    if (!title || !req.file) {
      return res.status(400).json({ success: false, message: 'Tiêu đề và ảnh là bắt buộc!' });
    }

    const filePath = req.file.path; // multer đã lưu vào public/temp/

    // Upload lên Cloudinary
    const result = await cloudinary.v2.uploader.upload(filePath, {
      folder: 'muanhanh/banners',
      transformation: [
        { width: 1920, height: 800, crop: 'fill', gravity: 'center' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });

    // Xóa file tạm ngay sau khi upload thành công
    await cleanupTempFile(filePath);

    const newBanner = new Banner({
      title: title.trim(),
      subtitle: subtitle || '',
      description: description || '',
      discount: discount || '',
      from: from ? Number(from) : null,
      sale: sale || '',
      buttonText: buttonText || 'Shop Now',
      image: result.secure_url,
      isActive: isActive === 'true' || isActive === true,
    });

    await newBanner.save();

    res.status(201).json({
      success: true,
      message: 'Add new banner successfully!',
      banner: newBanner,
    });
  } catch (err) {
    if (req.file?.path) await cleanupTempFile(req.file.path);
    console.log('Create banner error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// === UPDATE BANNER ===
export const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: 'Banner không tồn tại' });

    const {
      title, subtitle, description, discount, from, sale, buttonText, isActive
    } = req.body;

    // Cập nhật các field text
    banner.title = title?.trim() || banner.title;
    banner.subtitle = subtitle || banner.subtitle;
    banner.description = description || banner.description;
    banner.discount = discount || banner.discount;
    banner.from = from ? Number(from) : banner.from;
    banner.sale = sale || banner.sale;
    banner.buttonText = buttonText || banner.buttonText;
    banner.isActive = isActive === 'true' || isActive === true;

    // Nếu có ảnh mới
    if (req.file) {
      const filePath = req.file.path;

      // Upload ảnh mới
      const result = await cloudinary.v2.uploader.upload(filePath, {
        folder: 'muanhanh/banners',
        transformation: [
          { width: 1920, height: 800, crop: 'fill', gravity: 'center' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      });

      // Xóa ảnh cũ trên Cloudinary (nếu có)
      if (banner.image) {
        const publicId = banner.image.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.v2.uploader.destroy(publicId).catch(() => {});
      }

      banner.image = result.secure_url;
      await cleanupTempFile(filePath);
    }

    await banner.save();

    res.json({
      success: true,
      message: 'Cập nhật banner thành công!',
      banner,
    });
  } catch (err) {
    if (req.file?.path) await cleanupTempFile(req.file.path);
    console.log('Update banner error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// === DELETE BANNER ===
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: 'Không tìm thấy banner' });

    // Xóa ảnh trên Cloudinary
    if (banner.image) {
      const publicId = banner.image.split('/').slice(-2).join('/').split('.')[0];
      await cloudinary.v2.uploader.destroy(publicId).catch(() => {});
    }

    await banner.deleteOne();
    res.json({ success: true, message: 'Xóa banner thành công' });
  } catch (err) {
    console.log('Delete banner error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// === GET (giữ nguyên) ===
export const getBannersAdmin = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getActiveBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true })
      .sort({ order: 1 })
      .limit(10);
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};