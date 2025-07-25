const express = require('express');
const Studentrouter = express.Router();
const studentAuth = require('../middleware/studentMiddleware');
const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const Course = require('../models/Course');
const mongoose=require("mongoose")
// Protected route - Get student profile
Studentrouter.get('/profile/:id', studentAuth, async (req, res) => {
  try {
    const matchedstudent = await Student.findById(req.params.id)
      .select('-password -otp -otpExpires -resetPasswordToken -resetPasswordExpire -loginAttempts -lockUntil');
    
    if (!matchedstudent) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    // Verify the requesting student has permission to view this profile
    if (req.student._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this profile.' });
    }

    res.status(200).json({ success: true, student: matchedstudent });  
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Protected route - Update student profile (excluding password)
Studentrouter.put('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, full_name, phone, date_of_birth, address } = req.body;

    // Verify the requesting student has permission to update this profile
    if (req.student._id.toString() !== id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this profile.' });
    }

    // Find the student
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    // Prepare update data (exclude sensitive fields)
    const updateData = {};
    if (email && email !== student.email) {
      updateData.email = email;
      updateData.isVerified = false; // Reset verification if email changes
    }
    if (full_name) updateData.full_name = full_name;
    if (phone) updateData.phone = phone;
    if (date_of_birth) updateData.date_of_birth = date_of_birth;
    if (address) updateData.address = address;

    // Update the student
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -otp -otpExpires -resetPasswordToken -resetPasswordExpire -loginAttempts -lockUntil');

    res.status(200).json({ success: true, student: updatedStudent });
  } catch (error) {
    console.log(error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already in use.' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Protected route - Update student password
Studentrouter.put('/profile/:id/password', studentAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Verify the requesting student has permission to update this password
    if (req.student._id.toString() !== id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this password.' });
    }

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    // Find the student
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, student.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    // Update password
    const salt = await bcrypt.genSalt(10);
    student.password = await bcrypt.hash(newPassword, salt);
    await student.save();

    res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});



// ------------------------------all-courses--------------------------------
Studentrouter.get('/all-courses', async (req, res) => {
  try {
    const allcourses=await Course.find();

    if(!allcourses){
      return res.send({success:false,message:"No courses found!"})
    }
    res.status(200).json({ success: true, courses: allcourses });  
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
// @access  Private (Student)
Studentrouter.post('/enroll/:courseId', async (req, res) => {
  try {
    // Get the course
    const course = await Course.findById(req.params.courseId);
    console.log(req.body.userid)
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Get the student (assuming student ID is in req.user from auth middleware)
    const student = await Student.findById(req.body.userid);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Check if already enrolled
    const isEnrolled = student.enrolledCourses.some(
      c => c.course.toString() === req.params.courseId
    );
    if (isEnrolled) {
      return res.status(400).json({ 
        success: false, 
        message: 'You are already enrolled in this course' 
      });
    }

    // Enroll the student using the method we defined in the model
    await student.enrollCourse(req.params.courseId);

    res.status(200).json({ 
      success: true, 
      message: 'Successfully enrolled in the course',
      enrolledCourses: student.enrolledCourses
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});
// Get enrolled courses for a student
Studentrouter.get("/my-courses", async (req, res) => {
  try {
    // Populate the enrolledCourses with course details
    const student = await Student.findById(req.student._id)
      .populate({
        path: 'enrolledCourses.course',
        select: 'title description thumbnail instructor rating duration price'
      })
      .select('enrolledCourses');

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Format the response
    const enrolledCourses = student.enrolledCourses.map(enrollment => ({
      course: {
        id: enrollment.course._id,
        title: enrollment.course.title,
        description: enrollment.course.description,
        thumbnail: enrollment.course.thumbnail,
        instructor: enrollment.course.instructor,
        rating: enrollment.course.rating,
        duration: enrollment.course.duration,
        price: enrollment.course.price
      },
      enrolledAt: enrollment.enrolledAt,
      progress: enrollment.progress,
      completed: enrollment.completed,
      lastAccessed: enrollment.lastAccessed,
      certificates: enrollment.certificates
    }));

    res.status(200).json({
      success: true,
      enrolledCourses,
      count: enrolledCourses.length
    });
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch enrolled courses", 
      error: error.message 
    });
  }
});
// Get enrolled courses for a specific student
Studentrouter.get('/enrolled-courses/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    // Find the student and populate enrolled courses
    const student = await Student.findById(studentId)
      .populate({
        path: 'enrolledCourses.course',
        select: 'title description thumbnail instructor duration price averageRating categories content'
      })
      .select('enrolledCourses');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Format the response
    const enrolledCourses = student.enrolledCourses.map(enrollment => ({
      courseDetails: enrollment.course,
      enrollmentInfo: {
        enrolledAt: enrollment.enrolledAt,
        progress: enrollment.progress,
        completed: enrollment.completed,
        lastAccessed: enrollment.lastAccessed
      }
    }));

    res.status(200).json({ 
      success: true,
      enrolledCourses,
      count: enrolledCourses.length
    });

  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch enrolled courses',
      error: error.message 
    });
  }
});

// Get quiz questions for a specific content item in an enrolled course
Studentrouter.get('/courses/:courseId/content/:contentId/quiz', studentAuth, async (req, res) => {
  try {
    const { courseId, contentId } = req.params;
    const studentId = req.student._id;

    // Check if student is enrolled in the course
    const student = await Student.findOne({
      _id: studentId,
      'enrolledCourses.course': courseId
    });

    if (!student) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not enrolled in this course or it does not exist' 
      });
    }

    // Get the course and content item
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    const contentItem = course.content.id(contentId);
    if (!contentItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Content item not found' 
      });
    }

    // Check if content item is a quiz
    if (contentItem.type !== 'quiz') {
      return res.status(400).json({ 
        success: false, 
        message: 'This content item is not a quiz' 
      });
    }

    // Return questions without correct answers
    const questions = contentItem.questions.map(question => {
      const { correctAnswer, ...questionWithoutAnswer } = question.toObject();
      return questionWithoutAnswer;
    });

    res.status(200).json({ 
      success: true, 
      quiz: {
        title: contentItem.title,
        description: contentItem.description,
        questions
      }
    });

  } catch (error) {
    console.error('Error fetching quiz questions:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch quiz questions',
      error: error.message 
    });
  }
});
Studentrouter.get("/single-courses/:id",async(req,res)=>{
  try {
    const course=await Course.findById({_id:req.params.id});
    if(!course){
       return res.send({success:false,message:"COurse did not find."})
    }
    res.send({success:true,data:course})
  } catch (error) {
    console.log(error)
  }
})
// Submit quiz answers and calculate score
Studentrouter.post('/courses/:courseId/content/:contentId/submit-quiz', studentAuth, async (req, res) => {
  try {
    const { courseId, contentId } = req.params;
    const { answers } = req.body;
    const studentId = req.student._id;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Answers must be provided as an array' 
      });
    }

    // Check if student is enrolled in the course
    const student = await Student.findOne({
      _id: studentId,
      'enrolledCourses.course': courseId
    });

    if (!student) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not enrolled in this course or it does not exist' 
      });
    }

    // Get the course and content item
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    const contentItem = course.content.id(contentId);
    if (!contentItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Content item not found' 
      });
    }

    // Check if content item is a quiz
    if (contentItem.type !== 'quiz') {
      return res.status(400).json({ 
        success: false, 
        message: 'This content item is not a quiz' 
      });
    }

    // Calculate score
    let correctAnswers = 0;
    const results = contentItem.questions.map((question, index) => {
      const userAnswer = answers[index];
      let isCorrect = false;

      switch (question.type) {
        case 'mcq-single':
          isCorrect = userAnswer === question.correctAnswer;
          break;
        case 'mcq-multiple':
          // For multiple correct answers, we need to check if arrays match
          isCorrect = Array.isArray(userAnswer) && 
                      userAnswer.length === question.correctAnswer.length &&
                      userAnswer.every(val => question.correctAnswer.includes(val));
          break;
        case 'short-answer':
        case 'broad-answer':
          // For text answers, we might want to implement more complex checking
          // For now, we'll just do a simple case-insensitive comparison
          isCorrect = userAnswer && 
                     typeof userAnswer === 'string' &&
                     userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
          break;
      }

      if (isCorrect) correctAnswers++;

      return {
        question: question.question,
        type: question.type,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect
      };
    });

    const score = (correctAnswers / contentItem.questions.length) * 100;

    // Update course progress
    const enrollment = student.enrolledCourses.find(
      e => e.course.toString() === courseId
    );

    // Only update progress if this quiz gives a higher score than current progress
    if (score > enrollment.progress) {
      enrollment.progress = score;
      enrollment.lastAccessed = new Date();
      
      // Mark as completed if progress is 100%
      if (score >= 100) {
        enrollment.completed = true;
      }

      await student.save();
    }

    res.status(200).json({ 
      success: true,
      score,
      totalQuestions: contentItem.questions.length,
      correctAnswers,
      results,
      progress: enrollment.progress,
      completed: enrollment.completed
    });

  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to submit quiz',
      error: error.message 
    });
  }
});

