import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Job role is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['saved', 'applied', 'interview', 'offer', 'rejected'],
      default: 'applied',
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    jobUrl: {
      type: String,
      trim: true,
    },
    jobDescription: {
      type: String,
    },
    notes: {
      type: String,
    },
    aiScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    coverLetter: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Job', jobSchema);