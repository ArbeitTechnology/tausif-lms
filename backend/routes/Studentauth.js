const express = require("express");
const Student = require("../models/Student");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const Studnetauth = express.Router();

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_here";
const OTP_EXPIRY_MINUTES = 10;
const RESET_TOKEN_EXPIRY_MINUTES = 30;

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "tausifrahman02@gmail.com",
    pass: process.env.EMAIL_PASS || "uxcc zkkr etre uipd",
  },
});

// Helper functions
const generateOTP = () => crypto.randomInt(100000, 999999).toString();
const generateToken = (payload, expiresIn) => jwt.sign(payload, JWT_SECRET, { expiresIn });

// Student Registration with OTP
Studnetauth.post("/register", async (req, res) => {
  try {
    const { email, password, full_name, phone, date_of_birth, address } = req.body;

    // Validate required fields
    if (!email || !password || !full_name || !phone) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if student exists
    const existingStudent = await Student.findOne({ $or: [{ email }, { phone }] });
    if (existingStudent) {
      const field = existingStudent.email === email ? "email" : "phone";
      return res.status(400).json({ message: `${field} already in use` });
    }

    // Create and save student
    const student = new Student({
      email,
      password,
      full_name,
      phone,
      date_of_birth,
      address,
    });

    // Generate and save OTP
    const otp = student.generateOTP();
    await student.save();

    // Send OTP email
    await transporter.sendMail({
      from: `"Education App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Account",
      html: `Your verification OTP is: <strong>${otp}</strong>. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
    });

    res.status(201).json({
      message: "Registration successful. Please verify your account with the OTP sent to your email.",
      email: student.email,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
});

// Verify OTP
Studnetauth.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log(req.body)
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (student.isVerified) {
      return res.status(400).json({ message: "Account already verified" });
    }
    console.log(student)
   // Debug logging (remove in production)
    console.log(`Stored OTP: ${student.otp}, Received OTP: ${otp}`);
    console.log(`OTP Expires: ${student.otpExpires}, Current Time: ${new Date()}`);

    // Check if OTP exists and not expired
    if (!student.otp || !student.otpExpires) {
      return res.status(400).json({ message: "OTP not found or expired" });
    }

    // Check expiration first
    if (student.otpExpires < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Compare OTPs (ensure both are strings)
    if (student.otp.toString() !== otp.toString()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Mark as verified
    student.isVerified = true;
    student.otp = undefined;
    student.otpExpires = undefined;
    await student.save();

    // Generate auth token
    const token = generateToken(
      { id: student._id, role: student.role },
      "1h"
    );

    res.status(200).json({
      message: "Account verified successfully",
      token,
      student: {
        id: student._id,
        email: student.email,
        full_name: student.full_name,
        role: student.role,
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "OTP verification failed", error: error.message });
  }
});

// Resend OTP
Studnetauth.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (student.isVerified) {
      return res.status(400).json({ message: "Account already verified" });
    }

    // Generate new OTP
    const otp = student.generateOTP();
    await student.save();

    // Send OTP email
    await transporter.sendMail({
      from: `"Education App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "New Verification OTP",
      html: `Your new verification OTP is: <strong>${otp}</strong>. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
    });

    res.status(200).json({ message: "New OTP sent successfully" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ message: "Failed to resend OTP", error: error.message });
  }
});

// Student Login
Studnetauth.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find student with password
    const student = await Student.findOne({ email });
    console.log(student)
    if (!student) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if account is locked
    if (student.isLocked) {
      const remainingTime = Math.ceil((student.lockUntil - Date.now()) / (60 * 1000));
      return res.status(403).json({
        message: `Account locked. Try again in ${remainingTime} minutes.`,
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password,student.password);
    if (!isMatch) {
      // Increment failed attempts
      await student.incrementLoginAttempts();
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if email is verified
    if (!student.isVerified) {
      return res.status(403).json({
        message: "Account not verified. Please verify your email first.",
      });
    }

    // Reset login attempts on successful login
    if (student.loginAttempts > 0 || student.lockUntil) {
      student.loginAttempts = 0;
      student.lockUntil = undefined;
      await student.save();
    }

    // Generate token
    const token = generateToken(
      { id: student._id, role: student.role },
      "1h"
    );

    res.status(200).json({
      message: "Login successful",
      token,
      student: {
        id: student._id,
        email: student.email,
        full_name: student.full_name,
        role: student.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

// Forgot Password
Studnetauth.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const student = await Student.findOne({ email });
    if (!student) {
      // Don't reveal whether email exists for security
      return res.status(200).json({ message: "If an account exists, a reset OTP has been sent" });
    }

    // Generate OTP
    const otp = student.generateOTP();
    await student.save();

    // Send OTP email
    await transporter.sendMail({
      from: `"Education App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset OTP",
      html: `Your password reset OTP is: <strong>${otp}</strong>. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
    });

    res.status(200).json({
      message: "If an account exists, a reset OTP has been sent",
      email: student.email,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Password reset failed", error: error.message });
  }
});

// Reset Password with OTP
Studnetauth.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Find student
    const student = await Student.findOne({ email }).select("+otp +otpExpires");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Verify OTP
    if (!student.verifyOTP(otp)) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Update password
    student.password = newPassword;
    student.otp = undefined;
    student.otpExpires = undefined;
    await student.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Password reset failed", error: error.message });
  }
});

// Middleware to protect routes
const authenticateStudent = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const student = await Student.findById(decoded.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    req.student = student;
    req.token = token;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    res.status(500).json({ message: "Authentication failed", error: error.message });
  }
};

// Protected routes
Studnetauth.get("/profile", authenticateStudent, async (req, res) => {
  try {
    res.status(200).json({
      student: {
        id: req.student._id,
        email: req.student.email,
        full_name: req.student.full_name,
        phone: req.student.phone,
        date_of_birth: req.student.date_of_birth,
        address: req.student.address,
        role: req.student.role,
      },
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Failed to fetch profile", error: error.message });
  }
});

// Change Password
Studnetauth.post("/change-password", authenticateStudent, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isMatch = await req.student.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Update password
    req.student.password = newPassword;
    await req.student.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Failed to change password", error: error.message });
  }
});

module.exports = Studnetauth;