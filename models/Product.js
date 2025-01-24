const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  images: [{
    type: String,
    required: true
  }],
  category: {
    type: String,
    required: true,
    enum: ['t-shirts', 'hoodies', 'accessories']
  },
  sizes: [{
    type: String,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  }],
  colors: [{
    name: String,
    hex: String
  }],
  inStock: {
    type: Boolean,
    default: true
  },
  customizable: {
    type: Boolean,
    default: false
  },
  customizationOptions: {
    textPlacement: [String],
    maxTextLength: Number,
    availableFonts: [String],
    customDesigns: [{
      name: String,
      previewUrl: String,
      price: Number
    }]
  },
  supplier: {
    id: String,
    name: String,
    processingTime: String,
    shippingTime: String
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for better search performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Update the updatedAt timestamp before saving
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema);