// Get course content including quizzes
Studentrouter.get('/courses/:courseId/content', studentAuth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.student._id;

    // Check if student is enrolled in the course
    const student = await Student.findOne({
      _id: studentId,
      'enrolledCourses.course': courseId
    });

    if (!student) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not enrolled in this course or it does not exist' 
      });
    }

    // Get the course and its content
    const course = await Course.findById(courseId)
      .select('title description content');

    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    // Format content items (hide correct answers for quizzes)
    const content = course.content.map(item => {
      const contentItem = item.toObject();
      
      if (contentItem.type === 'quiz') {
        contentItem.questions = contentItem.questions.map(question => {
          const { correctAnswer, ...questionWithoutAnswer } = question;
          return questionWithoutAnswer;
        });
      } else {
        // For non-quiz content, remove questions if they exist
        delete contentItem.questions;
      }

      return contentItem;
    });

    res.status(200).json({ 
      success: true,
      course: {
        title: course.title,
        description: course.description,
        content
      }
    });

  } catch (error) {
    console.error('Error fetching course content:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch course content',
      error: error.message 
    });
  }
});

// Update course progress (for non-quiz content)
Studentrouter.put('/courses/:courseId/progress', studentAuth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { progress } = req.body;
    const studentId = req.student._id;

    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return res.status(400).json({ 
        success: false, 
        message: 'Progress must be a number between 0 and 100' 
      });
    }

    // Find student and enrollment
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    const enrollment = student.enrolledCourses.find(
      e => e.course.toString() === courseId
    );

    if (!enrollment) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not enrolled in this course' 
      });
    }

    // Only update if new progress is higher than current
    if (progress > enrollment.progress) {
      enrollment.progress = progress;
      enrollment.lastAccessed = new Date();
      
      if (progress >= 100) {
        enrollment.completed = true;
      }

      await student.save();
    }

    res.status(200).json({ 
      success: true,
      progress: enrollment.progress,
      completed: enrollment.completed
    });

  } catch (error) {
    console.error('Error updating course progress:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update course progress',
      error: error.message 
    });
  }
});

