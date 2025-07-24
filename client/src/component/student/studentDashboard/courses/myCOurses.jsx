/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiAward,
  FiX,
  FiPlay,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import ProgressBar from "@ramonak/react-progress-bar";
import axios from "axios";

const MyCourses = ({ setActiveView }) => {
  const navigate = useNavigate();
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const studnetdata=JSON.parse(localStorage.getItem("studentData"));
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // Fetch user's enrolled courses from API
const fetchUserCourses = async () => {
  try {
    setLoading(true);
    const response = await axios.get(
      `${base_url}/api/student/enrolled-courses/${studnetdata.id}`,
      getAuthHeaders()
    );
    
    console.log("API Response:", response.data); // Verify the structure

    const formattedCourses = response.data.enrolledCourses.map(item => {
      const course = item.courseDetails || {};
      const enrollment = item.enrollmentInfo || {};
      
      // Handle thumbnail path - adjust based on your server configuration
      let thumbnailPath = "/default-thumbnail.jpg";
      if (course.thumbnail?.path) {
        // Convert Windows path to URL format if needed
        thumbnailPath = course.thumbnail.path.replace(/\\/g, '/');
        // Remove 'public/' if your server serves static files from public
        thumbnailPath = thumbnailPath.replace('public/', '');
      }

      return {
        id: course._id || 'unknown-id',
        title: course.title || 'Untitled Course',
        description: course.description || 'No description available',
        thumbnail: thumbnailPath,
        instructor: course.instructor || 'Unknown Instructor',
        duration: course.duration 
          ? `${Math.floor(course.duration/60)}h ${course.duration%60}m` 
          : "N/A",
        price: course.price || 0,
        progress: enrollment.progress || 0,
        lastAccessed: enrollment.lastAccessed || null,
        completed: enrollment.completed || false,
        enrolledAt: enrollment.enrolledAt 
          ? new Date(enrollment.enrolledAt).toLocaleDateString() 
          : 'Unknown date',
        categories: course.categories || []
      };
    });
    
    setMyCourses(formattedCourses);
  } catch (error) {
    toast.error("Failed to load courses");
    console.error("Error fetching courses:", error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchUserCourses();
  }, []);

  const filteredCourses = activeTab === "all" 
    ? myCourses 
    : myCourses.filter(course => 
        activeTab === "free" ? course.price === 0 : course.price > 0
      );

  const removeCourse = async (courseId) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/students/enrolled-courses/${userId}/${courseId}`,
        getAuthHeaders()
      );
      setMyCourses(myCourses.filter(course => course.id !== courseId));
      toast.success("Course removed successfully");
    } catch (error) {
      toast.error("Failed to remove course");
      console.error("Error removing course:", error);
    }
  };

  const getInstructorName = (instructor) => {
    if (typeof instructor === 'object' && instructor !== null) {
      return instructor.full_name || 'Unknown Instructor';
    }
    return 'Unknown Instructor';
  };

  return (
    <div className="min-h-screen text-gray-900 bg-gray-50">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-white py-6 px-4 sm:px-6 lg:px-8 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Learning</h1>
            <p className="text-sm text-gray-500 mt-1">
              Track your learning progress and achievements
            </p>
          </div>
          <button
            onClick={() => setActiveView("courseList")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md flex items-center"
          >
            <FiBookOpen className="mr-2" />
            Browse Courses
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-3">
                <FiBookOpen size={20} />
              </div>
              <div>
                <div className="text-gray-500 text-sm">Total Courses</div>
                <div className="text-2xl font-bold text-gray-800">
                  {myCourses.length}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-3">
                <FiCheckCircle size={20} />
              </div>
              <div>
                <div className="text-gray-500 text-sm">Completed</div>
                <div className="text-2xl font-bold text-gray-800">
                  {myCourses.filter(c => c.progress === 100).length}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-3">
                <FiClock size={20} />
              </div>
              <div>
                <div className="text-gray-500 text-sm">In Progress</div>
                <div className="text-2xl font-bold text-gray-800">
                  {myCourses.filter(c => c.progress > 0 && c.progress < 100).length}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-3">
                <FiAward size={20} />
              </div>
              <div>
                <div className="text-gray-500 text-sm">Certificates</div>
                <div className="text-2xl font-bold text-gray-800">
                  {myCourses.filter(c => c.progress === 100).length}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "all"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("all")}
          >
            All Courses
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "free"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("free")}
          >
            Free Courses
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "premium"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("premium")}
          >
            Paid Courses
          </button>
        </div>

        {/* Courses List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200 w-full"></div>
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <motion.div
                key={course.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -5 }}
              >
        
                <div className="relative">
                  <img
                    src={`${base_url}/${course.thumbnail}`}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 text-xs rounded-full">
                    {course.price === 0 ? "FREE" : `$${course.price}`}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                      {course.title}
                    </h3>
                    <button
                      onClick={() => removeCourse(course.id)}
                      className="text-gray-400 hover:text-red-500 p-1 -mt-1 -mr-1"
                    >
                      <FiX size={18} />
                    </button>
                  </div>
  <p 
                      className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: course.description }} 
                    />
                  

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                      {course.duration}
                    </span>
                    {course.categories.slice(0, 2).map((category, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                        {category}
                      </span>
                    ))}
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span className="font-medium">
                        {course.progress === 0 ? "Not Started" : `${course.progress}%`}
                      </span>
                    </div>
                    <ProgressBar
                      completed={course.progress}
                      bgColor={course.progress === 100 ? "#10B981" : "#3B82F6"}
                      height="6px"
                      isLabelVisible={false}
                      borderRadius="3px"
                      className="shadow-inner"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Enrolled: {course.enrolledAt}
                    </div>
                    <button
                      onClick={() => navigate(`/learn/${course.id}`)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${
                        course.progress === 100
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                      } transition-colors flex items-center`}
                    >
                      {course.progress === 100 ? (
                        <>
                          <FiAward className="mr-1" />
                          Certificate
                        </>
                      ) : (
                        <>
                          <FiPlay className="mr-1" />
                          {course.progress === 0 ? "Start" : "Continue"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <FiBookOpen className="text-gray-400 text-4xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {activeTab === "all"
                ? "You haven't enrolled in any courses yet"
                : activeTab === "free"
                ? "No free courses enrolled"
                : "No premium courses enrolled"}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              {activeTab === "all"
                ? "Browse our courses and start learning today!"
                : activeTab === "free"
                ? "Explore our free courses to start learning without any cost."
                : "Check out our premium courses for advanced learning experiences."}
            </p>
            <button
              onClick={() => setActiveView("courseList")}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-all"
            >
              Browse Courses
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default MyCourses;