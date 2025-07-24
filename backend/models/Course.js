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
  correctAnswer: Schema.Types.Mixed,
  answer: String,
});

const contentItemSchema = new Schema({
  type: { 
    type: String, 
    required: true,
    enum: ['tutorial', 'quiz', 'live']
  },
  title: { type: String, required: true },
  description: String,
  content: String,
  youtubeLink: String,
  thumbnail: { 
    type: String,
    default: null // Ensure it defaults to null if not provided
  },
  meetingLink: String,
  schedule: Date,
  questions: [questionSchema],
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
    required: true
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
  category:{
    type:String,
  },
  duration: Number,
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
  createbyid: { type: String, required: true }
}, { timestamps: true });

// Calculate average rating
courseSchema.methods.updateAverageRating = function() {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    return;
  }
  
  const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
  this.averageRating = sum / this.ratings.length;
};

// Pre-save hooks
courseSchema.pre('save', function(next) {
  // Clean content items
  this.content = this.content.map(item => {
    if (item.thumbnail && typeof item.thumbnail === 'object') {
      item.thumbnail = item.thumbnail.path || null;
    }
    return item;
  });

  if (this.isModified('ratings')) {
    this.updateAverageRating();
  }
  next();
});

module.exports = mongoose.model('Course', courseSchema);