// -----------------single-course----------------------------------
Studentrouter.get("/course-overview/:id",async(req,res)=>{
  try {
    console.log(req.params.id)
    const course=await Course.findById(req.params.id);
    if(!course){
          return res.send({success:false,message:"Course not found!"})
    }
    res.send({success:true,course:course})
  } catch (error) {
    console.log(error)
  }
})


const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const moment = require('moment');

// Submit quiz and track progress
Studentrouter.post('/submit-quiz', async (req, res) => {
  const { courseId, contentItemId, answers, studentId } = req.body;

  try {
    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.json({ success: false, message: 'Invalid course ID' });
    }
    if (!mongoose.Types.ObjectId.isValid(contentItemId)) {
      return res.json({ success: false, message: 'Invalid content item ID' });
    }
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.json({ success: false, message: 'Invalid student ID' });
    }

    // Find the course and the specific quiz content
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const quizContent = course.content.id(contentItemId);
    if (!quizContent || quizContent.type !== 'quiz') {
      return res.status(400).json({ success: false, message: 'Content item is not a quiz' });
    }

    // Calculate quiz score
    let score = 0;
    const detailedAnswers = [];

    quizContent.questions.forEach(question => {
      const userAnswer = answers[question._id];
      let isCorrect = false;

      if (question.type === 'mcq-single') {
        isCorrect = userAnswer === question.correctAnswer;
      } else if (question.type === 'mcq-multiple') {
        const userAnswers = Array.isArray(userAnswer) ? userAnswer : [];
        const correctAnswers = question.correctAnswer;
        isCorrect = userAnswers.length === correctAnswers.length && 
                   userAnswers.every(val => correctAnswers.includes(val));
      } else if (question.type === 'short-answer' || question.type === 'broad-answer') {
        // For text answers, we consider it correct if it contains the correct answer text
        isCorrect = userAnswer && 
                   typeof userAnswer === 'string' && 
                   userAnswer.toLowerCase().includes(question.answer.toLowerCase());
      }

      if (isCorrect) score++;
      
      detailedAnswers.push({
        questionId: question._id,
        answer: userAnswer,
        isCorrect
      });
    });

    const percentageScore = Math.round((score / quizContent.questions.length) * 100);
    const passed = percentageScore >= 70; // Assuming passing score is 70%

    // Update student's progress
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Record quiz attempt
    await student.recordQuizAttempt(
      courseId, 
      contentItemId, 
      detailedAnswers, 
      percentageScore, 
      passed
    );

    // Check if course is completed and generate certificate if needed
    let certificateUrl = null;
    const enrollment = student.enrolledCourses.find(
      e => e.course.toString() === courseId.toString()
    );

    if (enrollment.completed) {
      certificateUrl = await generateCertificate(student, course);
      
      // Add certificate to student's record if generated
      if (certificateUrl) {
        enrollment.certificates.push({
          url: certificateUrl,
          issuedAt: new Date(),
          expiresAt: moment().add(2, 'years').toDate() // Certificate expires in 2 years
        });
        await student.save();
      }
    }

    res.status(200).json({ 
      success: true, 
      score: percentageScore,
      passed,
      totalQuestions: quizContent.questions.length,
      correctAnswers: score,
      certificateUrl: certificateUrl || null
    });

  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit quiz',
      error: error.message 
    });
  }
});

