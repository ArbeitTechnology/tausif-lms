const express = require("express");
const Adminrouter = express.Router();
const {
  authenticateToken,
  authorizeAdmin,
  authorizeSubAdmin,
  checkAccountStatus,
} = require("../middleware/auth"); // Update the path accordingly
const Teacher = require("../models/Teacher");
const bcrypt = require("bcryptjs");
const Student = require("../models/Student");
const Course = require("../models/Course");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Admin = require("../models/Admin");
const Category = require("../models/Category");
// Example of a protected admin route

// Configure storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../public/courses");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

Adminrouter.get(
  "/admin-profile/:id",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      //admin profile
      const admindata = await Admin.findById({ _id: req.params.id });
      if (!admindata) {
        return res.send({ success: false, message: "Admin not found!" });
      }
      res.json({
        message: "Welcome Admin",
        admin: admindata,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// -------------------------------------teachers-routes----------------------------------------
// Get all teachers
Adminrouter.get(
  "/teachers",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const teachers = await Teacher.find({}).select("-password -__v");

      res.json({
        success: true,
        count: teachers.length,
        data: teachers,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching teachers",
      });
    }
  }
);

// Get single teacher by ID
Adminrouter.get(
  "/teachers/:id",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const teacher = await Teacher.findById(req.params.id).select(
        "-password -__v"
      );

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found",
        });
      }

      res.json({
        success: true,
        data: teacher,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching teacher",
      });
    }
  }
);

// Update teacher (all fields)
Adminrouter.put(
  "/teachers/:id",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const updates = req.body;

      // Prevent password updates through this route (should have separate password update route)
      if (updates.password) {
        return res.status(400).json({
          success: false,
          message: "Use the password reset route to change password",
        });
      }

      const updatedTeacher = await Teacher.findByIdAndUpdate(
        req.params.id,
        {
          ...updates,
          last_updated: Date.now(),
        },
        { new: true, runValidators: true }
      ).select("-password -__v");

      if (!updatedTeacher) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found",
        });
      }

      res.json({
        success: true,
        message: "Teacher updated successfully",
        data: updatedTeacher,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while updating teacher",
      });
    }
  }
);
// Change teacher password
Adminrouter.put(
  "/teachers-update-password/:id",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const { newPassword } = req.body;

      if (!newPassword) {
        return res.status(400).json({
          success: false,
          message: "New password is required",
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters",
        });
      }

      if (!/\d/.test(newPassword) || !/[!@#$%^&*]/.test(newPassword)) {
        return res.status(400).json({
          success: false,
          message: "Password must contain a number and a special character",
        });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      const updatedTeacher = await Teacher.findByIdAndUpdate(
        req.params.id,
        {
          password: hashedPassword,
          last_updated: Date.now(),
        },
        { new: true }
      ).select("-password -__v");

      if (!updatedTeacher) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found",
        });
      }

      res.json({
        success: true,
        message: "Teacher password updated successfully",
        data: updatedTeacher,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while updating password",
      });
    }
  }
);
// Change teacher status
Adminrouter.put(
  "/teachers-status/:id",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const { status, rejection_reason } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status is required",
        });
      }

      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status value",
        });
      }

      // If rejecting, require a reason
      if (status === "rejected" && !rejection_reason) {
        return res.status(400).json({
          success: false,
          message: "Rejection reason is required when rejecting a teacher",
        });
      }

      const updateData = {
        status,
        last_updated: Date.now(),
      };

      // Only update rejection_reason
      if (status === "rejected") {
        updateData.rejection_reason = rejection_reason;
      } else {
        updateData.rejection_reason = undefined;
      }

      const updatedTeacher = await Teacher.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      ).select("-password -__v");

      if (!updatedTeacher) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found",
        });
      }

      res.json({
        success: true,
        message: `Teacher status changed to ${status}`,
        data: updatedTeacher,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while updating teacher status",
      });
    }
  }
);

