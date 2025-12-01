// models/Banner.js
import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  description: { type: String },
  discount: { type: String },
  from: { type: Number }, 
  sale: { type: String },
  image: { type: String, required: true }, // Image URL or path
  buttonText: { type: String, default: 'Shop Now' },
  isActive: { type: Boolean, default: false }, // Toggle show banner
  order: { type: Number, default: 0 }, // Display order (optional)
}, {
  timestamps: true
});

// Limit to a maximum of 10 active banners
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