// Generate certificate PDF
async function generateCertificate(student, course) {
  try {
    // Create certificates directory if it doesn't exist
    const certDir = path.join(__dirname, '../public/certificates');
    if (!fs.existsSync(certDir)) {
      fs.mkdirSync(certDir, { recursive: true });
    }

    const certId = uuidv4();
    const fileName = `certificate_${course._id}_${student._id}_${certId}.pdf`;
    const filePath = path.join(certDir, fileName);
    const publicUrl = `/certificates/${fileName}`;

    // Create PDF document
    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4',
      margin: 0
    });

    // Pipe the PDF to a file
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Add background
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f8f9fa');

    // Add decorative elements
    doc.fill('#343a40')
       .fontSize(60)
       .text('Certificate of Completion', {
         align: 'center',
         valign: 'center',
         lineGap: 10,
         width: doc.page.width,
         height: doc.page.height * 0.15
       });

    // Add main content
    doc.fill('#212529')
       .fontSize(24)
       .text('This is to certify that', {
         align: 'center',
         valign: 'center',
         lineGap: 10,
         width: doc.page.width,
         height: doc.page.height * 0.1
       });

    doc.fill('#0d6efd')
       .fontSize(36)
       .font('Helvetica-Bold')
       .text(student.full_name, {
         align: 'center',
         valign: 'center',
         lineGap: 10,
         width: doc.page.width,
         height: doc.page.height * 0.15
       });

    doc.fill('#212529')
       .fontSize(20)
       .text('has successfully completed the course', {
         align: 'center',
         valign: 'center',
         lineGap: 10,
         width: doc.page.width,
         height: doc.page.height * 0.1
       });

    doc.fill('#0d6efd')
       .fontSize(28)
       .font('Helvetica-Bold')
       .text(course.title, {
         align: 'center',
         valign: 'center',
         lineGap: 10,
         width: doc.page.width,
         height: doc.page.height * 0.1
       });

    // Add completion date
    const completionDate = moment().format('MMMM Do, YYYY');
    doc.fill('#495057')
       .fontSize(16)
       .text(`Completed on ${completionDate}`, {
         align: 'center',
         valign: 'center',
         lineGap: 10,
         width: doc.page.width,
         height: doc.page.height * 0.1
       });

    // Add certificate ID
    doc.fill('#6c757d')
       .fontSize(12)
       .text(`Certificate ID: ${certId}`, {
         align: 'center',
         valign: 'center',
         lineGap: 10,
         width: doc.page.width,
         height: doc.page.height * 0.05
       });

    // Finalize PDF
    doc.end();

    // Wait for the stream to finish writing
    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    return publicUrl;

  } catch (error) {
    console.error('Error generating certificate:', error);
    return null;
  }
}