// Delete single teacher
Adminrouter.delete(
  "/teachers/:id",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const deletedTeacher = await Teacher.findByIdAndDelete(req.params.id);

      if (!deletedTeacher) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found",
        });
      }

      res.json({
        success: true,
        message: "Teacher deleted successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while deleting teacher",
      });
    }
  }
);

// Delete multiple teachers
Adminrouter.delete(
  "/delete-all-teachers",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const { teacherIds } = req.body;

      if (
        !teacherIds ||
        !Array.isArray(teacherIds) ||
        teacherIds.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide an array of teacher IDs to delete",
        });
      }

      const result = await Teacher.deleteMany({ _id: { $in: teacherIds } });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: "No teachers found to delete",
        });
      }

      res.json({
        success: true,
        message: `${result.deletedCount} teacher(s) deleted successfully`,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while deleting teachers",
      });
    }
  }
);

// ------------------------------------teacher-routes-------------------------------------------------

// -------------------------------------students-routes----------------------------------------
const studentstorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../public/students");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const studentupload = multer({
  storage: studentstorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});
// Get all students
Adminrouter.get(
  "/students",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const students = await Student.find({}).select("-password -__v");

      res.json({
        success: true,
        count: students.length,
        data: students,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching students",
      });
    }
  }
);

// Get single student by ID
Adminrouter.get(
  "/students/:id",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const student = await Student.findById(req.params.id).select(
        "-password -__v"
      );

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      res.json({
        success: true,
        data: student,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching student",
      });
    }
  }
);

// Create new student
Adminrouter.post(
  "/students",
  authenticateToken,
  authorizeAdmin,
  studentupload.single("profile_photo"), // Handle single file upload
  async (req, res) => {
    try {
      const { email, password, full_name, phone, date_of_birth, address } =
        req.body;
      const profilePhoto = req.file;

      const existingStudent = await Student.findOne({ email });
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: "Student with this email already exists",
        });
      }

      // Create student with optional profile photo
      const studentData = {
        email,
        password,
        full_name,
        phone,
        date_of_birth,
        address,
      };

      if (profilePhoto) {
        // Get relative path from your public folder
        studentData.profile_photo = req.file.filename;
      }

      const newStudent = await Student.create(studentData);

      // Remove password from the response
      const studentResponse = newStudent.toObject();
      delete studentResponse.password;

      res.status(201).json({
        success: true,
        message: "Student created successfully",
        data: studentResponse,
      });
    } catch (error) {
      console.error(error);
      if (error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: Object.values(error.errors).map((val) => val.message),
        });
      }
      res.status(500).json({
        success: false,
        message: "Server error while creating student",
      });
    }
  }
);
// Update student (all fields except password)
Adminrouter.put(
  "/students/:id",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const updates = req.body;

      // Prevent password updates through this route
      if (updates.password) {
        return res.status(400).json({
          success: false,
          message: "Use the password update route to change password",
        });
      }

      const updatedStudent = await Student.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      ).select("-password -__v");

      if (!updatedStudent) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      res.json({
        success: true,
        message: "Student updated successfully",
        data: updatedStudent,
      });
    } catch (error) {
      console.error(error);
      if (error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: Object.values(error.errors).map((val) => val.message),
        });
      }
      res.status(500).json({
        success: false,
        message: "Server error while updating student",
      });
    }
  }
);

// Change student password
Adminrouter.put(
  "/students-update-password/:id",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const { newPassword } = req.body;

      if (!newPassword) {
        return res.status(400).json({
          success: false,
          message: "New password is required",
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters",
        });
      }

      if (!/\d/.test(newPassword) || !/[!@#$%^&*]/.test(newPassword)) {
        return res.status(400).json({
          success: false,
          message: "Password must contain a number and a special character",
        });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      const updatedStudent = await Student.findByIdAndUpdate(
        req.params.id,
        {
          password: hashedPassword,
          password_changed_at: Date.now(),
        },
        { new: true }
      ).select("-password -__v");

      if (!updatedStudent) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      res.json({
        success: true,
        message: "Student password updated successfully",
        data: updatedStudent,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while updating password",
      });
    }
  }
);

