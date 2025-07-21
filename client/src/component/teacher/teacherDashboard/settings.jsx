/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  FiEdit2,
  FiSave,
  FiX,
  FiLock,
  FiEye,
  FiEyeOff,
  FiPhone,
  FiFileText,
  FiLink,
  FiDollarSign,
} from "react-icons/fi";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const settings = () => {
  const [teacherData, setTeacherData] = useState({
    full_name: "",
    email: "",
    phone: "",
    specialization: "",
    qualifications: "",
    linkedin_url: "",
    hourly_rate: "",
    profile_photo: null,
    cv: null,
    certificates: [],
  });

  const [editMode, setEditMode] = useState({
    full_name: false,
    email: false,
    phone: false,
    specialization: false,
    qualifications: false,
    linkedin_url: false,
    hourly_rate: false,
  });

  const [tempData, setTempData] = useState({});
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // For handling temporary file removal and addition
  const [tempFiles, setTempFiles] = useState({
    cv: null,
    certificates: [],
  });

  useEffect(() => {
    const fetchTeacherProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const response = await axios.get(
          "http://localhost:3500/api/auth/teacher",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setTeacherData({
          full_name: response.data.full_name || "Teacher Name",
          email: response.data.email || "teacher@example.com",
          phone: response.data.phone || "",
          specialization: response.data.specialization || "",
          qualifications: response.data.qualifications || "",
          linkedin_url: response.data.linkedin_url || "",
          hourly_rate: response.data.hourly_rate || "",
          profile_photo: response.data.profile_photo || null,
          cv: response.data.cv || null,
          certificates: response.data.certificates || [],
        });
      } catch (error) {
        console.error("Failed to fetch profile data", error);
        toast.error("Failed to load teacher data");
      }
    };

    fetchTeacherProfile();
  }, []);

  const handleEditToggle = (field) => {
    if (editMode[field]) {
      setEditMode({ ...editMode, [field]: false });
    } else {
      setTempData({ ...teacherData });
      setEditMode({ ...editMode, [field]: true });
    }
  };
  const handleFileChangeImage = (e) => {
    const file = e.target.files[0]; // Get the first file

    if (file) {
      // Create a URL for the selected image and set it as the new profile photo
      const reader = new FileReader();
      reader.onloadend = () => {
        setTeacherData({
          ...teacherData,
          profile_photo: reader.result, // This is the image's base64 URL
        });
      };
      reader.readAsDataURL(file); // Read the file as a Data URL
    }
  };
  const handleProfileChange = (e, field) => {
    const value = e.target.value;
    if (field === "email") {
      // Convert email to lowercase if the field is email
      setTempData({ ...tempData, [field]: value.toLowerCase() });
    } else {
      setTempData({ ...tempData, [field]: value });
    }
  };
  const saveProfile = async (field) => {
    if (!tempData[field] || tempData[field] === teacherData[field]) {
      setEditMode({ ...editMode, [field]: false });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:3500/api/auth/update-teacher-profile",
        { [field]: tempData[field] },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTeacherData({ ...teacherData, [field]: tempData[field] });
      setEditMode({ ...editMode, [field]: false });
      toast.success(
        `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } updated successfully!`
      );
    } catch (err) {
      console.error("Failed to update profile:", err);
      toast.error(`Failed to update ${field}`);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:3500/api/auth/change-teacher-password",
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordChange(false);
    } catch (err) {
      console.error("Failed to change password:", err);
      toast.error("Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const { name } = e.target;
    const fileList = Array.from(e.target.files);

    if (name === "certificates") {
      setTempFiles((prev) => ({
        ...prev,
        [name]: [...prev[name], ...fileList],
      }));
    } else {
      setTempFiles((prev) => ({ ...prev, [name]: fileList[0] }));
    }
  };

  const removeCertificate = (index) => {
    const updatedCertificates = [...tempFiles.certificates];
    updatedCertificates.splice(index, 1);
    setTempFiles((prev) => ({ ...prev, certificates: updatedCertificates }));
  };

  const removeCv = () => {
    setTempFiles((prev) => ({ ...prev, cv: null }));
  };

  const togglePasswordVisibility = (field) => {
    switch (field) {
      case "current":
        setShowCurrentPassword(!showCurrentPassword);
        break;
      case "new":
        setShowNewPassword(!showNewPassword);
        break;
      case "confirm":
        setShowConfirmPassword(!showConfirmPassword);
        break;
      default:
        break;
    }
  };

  const handleUpdateFiles = async () => {
    const token = localStorage.getItem("token");
    const formData = new FormData();

    // Add CV and certificates to the form data
    if (tempFiles.cv) {
      formData.append("cv", tempFiles.cv);
    }

    tempFiles.certificates.forEach((file, index) => {
      formData.append(`certificates[${index}]`, file);
    });

    try {
      await axios.put(
        "http://localhost:3500/api/auth/update-teacher-files",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setTeacherData((prevData) => ({
        ...prevData,
        cv: tempFiles.cv,
        certificates: tempFiles.certificates,
      }));

      toast.success("Files updated successfully!");
    } catch (error) {
      toast.error("Failed to update files");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-6"
      >
        <div className="w-full mb-8 pb-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 text-left">
            Account Settings
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your profile and security settings
          </p>
        </div>

        <div className="flex items-center mb-8">
          <div className="relative mx-auto">
            <img
              src={
                teacherData.profile_photo || "https://via.placeholder.com/150"
              }
              alt="Profile"
              className="w-30 h-30 rounded-full object-cover border-2 border-gray-200"
            />
            <button
              onClick={() => document.getElementById("fileInput").click()}
              className="absolute bottom-0 right-0 p-2 bg-gray-700 text-white rounded-full"
            >
              <FiEdit2 size={16} />
            </button>
            <input
              type="file"
              id="fileInput"
              onChange={handleFileChangeImage}
              className="hidden"
              accept="image/*"
            />
          </div>

          <div className="ml-6">
            <h2 className="text-xl font-semibold text-gray-800">
              {teacherData.full_name}
            </h2>
            <p className="text-gray-600">{teacherData.email}</p>
          </div>
        </div>

        <div className="space-y-6 p-4">
          {/* Full Name */}
          <div className="border-b border-gray-200 pb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
              {editMode.full_name ? (
                <div className="flex space-x-2">
                  <button
                    onClick={() => saveProfile("full_name")}
                    className="p-1.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                  >
                    <FiSave size={16} />
                  </button>
                  <button
                    onClick={() => handleEditToggle("full_name")}
                    className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleEditToggle("full_name")}
                  className="p-1.5 rounded-full bg-gray-700 text-gray-100 hover:bg-black transition-colors"
                >
                  <FiEdit2 size={16} />
                </button>
              )}
            </div>
            {editMode.full_name ? (
              <input
                type="text"
                value={tempData.full_name || ""}
                onChange={(e) => handleProfileChange(e, "full_name")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-gray-500 "
              />
            ) : (
              <p className="text-lg font-medium text-gray-800">
                {teacherData.full_name}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="border-b border-gray-200 pb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              {editMode.email ? (
                <div className="flex space-x-2">
                  <button
                    onClick={() => saveProfile("email")}
                    className="p-1.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                  >
                    <FiSave size={16} />
                  </button>
                  <button
                    onClick={() => handleEditToggle("email")}
                    className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleEditToggle("email")}
                  className="p-1.5 rounded-full bg-gray-700 text-gray-100 hover:bg-black transition-colors"
                >
                  <FiEdit2 size={16} />
                </button>
              )}
            </div>
            {editMode.email ? (
              <input
                type="email"
                value={tempData.email || ""}
                onChange={(e) => handleProfileChange(e, "email")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-gray-500 "
              />
            ) : (
              <p className="text-lg font-medium text-gray-800">
                {teacherData.email}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="border-b border-gray-200 pb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-500">Phone</h3>
              {editMode.phone ? (
                <div className="flex space-x-2">
                  <button
                    onClick={() => saveProfile("phone")}
                    className="p-1.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                  >
                    <FiSave size={16} />
                  </button>
                  <button
                    onClick={() => handleEditToggle("phone")}
                    className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleEditToggle("phone")}
                  className="p-1.5 rounded-full bg-gray-700 text-gray-100 hover:bg-black transition-colors"
                >
                  <FiEdit2 size={16} />
                </button>
              )}
            </div>
            {editMode.phone ? (
              <input
                type="text"
                value={tempData.phone || ""}
                onChange={(e) => handleProfileChange(e, "phone")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-gray-500 "
              />
            ) : (
              <p className="text-lg font-medium text-gray-800">
                {teacherData.phone}
              </p>
            )}
          </div>

          {/* Specialization */}
          <div className="border-b border-gray-200 pb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-500">
                Specialization
              </h3>
              {editMode.specialization ? (
                <div className="flex space-x-2">
                  <button
                    onClick={() => saveProfile("specialization")}
                    className="p-1.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                  >
                    <FiSave size={16} />
                  </button>
                  <button
                    onClick={() => handleEditToggle("specialization")}
                    className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleEditToggle("specialization")}
                  className="p-1.5 rounded-full bg-gray-700 text-gray-100 hover:bg-black transition-colors"
                >
                  <FiEdit2 size={16} />
                </button>
              )}
            </div>
            {editMode.specialization ? (
              <input
                type="text"
                value={tempData.specialization || ""}
                onChange={(e) => handleProfileChange(e, "specialization")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-gray-500 "
              />
            ) : (
              <p className="text-lg font-medium text-gray-800">
                {teacherData.specialization}
              </p>
            )}
          </div>

          {/* Qualifications */}
          <div className="border-b border-gray-200 pb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-500">
                Qualifications
              </h3>
              {editMode.qualifications ? (
                <div className="flex space-x-2">
                  <button
                    onClick={() => saveProfile("qualifications")}
                    className="p-1.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                  >
                    <FiSave size={16} />
                  </button>
                  <button
                    onClick={() => handleEditToggle("qualifications")}
                    className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleEditToggle("qualifications")}
                  className="p-1.5 rounded-full bg-gray-700 text-gray-100 hover:bg-black transition-colors"
                >
                  <FiEdit2 size={16} />
                </button>
              )}
            </div>
            {editMode.qualifications ? (
              <textarea
                value={tempData.qualifications || ""}
                onChange={(e) => handleProfileChange(e, "qualifications")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg "
                rows={4}
              />
            ) : (
              <p className="text-lg font-medium text-gray-800">
                {teacherData.qualifications}
              </p>
            )}
          </div>

          {/* LinkedIn URL */}
          <div className="border-b border-gray-200 pb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-500">
                LinkedIn URL
              </h3>
              {editMode.linkedin_url ? (
                <div className="flex space-x-2">
                  <button
                    onClick={() => saveProfile("linkedin_url")}
                    className="p-1.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                  >
                    <FiSave size={16} />
                  </button>
                  <button
                    onClick={() => handleEditToggle("linkedin_url")}
                    className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleEditToggle("linkedin_url")}
                  className="p-1.5 rounded-full bg-gray-700 text-gray-100 hover:bg-black transition-colors"
                >
                  <FiEdit2 size={16} />
                </button>
              )}
            </div>
            {editMode.linkedin_url ? (
              <input
                type="url"
                value={tempData.linkedin_url || ""}
                onChange={(e) => handleProfileChange(e, "linkedin_url")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-gray-500 "
              />
            ) : (
              <p className="text-lg font-medium text-gray-800">
                {teacherData.linkedin_url}
              </p>
            )}
          </div>

          {/* Hourly Rate */}
          <div className="border-b border-gray-200 pb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-500">Hourly Rate</h3>
              {editMode.hourly_rate ? (
                <div className="flex space-x-2">
                  <button
                    onClick={() => saveProfile("hourly_rate")}
                    className="p-1.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                  >
                    <FiSave size={16} />
                  </button>
                  <button
                    onClick={() => handleEditToggle("hourly_rate")}
                    className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleEditToggle("hourly_rate")}
                  className="p-1.5 rounded-full bg-gray-700 text-gray-100 hover:bg-black transition-colors"
                >
                  <FiEdit2 size={16} />
                </button>
              )}
            </div>
            {editMode.hourly_rate ? (
              <input
                type="number"
                value={tempData.hourly_rate || ""}
                onChange={(e) => handleProfileChange(e, "hourly_rate")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-gray-500 "
              />
            ) : (
              <p className="text-lg font-medium text-gray-800">
                {teacherData.hourly_rate}
              </p>
            )}
          </div>

          {/* Password Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-500">Password</h3>
              <button
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <FiLock className="mr-1" size={14} />
                {showPasswordChange ? "Hide" : "Change Password"}
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              {showPasswordChange
                ? "Enter your current and new password"
                : "Last changed 3 months ago"}
            </p>

            <AnimatePresence>
              {showPasswordChange && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <form
                    onSubmit={handlePasswordSubmit}
                    className="space-y-4 mt-4"
                  >
                    {/* Current Password */}
                    <div>
                      <label
                        htmlFor="currentPassword"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          id="currentPassword"
                          name="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-gray-500  pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("current")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showCurrentPassword ? (
                            <FiEye size={18} />
                          ) : (
                            <FiEyeOff size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label
                        htmlFor="newPassword"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          id="newPassword"
                          name="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          required
                          minLength="6"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-gray-500 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("new")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showNewPassword ? (
                            <FiEye size={18} />
                          ) : (
                            <FiEyeOff size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-gray-500  pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("confirm")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 "
                        >
                          {showConfirmPassword ? (
                            <FiEye size={18} />
                          ) : (
                            <FiEyeOff size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowPasswordChange(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-200 hover:text-black transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {loading ? "Updating..." : "Update Password"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="space-y-8 p-6 bg-white rounded-xl shadow-sm">
            {/* CV File Upload */}
            <div className="border-b border-gray-100 pb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  CV
                </h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  PDF, max 5MB
                </span>
              </div>

              {tempFiles.cv ? (
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200 transition-all hover:border-gray-500">
                  <div className="flex items-center">
                    <svg
                      className="w-6 h-6 text-red-500 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="font-medium text-gray-800 truncate max-w-xs">
                      {tempFiles.cv.name}
                    </span>
                  </div>
                  <button
                    onClick={removeCv}
                    className="text-red-600 hover:text-red-800 transition-colors flex items-center"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <label
                    htmlFor="cv-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-10 h-10 mb-3 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PDF (Max. 5MB)</p>
                    </div>
                    <input
                      id="cv-upload"
                      type="file"
                      name="cv"
                      onChange={handleFileChange}
                      accept=".pdf"
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Certificates File Upload */}
            <div className="border-b border-gray-100 pb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Certificates
                </h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  PDF/Image, max 5MB
                </span>
              </div>

              {tempFiles.certificates.length > 0 && (
                <div className="space-y-3 mb-4">
                  {tempFiles.certificates.map((file, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200 transition-all hover:border-gray-500"
                    >
                      <div className="flex items-center">
                        {file.type.includes("pdf") ? (
                          <svg
                            className="w-6 h-6 text-red-500 mr-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-6 h-6 text-gray-500 mr-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        )}
                        <span className="font-medium text-gray-800 truncate max-w-xs">
                          {file.name}
                        </span>
                      </div>
                      <button
                        onClick={() => removeCertificate(index)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {tempFiles.certificates.length < 5 && (
                <div className="relative">
                  <label
                    htmlFor="certificates-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-10 h-10 mb-3 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF or Images (Max. 5 files, 5MB each)
                      </p>
                    </div>
                    <input
                      id="certificates-upload"
                      type="file"
                      name="certificates"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      multiple
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Update Files Button */}
            {(tempFiles.cv || tempFiles.certificates.length > 0) && (
              <div className="flex justify-end">
                <button
                  onClick={handleUpdateFiles}
                  className="px-6 py-3 bg-gradient-to-r from-gray-800 to-black text-white font-medium rounded-lg shadow-md  transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2"
                >
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                    Update Documents
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default settings;
