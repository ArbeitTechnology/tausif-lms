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
const Category = require("../models/Category");
const Student = require("../models/Student");
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
// -------------------------- Course Update Route ----------------------------
Teaceherrouter.put('/update-course/:id', upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'attachments', maxCount: 10 }
]), async (req, res) => {
  try {
    const courseId = req.params.id;
    const updates = req.body;
    const files = req.files;

    // Find the course
    const course = await Course.findById(courseId);
    
    if (!course) {
      // Clean up uploaded files if course not found
      if (files) {
        Object.values(files).forEach(fileArray => {
          fileArray.forEach(file => {
            fs.unlinkSync(file.path);
          });
        });
      }
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Handle thumbnail update if provided
    if (files && files.thumbnail) {
      // Delete old thumbnail if exists
      if (course.thumbnail && course.thumbnail.path) {
        try {
          fs.unlinkSync(course.thumbnail.path);
        } catch (err) {
          console.error('Error deleting old thumbnail:', err);
        }
      }
      
      // Update thumbnail
      course.thumbnail = {
        filename: files.thumbnail[0].originalname,
        path: files.thumbnail[0].path,
        size: files.thumbnail[0].size,
        mimetype: files.thumbnail[0].mimetype
      };
    }

    // Handle attachments update if provided
    if (files && files.attachments) {
      // Delete old attachments if exists (optional - you might want to keep them)
      // If you want to replace all attachments:
      if (course.attachments && course.attachments.length > 0) {
        course.attachments.forEach(attachment => {
          try {
            fs.unlinkSync(attachment.path);
          } catch (err) {
            console.error('Error deleting old attachment:', err);
          }
        });
      }
      
      // Add new attachments
      course.attachments = files.attachments.map(file => ({
        filename: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype
      }));
    }

    // Update other fields
    const allowedUpdates = [
      'title',
      'description',
      'price',
      'type',
      'status',
      'category',
      'requirements',
      'whatYouWillLearn',
      'level',
      'content'
    ];

    // Validate and apply updates
    Object.keys(updates).forEach(update => {
      if (allowedUpdates.includes(update)) {
        // Special handling for content array if needed
        if (update === 'content' && typeof updates.content === 'string') {
          try {
            course[update] = JSON.parse(updates.content);
          } catch (err) {
            console.error('Error parsing content:', err);
          }
        } else {
          course[update] = updates[update];
        }
      }
    });

    // Update timestamps
    course.updatedAt = new Date();

    // Save the updated course
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });

  } catch (error) {
    console.error('Error updating course:', error);
    
    // Clean up uploaded files if error occurs
    if (req.files) {
      Object.values(req.files).forEach(fileArray => {
        fileArray.forEach(file => {
          fs.unlinkSync(file.path);
        });
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update course',
      error: error.message
    });
  }
});

// -------------------------- Delete Attachment Route ----------------------------
Teaceherrouter.delete('/delete-attachment/:courseId/:attachmentId', async (req, res) => {
  try {
    const { courseId, attachmentId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Find the attachment
    const attachmentIndex = course.attachments.findIndex(
      att => att._id.toString() === attachmentId
    );

    if (attachmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }

    // Delete the file from filesystem
    const attachment = course.attachments[attachmentIndex];
    try {
      fs.unlinkSync(attachment.path);
    } catch (err) {
      console.error('Error deleting attachment file:', err);
    }

    // Remove from array
    course.attachments.splice(attachmentIndex, 1);
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Attachment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting attachment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete attachment',
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
// Teacher routes for courses
Teaceherrouter.get(
  "/my-courses/:teacherId",
  authenticateTeacher,
  async (req, res) => {
    try {
      const courses = await Course.find({ instructor: req.params.teacherId });
      res.json(courses);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching teacher courses",
      });
    }
  }
);

Teaceherrouter.get(
  "/my-course/:courseId",
  authenticateTeacher,
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.courseId)
        .populate("instructor", "name email")
        .populate("studentsEnrolled", "name email");

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      // Verify that the requesting teacher is the course instructor
      if (course.instructor._id.toString() !== req.teacher._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized access to this course",
        });
      }

      res.json(course);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching course",
      });
    }
  }
);