// Change student status (active/inactive)
Adminrouter.put(
  "/students-status/:id",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const { is_active } = req.body;

      if (typeof is_active !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "is_active must be a boolean value",
        });
      }

      const updatedStudent = await Student.findByIdAndUpdate(
        req.params.id,
        {
          is_active,
          last_login: is_active ? Date.now() : undefined,
        },
        { new: true }
      ).select("-password -__v");

      if (!updatedStudent) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      res.json({
        success: true,
        message: `Student status changed to ${
          is_active ? "active" : "inactive"
        }`,
        data: updatedStudent,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while updating student status",
      });
    }
  }
);

// Delete single student
Adminrouter.delete(
  "/students/:id",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const deletedStudent = await Student.findByIdAndDelete(req.params.id);

      if (!deletedStudent) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      res.json({
        success: true,
        message: "Student deleted successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while deleting student",
      });
    }
  }
);

// Delete multiple students
Adminrouter.delete(
  "/delete-all-students",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const { studentIds } = req.body;

      if (
        !studentIds ||
        !Array.isArray(studentIds) ||
        studentIds.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide an array of student IDs to delete",
        });
      }

      const result = await Student.deleteMany({ _id: { $in: studentIds } });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: "No students found to delete",
        });
      }

      res.json({
        success: true,
        message: `${result.deletedCount} student(s) deleted successfully`,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while deleting students",
      });
    }
  }
);

// -------------------------------------courses-routes----------------------------------------

// Create a new course
Adminrouter.post(
  "/courses",
  [
    authenticateToken,
    authorizeAdmin,
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
        level = "beginner",
        user_id,
        categories,
      } = req.body;

      // Validate required fields
      if (!title || !description || !type || !content) {
        return res.status(400).json({
          success: false,
          message: "Title, description, type, and content are required",
        });
      }

      if (type === "premium" && (!price || isNaN(price))) {
        return res.status(400).json({
          success: false,
          message: "Price is required for premium courses",
        });
      }

      // Handle thumbnail upload
      if (!req.files?.thumbnail) {
        return res.status(400).json({
          success: false,
          message: "Course thumbnail is required",
        });
      }

      const thumbnailFile = req.files.thumbnail[0];
      const thumbnailData = {
        filename: thumbnailFile.originalname,
        path: thumbnailFile.filename,
        size: thumbnailFile.size,
        mimetype: thumbnailFile.mimetype,
      };

      // Handle content files
      const contentItems = JSON.parse(content).map((item) => {
        // For premium tutorials with uploaded videos
        if (item.type === "tutorial" && type === "premium") {
          const videoFile = req.files.contentVideos?.find(
            (f) => f.originalname === item.content?.name
          );
          if (videoFile) {
            item.content = {
              filename: videoFile.originalname,
              path: videoFile.path,
              size: videoFile.size,
              mimetype: videoFile.mimetype,
            };
          }
        }

        // For live classes with thumbnails
        if (item.type === "live" && req.files.contentThumbnails) {
          const thumbFile = req.files.contentThumbnails.find(
            (f) => f.originalname === item.thumbnail?.name
          );
          if (thumbFile) {
            item.thumbnail = {
              filename: thumbFile.originalname,
              path: thumbFile.path,
              size: thumbFile.size,
              mimetype: thumbFile.mimetype,
            };
          }
        }

        return item;
      });

      // Handle attachments
      const attachments =
        req.files.attachments?.map((file) => ({
          filename: file.originalname,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype,
        })) || [];
      let categoryList = [];
      if (categories) {
        try {
          // if you did formData.append("categories", JSON.stringify([...]))
          categoryList = JSON.parse(categories);
        } catch (_) {
          return res.status(400).json({
            success: false,
            message: "Invalid categories format",
          });
        }
      }
      // Create the course
      const newCourse = new Course({
        title,
        description,
        instructor: req.user_id,
        thumbnail: thumbnailData,
        type,
        price: type === "premium" ? parseFloat(price) : 0,
        content: contentItems,
        attachments,
        level,
        status: "draft",
        // Add default empty arrays for optional fields
        categories: [],
        categories: categoryList,
        requirements: [],
        whatYouWillLearn: [],
      });

      await newCourse.save();

      res.status(201).json({
        success: true,
        message: "Course created successfully",
        data: newCourse,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while creating course",
      });
    }
  }
);

