// models/Banner.js
import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  description: { type: String },
  discount: { type: String },
  from: { type: Number }, // giá khởi điểm
  sale: { type: String },
  image: { type: String, required: true }, // URL hoặc tên file ảnh
  buttonText: { type: String, default: 'Shop Now' },
  isActive: { type: Boolean, default: false }, // bật/tắt hiển thị
  order: { type: Number, default: 0 }, // thứ tự hiển thị (tùy chọn)
}, {
  timestamps: true
});

// Giới hạn tối đa 10 banner active
bannerSchema.pre('save', async function(next) {
  if (this.isActive) {
    const activeCount = await this.constructor.countDocuments({ 
      isActive: true, 
      _id: { $ne: this._id } 
    });
    if (activeCount >= 10) {
      return next(new Error('Chỉ được phép hiển thị tối đa 10 banner cùng lúc!'));
    }
  }
  next();
});

export default mongoose.models.Banner || mongoose.model('Banner', bannerSchema);