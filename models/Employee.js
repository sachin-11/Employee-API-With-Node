const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
   username: {
    type: String,
    trim: true,
    required: [true, 'Please add a full  name'],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false,
  },
  confirmpassword: {
    type: String,
    required: [true, 'Please add confirm password'],
    minlength: 6,
    select: false,
  },
  logo: {
    type: String,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
});

module.exports = mongoose.model('Employee', EmployeeSchema);