// Get all courses
Adminrouter.get(
  "/courses",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const { status, type, instructor } = req.query;
      const filter = {};

      if (status) filter.status = status;
      if (type) filter.type = type;
      if (instructor) filter.instructor = instructor;

      const courses = await Course.find().sort({ createdAt: -1 });

      res.json({
        success: true,
        count: courses.length,
        data: courses,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching courses",
      });
    }
  }
);

// Get single course by ID
Adminrouter.get(
  "/courses/:id",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.id)
        .populate("instructor", "name email")
        .populate("studentsEnrolled", "name email");

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      res.json({
        success: true,
        data: course,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching course",
      });
    }
  }
);

// Update course
Adminrouter.put(
  "/courses/:id",
  [
    authenticateToken,
    authorizeAdmin,
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
      } = req.body;

      const course = await Course.findById(req.params.id);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      // Handle thumbnail update
      if (req.files.thumbnail) {
        const thumbnailFile = req.files.thumbnail[0];
        course.thumbnail = {
          filename: thumbnailFile.originalname,
          path: thumbnailFile.path,
          size: thumbnailFile.size,
          mimetype: thumbnailFile.mimetype,
        };
      }

      // Update fields
      if (title) course.title = title;
      if (description) course.description = description;
      if (type) course.type = type;
      if (price) course.price = parseFloat(price);
      if (content)
        course.content =
          typeof content === "string" ? JSON.parse(content) : content;
      if (categories)
        course.categories =
          typeof categories === "string" ? JSON.parse(categories) : categories;
      if (requirements)
        course.requirements =
          typeof requirements === "string"
            ? requirements.split(",")
            : requirements;
      if (whatYouWillLearn)
        course.whatYouWillLearn =
          typeof whatYouWillLearn === "string"
            ? whatYouWillLearn.split(",")
            : whatYouWillLearn;
      if (level) course.level = level;
      if (status) course.status = status;

      await course.save();

      res.json({
        success: true,
        message: "Course updated successfully",
        data: course,
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

// Change course status
Adminrouter.put(
  "/courses/:id/status",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const { status } = req.body;

      if (!["draft", "active", "inactive"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status value",
        });
      }

      const course = await Course.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      res.json({
        success: true,
        message: `Course status changed to ${status}`,
        data: course,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while updating course status",
      });
    }
  }
);

// Delete course
Adminrouter.delete(
  "/courses/:id",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const course = await Course.findByIdAndDelete(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      // TODO: Delete associated files from storage

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

// Get course analytics
Adminrouter.get(
  "/courses/:id/analytics",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.id)
        .populate("studentsEnrolled", "name email")
        .populate("ratings.user", "name");

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      const analytics = {
        totalStudents: course.studentsEnrolled.length,
        averageRating: course.averageRating,
        totalRatings: course.ratings.length,
        ratingDistribution: [1, 2, 3, 4, 5].map((star) => ({
          star,
          count: course.ratings.filter((r) => r.rating === star).length,
        })),
        recentStudents: course.studentsEnrolled.slice(0, 5),
        recentReviews: course.ratings
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map((r) => ({
            user: r.user,
            rating: r.rating,
            review: r.review,
            date: r.createdAt,
          })),
      };

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching course analytics",
      });
    }
  }
);