Teaceherrouter.put(
  "/update-course/:courseId",
  [
    authenticateTeacher,
    upload.fields([
      { name: "thumbnail", maxCount: 1 },
      { name: "attachments", maxCount: 10 },
      { name: "contentThumbnails", maxCount: 10 },
      { name: "contentVideos", maxCount: 10 },
    ]),
  ],
  async (req, res) => {
    try {
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
        status,
        category,
      } = req.body;

      // First verify the teacher owns this course
      const existingCourse = await Course.findById(req.params.courseId);
      if (!existingCourse) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      if (existingCourse.instructor.toString() !== req.teacher._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to update this course",
        });
      }

      // Handle thumbnail update
      if (req.files.thumbnail) {
        const thumbnailFile = req.files.thumbnail[0];
        existingCourse.thumbnail = {
          filename: thumbnailFile.originalname,
          path: thumbnailFile.path,
          size: thumbnailFile.size,
          mimetype: thumbnailFile.mimetype,
        };
      }

      // Update fields
      if (title) existingCourse.title = title;
      if (description) existingCourse.description = description;
      if (type) existingCourse.type = type;
      if (price) existingCourse.price = parseFloat(price);
      if (content)
        existingCourse.content =
          typeof content === "string" ? JSON.parse(content) : content;
      if (categories)
        existingCourse.categories =
          typeof categories === "string" ? JSON.parse(categories) : categories;
      if (requirements)
        existingCourse.requirements =
          typeof requirements === "string"
            ? requirements.split(",")
            : requirements;
      if (whatYouWillLearn)
        existingCourse.whatYouWillLearn =
          typeof whatYouWillLearn === "string"
            ? whatYouWillLearn.split(",")
            : whatYouWillLearn;
      if (level) existingCourse.level = level;
      if (status) existingCourse.status = status;
      if (category) existingCourse.category = category;

      // Handle attachments
      if (req.files.attachments) {
        const attachmentFiles = req.files.attachments.map((file) => ({
          filename: file.originalname,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype,
        }));
        existingCourse.attachments = [
          ...existingCourse.attachments,
          ...attachmentFiles,
        ];
      }

      // Handle premium content
      if (type === "premium") {
        if (req.files.contentVideos) {
          // Process video uploads
          // You'll need to map these to the appropriate content items
        }
        if (req.files.contentThumbnails) {
          // Process thumbnail uploads for live classes
        }
      }

      await existingCourse.save();

      res.json({
        success: true,
        message: "Course updated successfully",
        data: existingCourse,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while updating course",
      });
    }
  }
);

Teaceherrouter.delete(
  "/delete-content/:courseId",
  authenticateTeacher,
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      // Verify the teacher owns this course
      if (course.instructor.toString() !== req.teacher._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to delete this course",
        });
      }

      await course.remove();

      res.json({
        success: true,
        message: "Course deleted successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while deleting course",
      });
    }
  }
);

