const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  pId: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: Buffer
  },
  status: {
    type: String,
    default: "pending"
  },
  reason: {
    type: String,
    default: null
  }
});

const Product = mongoose.model('product', productSchema);

module.exports = Product;