// Get all courses by status
Adminrouter.get(
  "/courses/status/:status",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const { status } = req.params;

      if (!["draft", "active", "inactive"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status value",
        });
      }

      const courses = await Course.find({ status })
        .populate("instructor", "name email")
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        count: courses.length,
        data: courses,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching courses by status",
      });
    }
  }
);

// Publish course (change status from draft to active)
Adminrouter.put(
  "/courses/:id/publish",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      if (course.status !== "draft") {
        return res.status(400).json({
          success: false,
          message: "Only draft courses can be published",
        });
      }

      course.status = "active";
      await course.save();

      res.json({
        success: true,
        message: "Course published successfully",
        data: course,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while publishing course",
      });
    }
  }
);

// Unpublish course (change status to inactive)
Adminrouter.put(
  "/courses/:id/unpublish",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      if (course.status !== "active") {
        return res.status(400).json({
          success: false,
          message: "Only active courses can be unpublished",
        });
      }

      course.status = "inactive";
      await course.save();

      res.json({
        success: true,
        message: "Course unpublished successfully",
        data: course,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while unpublishing course",
      });
    }
  }
);
// Reassign course to a new teacher (admin only)
Adminrouter.put(
  "/reassign-teacher/:courseId",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const { courseId, newInstructorId, changedBy } = req.params;

      if (!newInstructorId) {
        return res.json({
          success: false,
          message: "New instructor ID is required",
        });
      }
      const course = await Course.findById(courseId);
      if (!course) {
        return res.json({ success: false, message: "Course not found" });
      }

      if (course.instructor) {
        course.previousInstructors.push({
          instructor: course.instructor,
          changedAt: new Date(),
          changedBy: changedBy,
        });
      }

      // Update the instructor
      course.instructor = newInstructorId;
      await course.save();

      res.json({
        success: true,
        message: "Course instructor updated successfully",
      });
    } catch (error) {
      console.error("Error reassigning teacher:", error);
      res
        .status(500)
        .json({ message: "Server error while reassigning teacher" });
    }
  }
);

// Change course instructor (admin only)
Adminrouter.put(
  "/courses/:courseId/change-instructor",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      console.log(req.params);
      const { courseId } = req.params;
      const { newInstructorId, changedBy } = req.body;

      // Validate required fields
      if (!newInstructorId || !changedBy) {
        return res.status(400).json({
          success: false,
          message: "Both newInstructorId and changedBy are required",
        });
      }

      // Find the course
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      // Verify the new instructor exists (optional - remove if not needed)
      const newInstructor = await Teacher.findById(newInstructorId);
      if (!newInstructor) {
        return res.status(404).json({
          success: false,
          message: "New instructor not found",
        });
      }

      // Verify the admin making the change exists (optional)
      const adminMakingChange = await Admin.findById(changedBy);
      if (!adminMakingChange) {
        return res.status(404).json({
          success: false,
          message: "Admin making the change not found",
        });
      }

      // If there's a current instructor, add to previous instructors
      if (course.instructor) {
        course.previousInstructors.push({
          instructor: course.instructor,
          changedAt: new Date(),
          changedBy: changedBy,
        });
      }

      // Update the instructor
      course.instructor = newInstructorId;
      await course.save();

      res.json({
        success: true,
        message: "Course instructor updated successfully",
        data: {
          courseId: course._id,
          newInstructor: newInstructorId,
          previousInstructor: course.instructor,
          changedBy: changedBy,
          changedAt: new Date(),
        },
      });
    } catch (error) {
      console.error("Error changing course instructor:", error);
      res.status(500).json({
        success: false,
        message: "Server error while changing course instructor",
        error: error.message,
      });
    }
  }
);
// ------------------------------------courses-routes-------------------------------------------------

// ---------------------------all-category----------------------------
Adminrouter.get("/all-category",  authenticateToken,authorizeAdmin,async(req,res)=>{
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
module.exports = Adminrouter;
