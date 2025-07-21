const express=require("express");
const MCQ = require("../models/MCQ");
const { authenticateTeacher } = require("../middleware/teacherauth");
const { create } = require("../models/Admin");
const Question = require("../models/Question");
const Course = require("../models/Course");
const Teaceherrouter=express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const Teacher = require("../models/Teacher");
// Configure storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './public/uploads/courses/';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + uuidv4();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Middleware to handle multiple file uploads
const uploadMultiple = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'attachments', maxCount: 10 },
  { name: 'contentVideos', maxCount: 20 },
  { name: 'contentThumbnails', maxCount: 20 }
]);

// --------------------------teacher-profile---------------------------------
// Get teacher profile data
Teaceherrouter.get('/teacher-profile/:id', authenticateTeacher, async (req, res) => {
  try {
    console.log(req.params.id)
    // Find the teacher by ID, excluding the password field
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    res.status(200).json({
      success: true,
      data: teacher
    });
  } catch (error) {
    console.error('Error fetching teacher profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher profile',
      error: error.message
    });
  }
});

// -------------------------- Password Update ----------------------------
Teaceherrouter.put('/update-password/:id', authenticateTeacher, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const teacherId = req.params.id;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Find the teacher and include the password field
    const teacher = await Teacher.findById(teacherId).select('+password');
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Verify current password
    const isMatch = await teacher.correctPassword(currentPassword, teacher.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Validate new password
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      });
    }

    if (!/\d/.test(newPassword) || !/[!@#$%^&*]/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain a number and a special character'
      });
    }

    // Update password
    teacher.password = newPassword;
    await teacher.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update password',
      error: error.message
    });
  }
});

// -------------------------- Profile Update ----------------------------
Teaceherrouter.put('/update-profile/:id', authenticateTeacher, async (req, res) => {
  try {
    const teacherId = req.params.id;
    const updates = req.body;

    // Find the teacher
    const teacher = await Teacher.findById(teacherId);
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // List of allowed fields to update
    const allowedUpdates = [
      'full_name', 
      'phone', 
      'specialization', 
      'qualifications', 
      'linkedin_url', 
      'hourly_rate',
      'profile_photo'
    ];

    // Validate updates
    const isValidOperation = Object.keys(updates).every(update => 
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).json({
        success: false,
        message: 'Invalid updates!'
      });
    }

    // Special validation for phone number if being updated
    if (updates.phone && !/^\+[1-9]\d{1,14}$/.test(updates.phone)) {
      return res.status(400).json({
        success: false,
        message: 'Include country code (e.g., +880)'
      });
    }

    // Special validation for full_name if being updated
    if (updates.full_name && updates.full_name.trim().split(/\s+/).length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Must include first and last name'
      });
    }

    // Special validation for hourly_rate if being updated
    if (updates.hourly_rate !== undefined && updates.hourly_rate < 10) {
      return res.status(400).json({
        success: false,
        message: 'Minimum $10/hour'
      });
    }

    // Apply updates
    Object.keys(updates).forEach(update => {
      teacher[update] = updates[update];
    });

    // Update last_modified timestamp
    teacher.last_updated = Date.now();

    await teacher.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: teacher
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// -------------------------- Profile Photo Update ----------------------------
Teaceherrouter.put('/update-profile-photo/:id', authenticateTeacher, upload.single('profile_photo'), async (req, res) => {
  try {
    const teacherId = req.params.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Profile photo is required'
      });
    }

    // Find the teacher
    const teacher = await Teacher.findById(teacherId);
    
    if (!teacher) {
      // Delete the uploaded file if teacher not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Delete old profile photo if exists
    if (teacher.profile_photo) {
      try {
        fs.unlinkSync(teacher.profile_photo);
      } catch (err) {
        console.error('Error deleting old profile photo:', err);
      }
    }

    // Update profile photo path
    teacher.profile_photo = req.file.path;
    teacher.last_updated = Date.now();
    await teacher.save();

    res.status(200).json({
      success: true,
      message: 'Profile photo updated successfully',
      data: {
        profile_photo: teacher.profile_photo
      }
    });

  } catch (error) {
    console.error('Error updating profile photo:', error);
    // Delete the uploaded file if error occurs
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update profile photo',
      error: error.message
    });
  }
});
// Create a new MCQ
Teaceherrouter.post('/create-mcq', authenticateTeacher, async (req, res) => {
  try {
    const { question, options, correctAnswer, explanation, points } = req.body;

    // Validate required fields
    if (!question || !options || correctAnswer === undefined || points === undefined) {
      return res.status(400).send({ error: 'Missing required fields' });
    }

    // Create the MCQ
    const mcq = new MCQ({
      question,
      options,
      correctAnswer,
      explanation: explanation || '', // Default to empty string if not provided
      points,
      createdBy: req.body.user_id
    });

    await mcq.save();
    res.status(201).send(mcq);
  } catch (error) {
    console.log(error)
    res.status(500).send({ error: 'Server error while creating MCQ' });
  }
});

