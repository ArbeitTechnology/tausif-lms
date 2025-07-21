const mongoose = require('mongoose');

const mcqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function(options) {
        return options.length >= 2 && options.length <= 5;
      },
      message: 'MCQ must have between 2 to 5 options'
    }
  },
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function(value) {
        return value < this.options.length;
      },
      message: 'Correct answer index must be within options range'
    }
  },

  explanation: {
    type: String,
    trim: true
  },
    points: {
    type: Number,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const MCQ = mongoose.model('MCQ', mcqSchema);

module.exports = MCQ;