Teaceherrouter.get('/enrolled-courses', authenticateTeacher, async (req, res) => {
  try {
    // Find the student and populate the course details
    const student = await Student.findById(req.user.id)
      .populate({
        path: 'enrolledCourses.course',
        select: 'title description instructor thumbnail price category level totalStudents rating duration language',
        populate: {
          path: 'instructor',
          select: 'full_name profile_picture'
        }
      })
      .select('enrolledCourses');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Format the response data
    const enrolledCourses = student.enrolledCourses.map(enrollment => {
      const course = enrollment.course;
      return {
        courseId: course._id,
        title: course.title,
        description: course.description,
        instructor: course.instructor,
        thumbnail: course.thumbnail,
        price: course.price,
        category: course.category,
        level: course.level,
        duration: course.duration,
        language: course.language,
        enrolledAt: enrollment.enrolledAt,
        progress: enrollment.progress,
        completed: enrollment.completed,
        lastAccessed: enrollment.lastAccessed,
        totalContentItems: course.content ? course.content.length : 0,
        completedContentItems: enrollment.contentProgress ? enrollment.contentProgress.filter(cp => cp.completed).length : 0,
        quizAttempts: enrollment.quizAttempts.length,
        certificates: enrollment.certificates,
        nextRecommendedContent: getNextRecommendedContent(enrollment.contentProgress, course.content)
      };
    });

    // Sort by last accessed (most recent first) or by progress (highest first)
    enrolledCourses.sort((a, b) => {
      if (a.lastAccessed && b.lastAccessed) {
        return new Date(b.lastAccessed) - new Date(a.lastAccessed);
      }
      return b.progress - a.progress;
    });

    res.status(200).json({
      success: true,
      count: enrolledCourses.length,
      data: enrolledCourses
    });
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching enrolled courses',
      error: error.message 
    });
  }
});
Teaceherrouter.get('/enrolled-courses/:studentId', authenticateTeacher, async (req, res) => {
  try {
    // Validate student ID
    if (!mongoose.Types.ObjectId.isValid(req.params.studentId)) {
      return res.status(400).json({ success: false, message: 'Invalid student ID' });
    }

    // Check if the requesting user has permission (student or admin)
    if (req.user.role !== 'admin' && req.user.id !== req.params.studentId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to access these courses' 
      });
    }

    // Find the student with enrolled courses populated
    const student = await Student.findById(req.params.studentId)
      .select('enrolledCourses')
      .populate({
        path: 'enrolledCourses.course',
        select: 'title description instructor thumbnail price categories level duration content',
        populate: {
          path: 'instructor',
          select: 'full_name profile_picture'
        }
      });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Format the response data
    const enrolledCourses = await Promise.all(student.enrolledCourses.map(async (enrollment) => {
      const course = enrollment.course;
      
      // Calculate total content items
      const totalContentItems = course.content ? course.content.length : 0;
      
      // Calculate completed content items
      const completedContentItems = enrollment.contentProgress 
        ? enrollment.contentProgress.filter(cp => cp.completed).length 
        : 0;

      // Format thumbnail URL
      let thumbnailUrl = '/default-thumbnail.jpg';
      if (course.thumbnail) {
        thumbnailUrl = typeof course.thumbnail === 'string' 
          ? course.thumbnail 
          : course.thumbnail.path || '/default-thumbnail.jpg';
        // Normalize path for Windows/Linux compatibility
        thumbnailUrl = thumbnailUrl.replace(/\\/g, '/');
      }

      // Get next recommended content
      const nextContent = getNextRecommendedContent(enrollment.contentProgress, course.content);

      return {
        enrollmentInfo: {
          _id: enrollment._id,
          enrolledAt: enrollment.enrolledAt,
          progress: enrollment.progress,
          completed: enrollment.completed,
          lastAccessed: enrollment.lastAccessed,
          completedContentItems,
          totalContentItems,
          quizAttempts: enrollment.quizAttempts ? enrollment.quizAttempts.length : 0,
          certificates: enrollment.certificates || []
        },
        courseDetails: {
          _id: course._id,
          title: course.title,
          description: course.description,
          instructor: course.instructor,
          thumbnail: {
            path: thumbnailUrl,
            alt: course.title
          },
          price: course.price,
          categories: course.categories || [],
          level: course.level,
          duration: course.duration, // in minutes
          contentCount: totalContentItems,
          nextRecommendedContent: nextContent
        }
      };
    }));

    // Sort courses by last accessed (most recent first) or by progress (highest first)
    enrolledCourses.sort((a, b) => {
      const aDate = a.enrollmentInfo.lastAccessed || a.enrollmentInfo.enrolledAt;
      const bDate = b.enrollmentInfo.lastAccessed || b.enrollmentInfo.enrolledAt;
      
      if (aDate && bDate) {
        return new Date(bDate) - new Date(aDate);
      }
      return b.enrollmentInfo.progress - a.enrollmentInfo.progress;
    });

    res.status(200).json({
      success: true,
      count: enrolledCourses.length,
      enrolledCourses
    });

  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching enrolled courses',
      error: error.message 
    });
  }
});

// Helper function to determine next recommended content
function getNextRecommendedContent(contentProgress = [], courseContent = []) {
  if (courseContent.length === 0) return null;

  // Find the first content item not marked as completed
  for (const contentItem of courseContent) {
    const progressItem = contentProgress.find(cp => 
      cp.contentItemId && contentItem._id && 
      cp.contentItemId.toString() === contentItem._id.toString()
    );
    
    if (!progressItem || !progressItem.completed) {
      return {
        contentItemId: contentItem._id,
        title: contentItem.title || 'Untitled Content',
        type: contentItem.type || 'lesson'
      };
    }
  }
  
  // If all content is completed, return the first item
  const firstItem = courseContent[0];
  return {
    contentItemId: firstItem._id,
    title: firstItem.title || 'Untitled Content',
    type: firstItem.type || 'lesson'
  };
}