// Get student's quiz attempts for a course
Studentrouter.get('/quiz-attempts/:studentId/:courseId', async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: 'Invalid IDs provided' });
    }

    const student = await Student.findById(studentId)
      .select('enrolledCourses')
      .populate({
        path: 'enrolledCourses.course',
        select: 'title'
      });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const enrollment = student.enrolledCourses.find(
      e => e.course._id.toString() === courseId.toString()
    );

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    // Get course content to map quiz titles
    const course = await Course.findById(courseId)
      .select('content');

    const quizAttemptsWithDetails = enrollment.quizAttempts.map(attempt => {
      const contentItem = course.content.id(attempt.contentItemId);
      return {
        ...attempt.toObject(),
        quizTitle: contentItem?.title || 'Unknown Quiz',
        quizDescription: contentItem?.description || ''
      };
    });

    res.status(200).json({
      success: true,
      quizAttempts: quizAttemptsWithDetails,
      courseTitle: enrollment.course.title
    });

  } catch (error) {
    console.error('Error fetching quiz attempts:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch quiz attempts',
      error: error.message 
    });
  }
});

// Get student's certificate for a course
Studentrouter.get('/certificate/:studentId/:courseId', async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: 'Invalid IDs provided' });
    }

    const student = await Student.findById(studentId)
      .select('enrolledCourses full_name');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const enrollment = student.enrolledCourses.find(
      e => e.course.toString() === courseId.toString()
    );

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    if (!enrollment.completed) {
      return res.status(400).json({ 
        success: false, 
        message: 'Course not completed yet' 
      });
    }

    if (enrollment.certificates.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Certificate not found' 
      });
    }

    // Get the most recent certificate
    const latestCertificate = enrollment.certificates.reduce((latest, cert) => {
      return (!latest || new Date(cert.issuedAt) > new Date(latest.issuedAt)) ? cert : latest;
    });

    res.status(200).json({
      success: true,
      certificateUrl: latestCertificate.url,
      issuedAt: latestCertificate.issuedAt,
      expiresAt: latestCertificate.expiresAt,
      studentName: student.full_name
    });

  } catch (error) {
    console.error('Error fetching certificate:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch certificate',
      error: error.message 
    });
  }
});
module.exports = Studentrouter;