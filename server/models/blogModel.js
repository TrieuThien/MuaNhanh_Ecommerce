// models/blogModel.js
import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Tiêu đề là bắt buộc"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: [300, "Short description must not exceed 300 characters"],
      default: "", // allow empty
    },
    featuredImage: {
      type: String,
      required: [true, "Featured image is required"],
    },
    author: {
      type: String,
      default: "Admin",
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// AUTOMATICALLY GENERATE SLUG + EXCERPT + publishedAt
blogSchema.pre("save", function (next) {
  // 1. Generate slug from title (if not present)
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
      .slice(0, 100); // limit slug length
  }

  // 2. Automatically generate excerpt if not present (take first 280 characters of content)
  if (!this.excerpt && this.content) {
    this.excerpt = this.content.replace(/<[^>]*>/g, "").slice(0, 280).trim() + "...";
  }

  // 3. Automatically set publishedAt when published
  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  next();
});

// Only unique slugs
blogSchema.pre("save", async function (next) {
  if (this.isModified("slug") || this.isNew) {
    let slug = this.slug;
    let count = 1;
    while (await this.constructor.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${this.slug}-${count}`;
      count++;
    }
    this.slug = slug;
  }
  next();
});

const blogModel = mongoose.models.blog || mongoose.model("blog", blogSchema);

export default blogModel;