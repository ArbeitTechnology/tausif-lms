import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiUser, FiPhone, FiCalendar, FiMapPin, FiEye, FiEyeOff, FiUpload, FiX } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const StudentAuth = () => {
  const navigate = useNavigate();
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  // Tab system states
  const [activeTab, setActiveTab] = useState("register"); // register | verify | login
  const [registeredEmail, setRegisteredEmail] = useState("");
  
  // Registration form state
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    date_of_birth: "",
    address: ""
  });

  // Profile picture state
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // OTP verification state
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    remember: false
  });

  // UI states
  const [errors, setErrors] = useState({});
  const [loginErrors, setLoginErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  // Handle profile picture upload
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 2 * 1024 * 1024; // 2MB
      
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid image (JPEG, PNG, GIF)');
        return;
      }
      
      if (file.size > maxSize) {
        toast.error('Image size should be less than 2MB');
        return;
      }
      
      setProfilePic(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const removeProfilePic = () => {
    setProfilePic(null);
    setProfilePicPreview("");
  };

  // ========== REGISTRATION FUNCTIONS ==========
  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "email":
        if (!value) error = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Invalid email format";
        break;
      case "password":
        if (!value) error = "Password is required";
        else if (value.length < 8) error = "Must be at least 8 characters";
        else if (!/\d/.test(value)) error = "Must contain a number";
        else if (!/[!@#$%^&*]/.test(value))
          error = "Must contain a special character";
        break;
      case "full_name":
        if (!value) error = "Full name is required";
        else if (value.trim().split(/\s+/).length < 2)
          error = "Must include first and last name";
        break;
      case "phone":
        if (!value) error = "Phone is required";
        break;
      case "date_of_birth":
        if (value && !/^\d{2}\/\d{2}\/\d{4}$/.test(value))
          error = "Use DD/MM/YYYY format";
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) validateField(name, value);
  };

  const validateForm = () => {
    let isValid = true;
    Object.keys(form).forEach(key => {
      if (key !== "date_of_birth" && key !== "address") {
        isValid = validateField(key, form[key]) && isValid;
      }
    });
    return isValid;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setIsUploading(true);
    
    try {
      // First upload the profile picture if it exists
      let profilePicUrl = "";
      if (profilePic) {
        const formData = new FormData();
        formData.append('file', profilePic);
        
        const uploadResponse = await axios.post(`${base_url}/api/auth/student/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        profilePicUrl = uploadResponse.data.url;
      }

      // Then register the student with all data including profile pic URL
      const response = await axios.post(`${base_url}/api/auth/student/register`, {
        ...form,
        profile_pic: profilePicUrl
      });
      
      setRegisteredEmail(form.email);
      setActiveTab("verify");
      setOtpCountdown(60); // 1 minute countdown
      toast.success("OTP sent to your email!");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Registration failed";
      toast.error(errorMessage);
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  // ========== OTP VERIFICATION FUNCTIONS ==========
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      const response = await axios.post(`${base_url}/api/auth/student/verify-otp`, {
        email: registeredEmail,
        otp
      });

      toast.success("Account verified successfully!");
      setActiveTab("login");
      setLoginForm(prev => ({ ...prev, email: registeredEmail }));
    } catch (err) {
      const errorMessage = err.response?.data?.message || "OTP verification failed";
      toast.error(errorMessage);
      setOtpError(errorMessage);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      await axios.post(`${base_url}/api/auth/student/resend-otp`, {
        email: registeredEmail
      });
      setOtpCountdown(60); // Reset countdown
      toast.success("New OTP sent to your email!");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to resend OTP";
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  // ========== LOGIN FUNCTIONS ==========
  const validateLoginField = (name, value) => {
    let error = "";
    switch (name) {
      case "email":
        if (!value) error = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Invalid email format";
        break;
      case "password":
        if (!value) error = "Password is required";
        break;
      default:
        break;
    }
    setLoginErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleLoginChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setLoginForm(prev => ({ ...prev, [name]: val }));
    if (loginErrors[name]) validateLoginField(name, val);
  };

  const validateLoginForm = () => {
    let isValid = true;
    isValid = validateLoginField("email", loginForm.email) && isValid;
    isValid = validateLoginField("password", loginForm.password) && isValid;
    return isValid;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLoginForm()) return;

    setIsLoginSubmitting(true);
    try {
      const response = await axios.post(`${base_url}/api/auth/student/login`, {
        email: loginForm.email,
        password: loginForm.password
      });

      const { token, student } = response.data;
      
      if (loginForm.remember) {
        localStorage.setItem("studentToken", token);
        localStorage.setItem("studentData", JSON.stringify(student));
      } else {
        localStorage.setItem("studentToken", token);
        localStorage.setItem("studentData", JSON.stringify(student));
      }

      toast.success("Login successful");
      navigate("/student/dashboard");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Login failed";
      toast.error(errorMessage);
      if (err.response?.data?.errors) {
        setLoginErrors(err.response.data.errors);
      }
    } finally {
      setIsLoginSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/student/forgot-password");
  };

  // ========== RENDER FUNCTIONS ==========
  const renderRegisterTab = () => (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-lg p-8 border border-gray-200"
    >
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Student Registration</h2>
        <p className="text-gray-600">Please fill in all mandatory fields to complete your registration</p>
      </div>

      <form onSubmit={handleRegister}>
        {/* Profile Picture Upload */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-gray-300">
              {profilePicPreview ? (
                <>
                  <img 
                    src={profilePicPreview} 
                    alt="Profile preview" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeProfilePic}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                  >
                    <FiX size={14} />
                  </button>
                </>
              ) : (
                <FiUser className="text-gray-400 text-3xl" />
              )}
            </div>
            <label
              htmlFor="profilePic"
              className="absolute -bottom-2 -right-2 bg-white border border-gray-300 rounded-full p-2 cursor-pointer hover:bg-gray-100"
            >
              <FiUpload className="text-gray-600" />
              <input
                id="profilePic"
                name="profilePic"
                type="file"
                accept="image/*"
                onChange={handleProfilePicChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <FiMail className="mr-2 text-gray-500" /> Email *
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                onBlur={() => validateField("email", form.email)}
                placeholder="student@example.com"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } focus:ring-2 focus:ring-black focus:border-gray-500`}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <FiLock className="mr-2 text-gray-500" /> Password *
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  onBlur={() => validateField("password", form.password)}
                  placeholder="At least 8 characters with 1 number & special char"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-black focus:border-gray-500 pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <FiEye /> : <FiEyeOff />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <FiUser className="mr-2 text-gray-500" /> Full Name *
              </label>
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                onBlur={() => validateField("full_name", form.full_name)}
                placeholder="First and Last name"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.full_name ? "border-red-500" : "border-gray-300"
                } focus:ring-2 focus:ring-black focus:border-gray-500`}
              />
              {errors.full_name && <p className="text-sm text-red-500">{errors.full_name}</p>}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <FiPhone className="mr-2 text-gray-500" /> Phone *
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                onBlur={() => validateField("phone", form.phone)}
                placeholder="+8801912345678"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                } focus:ring-2 focus:ring-black focus:border-gray-500`}
              />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <FiCalendar className="mr-2 text-gray-500" /> Date of Birth
              </label>
              <input
                name="date_of_birth"
                value={form.date_of_birth}
                onChange={handleChange}
                onBlur={() => validateField("date_of_birth", form.date_of_birth)}
                placeholder="DD/MM/YYYY"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.date_of_birth ? "border-red-500" : "border-gray-300"
                } focus:ring-2 focus:ring-black focus:border-gray-500`}
              />
              {errors.date_of_birth && <p className="text-sm text-red-500">{errors.date_of_birth}</p>}
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <FiMapPin className="mr-2 text-gray-500" /> Address
              </label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Your current address"
                rows="2"
                className="w-full px-4 py-3 rounded-lg border border-gray-300"
              />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-sm text-gray-500 mb-4">* Mandatory fields</p>
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
              isSubmitting || isUploading ? "bg-gray-600" : "bg-black hover:bg-gray-800"
            } transition-all shadow-md flex items-center justify-center`}
          >
            {isSubmitting || isUploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isUploading ? "Uploading..." : "Registering..."}
              </>
            ) : (
              "Register"
            )}
          </button>
          <div className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => setActiveTab("login")}
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              Sign In
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );

  const renderVerifyTab = () => (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 max-w-md mx-auto"
    >
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Verify Your Account</h2>
        <p className="text-gray-600">
          We've sent a 6-digit OTP to <span className="font-medium">{registeredEmail}</span>
        </p>
      </div>

      <form onSubmit={handleVerifyOtp}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">OTP Code</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                setOtpError("");
              }}
              placeholder="Enter 6-digit code"
              maxLength="6"
              className={`w-full px-4 py-3 rounded-lg border ${
                otpError ? "border-red-500" : "border-gray-300"
              } focus:ring-2 focus:ring-black focus:border-gray-500`}
            />
            {otpError && <p className="text-sm text-red-500">{otpError}</p>}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={otpCountdown > 0 || isResending}
              className="text-sm text-gray-600 hover:text-blue-500 disabled:text-gray-400"
            >
              {isResending ? "Sending..." : otpCountdown > 0 ? `Resend in ${otpCountdown}s` : "Resend OTP"}
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-lg font-medium text-white bg-black hover:bg-gray-800 transition-all shadow-md"
          >
            Verify Account
          </button>
        </div>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        <button
          type="button"
          onClick={() => setActiveTab("register")}
          className="text-gray-600 hover:text-gray-800 font-medium"
        >
          Back to Registration
        </button>
      </div>
    </motion.div>
  );

  const renderLoginTab = () => (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 max-w-md mx-auto"
    >
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Student Sign In</h2>
        <p className="text-gray-600">Enter your credentials to access your dashboard</p>
      </div>

      <form onSubmit={handleLogin}>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <FiMail className="mr-2 text-gray-500" /> Email *
            </label>
            <input
              name="email"
              type="email"
              value={loginForm.email}
              onChange={handleLoginChange}
              onBlur={() => validateLoginField("email", loginForm.email)}
              placeholder="student@example.com"
              className={`w-full px-4 py-3 rounded-lg border ${
                loginErrors.email ? "border-red-500" : "border-gray-300"
              } focus:ring-2 focus:ring-black focus:border-gray-500`}
            />
            {loginErrors.email && <p className="text-sm text-red-500">{loginErrors.email}</p>}
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <FiLock className="mr-2 text-gray-500" /> Password *
            </label>
            <div className="relative">
              <input
                name="password"
                type={showLoginPassword ? "text" : "password"}
                value={loginForm.password}
                onChange={handleLoginChange}
                onBlur={() => validateLoginField("password", loginForm.password)}
                placeholder="Enter your password"
                className={`w-full px-4 py-3 rounded-lg border ${
                  loginErrors.password ? "border-red-500" : "border-gray-300"
                } focus:ring-2 focus:ring-black focus:border-gray-500 pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700"
              >
                {showLoginPassword ? <FiEye /> : <FiEyeOff />}
              </button>
            </div>
            {loginErrors.password && <p className="text-sm text-red-500">{loginErrors.password}</p>}
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                checked={loginForm.remember}
                onChange={handleLoginChange}
                className="rounded border-gray-300 text-black focus:ring-black"
              />
              <span className="text-sm text-gray-600">Remember me</span>
            </label>

            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-gray-600 hover:text-blue-500 transition-colors duration-200"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoginSubmitting}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
              isLoginSubmitting ? "bg-gray-600" : "bg-black hover:bg-gray-800"
            } transition-all shadow-md flex items-center justify-center`}
          >
            {isLoginSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>

          <div className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => setActiveTab("register")}
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              Register here
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-5xl mx-auto">
        {activeTab === "register" && renderRegisterTab()}
        {activeTab === "verify" && renderVerifyTab()}
        {activeTab === "login" && renderLoginTab()}
      </div>
    </motion.div>
  );
};

export default StudentAuth;