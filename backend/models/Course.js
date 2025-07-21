// models/Course.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const questionSchema = new Schema({
  question: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['mcq-single', 'mcq-multiple', 'short-answer', 'broad-answer']
  },
  options: [String],
  correctAnswer: Schema.Types.Mixed, // Can be number, array of numbers, or string
  answer: String, // For short/broad answers
});

const contentItemSchema = new Schema({
  type: { 
    type: String, 
    required: true,
    enum: ['tutorial', 'quiz', 'live']
  },
  title: { type: String, required: true },
  description: String,
  content: String, // For premium video content path
  youtubeLink: String, // For free courses
  thumbnail: String, // Path to thumbnail image
  meetingLink: String, // For live classes
  schedule: Date, // For live classes
  questions: [questionSchema], // For quizzes
  isPremium: { type: Boolean, default: false }
}, { timestamps: true });

const attachmentSchema = new Schema({
  filename: { type: String, required: true },
  path: { type: String, required: true },
  size: { type: Number, required: true },
  mimetype: { type: String, required: true }
});

const courseSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  instructor: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
  },
  thumbnail: { 
    filename: String,
    path: String,
    size: Number,
    mimetype: String
  },
  attachments: [attachmentSchema],
  content: [contentItemSchema],
  price: { type: Number, default: 0 },
  type: { 
    type: String, 
    required: true,
    enum: ['free', 'premium'],
    default: 'free'
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'draft'],
    default: 'draft'
  },
  categories: [{ type: String }],
  duration: Number, // in minutes
  studentsEnrolled: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  ratings: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    review: String
  }],
  averageRating: { type: Number, default: 0 },
  requirements: [String],
  whatYouWillLearn: [String],
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
    previousInstructors: [{
    instructor: { type: Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  }],
  createbyid:String
}, { timestamps: true });

// Calculate average rating whenever a new rating is added
courseSchema.methods.updateAverageRating = function() {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    return;
  }
  
  const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
  this.averageRating = sum / this.ratings.length;
};

// Pre-save hook to update average rating
courseSchema.pre('save', function(next) {
  if (this.isModified('ratings')) {
    this.updateAverageRating();
  }
  next();
});

module.exports = mongoose.model('Course', courseSchema);