// Helper function to determine next recommended content
function getNextRecommendedContent(contentProgress, courseContent) {
  if (!courseContent || courseContent.length === 0) return null;
  
  // Find the first content item not marked as completed
  for (const contentItem of courseContent) {
    const progressItem = contentProgress.find(cp => 
      cp.contentItemId.toString() === contentItem._id.toString()
    );
    
    if (!progressItem || !progressItem.completed) {
      return {
        contentItemId: contentItem._id,
        title: contentItem.title,
        type: contentItem.type
      };
    }
  }
  
  // If all content is completed, return the first item
  return {
    contentItemId: courseContent[0]._id,
    title: courseContent[0].title,
    type: courseContent[0].type
  };
}
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
    // Validate required files
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
      status,
      user_id,
      category
    } = req.body;

    // Validate required fields
    if (!title || !description || !type || !user_id) {
      cleanupFiles(req.files);
      return res.status(400).json({
        success: false,
        message: 'Title, description, type, and user ID are required'
      });
    }

    // Parse JSON content safely
    let contentItems = [];
    try {
      contentItems = typeof content === 'string' ? JSON.parse(content) : content;
      
      // Ensure contentItems is an array
      if (!Array.isArray(contentItems)) {
        throw new Error('Content must be an array');
      }
    } catch (parseError) {
      cleanupFiles(req.files);
      return res.status(400).json({
        success: false,
        message: 'Invalid content format',
        error: parseError.message
      });
    }

    // Process thumbnail
    const thumbnailFile = req.files['thumbnail'][0];
    const thumbnail = {
      filename: thumbnailFile.filename,
      path: thumbnailFile.path,
      size: thumbnailFile.size,
      mimetype: thumbnailFile.mimetype
    };

    // Process attachments
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
    
    let videoIndex = 0;
    let thumbnailIndex = 0;
    
    const processedContent = contentItems.map(item => {
      const contentItem = { ...item };
      
      // Clean thumbnail if it's an object
      if (contentItem.thumbnail && typeof contentItem.thumbnail === 'object') {
        contentItem.thumbnail = null;
      }
      
      // Handle premium tutorial videos
      if (item.type === 'tutorial' && type === 'premium') {
        if (videoIndex < contentVideos.length) {
          contentItem.content = contentVideos[videoIndex].path;
          videoIndex++;
        }
      }
      
      // Handle thumbnails for live sessions
      if (item.type === 'live' && thumbnailIndex < contentThumbnails.length) {
        contentItem.thumbnail = contentThumbnails[thumbnailIndex].path;
        thumbnailIndex++;
      }
      
      // Process quiz questions
      if (item.type === 'quiz' && item.questions) {
        contentItem.questions = item.questions.map(q => ({
          ...q,
          correctAnswer: formatCorrectAnswer(q.type, q.correctAnswer)
        }));
      }
      
      return contentItem;
    });

    // Create the new course
    const newCourse = new Course({
      title,
      description,
      instructor: user_id,
      thumbnail,
      attachments,
      content: processedContent,
      price: type === 'premium' ? parseFloat(price) || 0 : 0,
      type,
      status: status || 'draft',
      categories: safeParseJSON(categories),
      requirements: safeParseJSON(requirements),
      whatYouWillLearn: safeParseJSON(whatYouWillLearn),
      level: level || 'beginner',
      createbyid: user_id,
      category
    });

    await newCourse.save();

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: newCourse
    });
  } catch (error) {
    console.error('Error creating course:', error);
    cleanupFiles(req.files);
    
    res.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: error.message
    });
  }
});

// Helper functions
function cleanupFiles(files) {
  if (files) {
    Object.values(files).forEach(fileArray => {
      fileArray.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    });
  }
}

function safeParseJSON(input) {
  try {
    return typeof input === 'string' ? JSON.parse(input) : (Array.isArray(input) ? input : []);
  } catch {
    return [];
  }
}

function formatCorrectAnswer(type, answer) {
  if (type === 'mcq-single') {
    return parseInt(answer) || 0;
  }
  if (type === 'mcq-multiple') {
    return Array.isArray(answer) ? answer.map(Number) : [];
  }
  return answer;
}

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
// ---------------------------all-category----------------------------
Teaceherrouter.get("/all-category",authenticateTeacher,async(req,res)=>{
  try {
    const allcategory=await Category.find();
    if(!allcategory){
      return res.send({success:false,message:"Category did not find!"})
    }
    res.send({success:true,data:allcategory})
  } catch (error) {
    console.log(error)
  }
})

module.exports=Teaceherrouter;