// Get all MCQs 
Teaceherrouter.get('/all-mcq',authenticateTeacher, async (req, res) => {
  try {
    const mcqs = await MCQ.find().sort({createdAt: -1})
    res.send(mcqs);
  } catch (error) {
    res.status(500).send();
  }
});
Teaceherrouter.get('/teacher-own-mcq/:id',authenticateTeacher, async (req, res) => {
  try {
    const mcqs = await MCQ.find({createdBy:req.params.id}).sort({createdAt: -1})
    res.send(mcqs);
  } catch (error) {
    res.status(500).send();
  }
});
// Get a specific MCQ
Teaceherrouter.get('/single-mcq/:id',authenticateTeacher, async (req, res) => {
  try {
    const mcq = await MCQ.findById(req.params.id);
    if (!mcq) {
      return res.status(404).send();
    }
    res.send(mcq);
  } catch (error) {
    res.status(500).send();
  }
});

// Update an MCQ
Teaceherrouter.put('/update-mcq/:id', authenticateTeacher, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['question', 'options', 'correctAnswer', 'category', 'difficulty', 'explanation'];

  try {
    const mcq = await MCQ.findOne({ _id: req.params.id, createdBy: req.body.user_id });

    if (!mcq) {
      return res.status(404).send();
    }

    updates.forEach(update => mcq[update] = req.body[update]);
    await mcq.save();
    res.send(mcq);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete an MCQ
Teaceherrouter.delete('/delete-mcq/:id', authenticateTeacher, async (req, res) => {
  try {
    const mcq = await MCQ.findOneAndDelete({ _id: req.params.id, createdBy: req.body.user_id });
    if (!mcq) {
      return res.status(404).send();
    }
    res.send(mcq);
  } catch (error) {
    console.log(error)
    res.status(500).send();
  }
});

// ---------------------------------------question-routes----------------------------
// Get all questions
Teaceherrouter.get('/',authenticateTeacher, async (req, res) => {
  try {
  
    const questions = await Question.find({}).sort({createdAt:-1})
    res.send(questions);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Get a specific question
Teaceherrouter.get('/single-question/:id',authenticateTeacher, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'username'); // Adjust fields as needed

    if (!question) {
      return res.status(404).send({ error: 'Question not found' });
    }

    // Increment view count
    question.views += 1;
    await question.save();

    res.send(question);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});
// Create a new question 
Teaceherrouter.post('/create-question', authenticateTeacher, async (req, res) => {
  try {
    const { questions, user_id } = req.body;
    
    // Validate input
    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ 
        error: 'Validation failed',
        message: 'Questions array is required'
      });
    }

    if (!user_id) {
      return res.status(400).json({ 
        error: 'Validation failed',
        message: 'User ID is required'
      });
    }

    // Process each question
    const createdQuestions = [];
    for (const q of questions) {
      // Validate required fields for each question
      if (!q.title || !q.content || q.number === undefined) {
        return res.status(400).json({ 
          error: 'Validation failed',
          message: 'Each question must have title, content, and number'
        });
      }

      const question = new Question({
        title: q.title,
        content: q.content,
        type: q.type || 'block',
        number: q.number,
        tags: q.tags || [],
        author: user_id
      });

      await question.save();
      createdQuestions.push({
        _id: question._id,
        title: question.title,
        type: question.type,
        number: question.number,
        tags: question.tags,
        createdAt: question.createdAt
      });
    }
    
    res.status(201).json({
      message: `${createdQuestions.length} question(s) created successfully`,
      questions: createdQuestions
    });
    
  } catch (error) {
    console.error('Error creating question:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});
Teaceherrouter.get('/teacher-own-cq/:id',authenticateTeacher, async (req, res) => {
  try {
    const mcqs = await Question.find({author:req.params.id}).sort({createdAt: -1})
    res.send(mcqs);
  } catch (error) {
    res.status(500).send();
  }
});
// Update a question
Teaceherrouter.put('/update-question/:id', authenticateTeacher, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['title', 'content', 'type', 'number', 'tags'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const question = await Question.findOne({
      _id: req.params.id,
      author: req.user._id
    });

    if (!question) {
      return res.status(404).send({ error: 'Question not found or not authorized' });
    }

    updates.forEach(update => question[update] = req.body[update]);
    question.updatedAt = Date.now();
    await question.save();

    res.send(question);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});
// Delete a question
Teaceherrouter.delete('/delete-question/:id', authenticateTeacher, async (req, res) => {
  try {
    const question = await Question.findOneAndDelete({
      _id: req.params.id,
    });
    if (!question) {
      return res.status(404).send({ error: 'Question not found or not authorized' });
    }

    res.send(question);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// ---------------------------- Course Routes ----------------------------

// Create a new course
Teaceherrouter.post('/create-course', authenticateTeacher, uploadMultiple, async (req, res) => {
  try {
    console.log(req.body)
    // First handle the file uploads
    if (!req.files || !req.files['thumbnail']) {
      return res.status(400).json({
        success: false,
        message: 'Course thumbnail is required'
      });
    }

    const {
      title,
      description,
      type,
      price,
      content,
      categories,
      requirements,
      whatYouWillLearn,
      level,
      status
    } = req.body;

    // Validate required fields
    if (!title || !description || !type) {
      // Clean up uploaded files if validation fails
      if (req.files) {
        Object.values(req.files).forEach(fileArray => {
          fileArray.forEach(file => {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          });
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Title, description, and type are required'
      });
    }

    // Parse the content array from JSON string
    let contentItems = [];
    try {
      contentItems = JSON.parse(content);
    } catch (parseError) {
      // Clean up uploaded files if parsing fails
      if (req.files) {
        Object.values(req.files).forEach(fileArray => {
          fileArray.forEach(file => {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          });
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid content format'
      });
    }

    // Process the thumbnail
    const thumbnailFile = req.files['thumbnail'][0];
    const thumbnail = {
      filename: thumbnailFile.filename,
      path: thumbnailFile.path,
      size: thumbnailFile.size,
      mimetype: thumbnailFile.mimetype
    };

    // Process attachments if any
    const attachments = [];
    if (req.files['attachments']) {
      req.files['attachments'].forEach(file => {
        attachments.push({
          filename: file.originalname,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype
        });
      });
    }

    // Process content videos and thumbnails
    const contentVideos = req.files['contentVideos'] || [];
    const contentThumbnails = req.files['contentThumbnails'] || [];
    
    // Map content videos to their respective content items
    let videoIndex = 0;
    let thumbnailIndex = 0;
    
    const processedContent = contentItems.map(item => {
      const contentItem = { ...item };
      
      if (item.type === 'tutorial' && type === 'premium') {
        if (videoIndex < contentVideos.length) {
          const videoFile = contentVideos[videoIndex];
          contentItem.content = videoFile.path;
          videoIndex++;
        }
      }
      
      if (item.type === 'live' && thumbnailIndex < contentThumbnails.length) {
        const thumbnailFile = contentThumbnails[thumbnailIndex];
        contentItem.thumbnail = thumbnailFile.path;
        thumbnailIndex++;
      }
      
      // For quizzes, ensure questions are properly formatted
      if (item.type === 'quiz') {
        contentItem.questions = item.questions.map(question => {
          // Ensure correctAnswer is properly formatted
          if (question.type === 'mcq-single') {
            question.correctAnswer = parseInt(question.correctAnswer) || 0;
          } else if (question.type === 'mcq-multiple') {
            question.correctAnswer = Array.isArray(question.correctAnswer) 
              ? question.correctAnswer.map(Number)
              : [];
          }
          return question;
        });
      }
      
      return contentItem;
    });

    // Create the new course
    const newCourse = new Course({
      title,
      description,
      instructor: req.body.user_id,
      thumbnail,
      attachments,
      content: processedContent,
      price: type === 'premium' ? parseFloat(price) || 0 : 0,
      type,
      status: status || 'draft',
      categories: JSON.parse(categories) || [],
      requirements: JSON.parse(requirements) || [],
      whatYouWillLearn: JSON.parse(whatYouWillLearn) || [],
      level: level || 'beginner',
      createbyid: req.body.user_id,
      createbydtype: 'teacher'
    });

    // Save the course to the database
    await newCourse.save();

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: newCourse
    });
  } catch (error) {
    console.error('Error creating course:', error);
    
    // Clean up uploaded files if there was an error
    if (req.files) {
      Object.values(req.files).forEach(fileArray => {
        fileArray.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: error.message
    });
  }
});

// Get all courses
Teaceherrouter.get('/all-courses', authenticateTeacher, async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.send(courses);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Get courses created by the current teacher
Teaceherrouter.get('/my-courses/:id', authenticateTeacher, async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.params.id }).sort({ createdAt: -1 });
    res.send(courses);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Get a specific course
Teaceherrouter.get('/single-course/:id', authenticateTeacher, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'username email')
      .populate('studentsEnrolled', 'username email')
      .populate('ratings.user', 'username');

    if (!course) {
      return res.status(404).send({ error: 'Course not found' });
    }
    res.send(course);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Update a course
Teaceherrouter.put('/update-course/:id', authenticateTeacher, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    'title', 'description', 'thumbnail', 'attachments', 'price', 
    'type', 'status', 'categories', 'duration', 'requirements',
    'whatYouWillLearn', 'level', 'content'
  ];
  
  // const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  // if (!isValidOperation) {
  //   return res.status(400).send({ error: 'Invalid updates!' });
  // }

  try {
    const course = await Course.findOne({
      _id: req.params.id,
      createbyid: req.body.user_id
    });

    if (!course) {
      return res.status(404).send({ error: 'Course not found or not authorized' });
    }

    updates.forEach(update => course[update] = req.body[update]);
    await course.save();

    res.send(course);
  } catch (error) {
       console.log(error)
    res.status(400).send({ error: error.message });
  }
});

// Delete a course
Teaceherrouter.delete('/delete-course/:id', authenticateTeacher, async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({
      _id: req.params.id,
      createbyid: req.user._id
    });

    if (!course) {
      return res.status(404).send({ error: 'Course not found or not authorized' });
    }

    res.send(course);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Add content to a course
Teaceherrouter.post('/add-content/:courseId', authenticateTeacher, async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.courseId,
      createbyid: req.user._id
    });

    if (!course) {
      return res.status(404).send({ error: 'Course not found or not authorized' });
    }

    course.content.push(req.body);
    await course.save();
    res.send(course);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Update course content item
Teaceherrouter.put('/update-content/:courseId', authenticateTeacher, async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.courseId,
      createbyid: req.user._id
    });

    if (!course) {
      return res.status(404).send({ error: 'Course not found or not authorized' });
    }

    const contentItem = course.content.id(req.params.contentId);
    if (!contentItem) {
      return res.status(404).send({ error: 'Content item not found' });
    }

    Object.assign(contentItem, req.body);
    await course.save();
    res.send(course);
  } catch (error) {
    console.log(error)
    res.status(400).send({ error: error.message });
  }
});

// Delete course content item
Teaceherrouter.delete('/delete-content/:courseId', authenticateTeacher, async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete({
      _id: req.params.courseId,
    });
   console.log((req.params))
   res.send({success:true,message:"Deleted successfully!"})
  } catch (error) {
    console.log(error)
    res.status(400).send({ error: error.message });
  }
});

module.exports=Teaceherrouter;