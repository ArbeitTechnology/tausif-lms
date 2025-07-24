/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiYoutube,
  FiFile,
  FiArrowRight,
  FiCheck,
  FiLock,
  FiPlay,
  FiAward,
  FiDownload,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const CourseOverview = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [expanded, setExpanded] = useState(false);
  const [progress, setProgress] = useState({});
  const [hoveredItem, setHoveredItem] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState(null);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        // API Call: Get Course Details
        const response = await axios.get(`${base_url}/api/student/course-overview/${id}`);
        
        if (!response.data.success) {
          throw new Error(response.data.message || "Course not found");
        }

        const courseData = response.data.course;
        setCourse(courseData);

        // Initialize progress for each content item
        const initialProgress = {};
        courseData.content.forEach(item => {
          initialProgress[item._id] = {
            completed: false,
            progress: 0
          };
        });
        setProgress(initialProgress);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching course:", error);
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const toggleDescription = () => {
    setExpanded(!expanded);
  };

  const startCourse = () => {
    navigate(`/course/${id}`);
  };

  const toggleComplete = async (itemId) => {
    try {
      // Determine the new completion state
      const newCompletedState = !progress[itemId]?.completed;
      
      // Update progress state
      setProgress((prevState) => ({
        ...prevState,
        [itemId]: {
          ...prevState[itemId],
          completed: newCompletedState,
          progress: newCompletedState ? 100 : 0
        },
      }));

      // Check if course is now completed
      if (newCompletedState) {
        const allCompleted = course.content.every(
          (item) => progress[item._id]?.completed || item._id === itemId
        );

        if (allCompleted) {
          setCertificate({
            downloadUrl: "#", // Replace with actual certificate URL
          });
        }
      }
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const calculateOverallProgress = () => {
    if (!course) return 0;
    const totalItems = course.content.length;
    if (totalItems === 0) return 0;
    
    const completedItems = Object.values(progress).filter(
      (item) => item?.completed
    ).length;
    return Math.round((completedItems / totalItems) * 100);
  };

  const downloadCertificate = async () => {
    try {
      // Simulate certificate download
      console.log("Downloading certificate...");
      // In a real app, you would make an API call here
      // const response = await axios.get(`/api/courses/${id}/certificate`, { responseType: 'blob' });
      // Then create a download link
    } catch (error) {
      console.error("Error downloading certificate:", error);
    }
  };

  const downloadAttachment = async (attachmentId) => {
    try {
      // Simulate attachment download
      console.log(`Downloading attachment ${attachmentId}...`);
      // In a real app, you would make an API call here
    } catch (error) {
      console.error("Error downloading attachment:", error);
    }
  };

  const getContentDuration = (contentItem) => {
    if (contentItem.type === "quiz") {
      return `${contentItem.questions?.length || 0} questions`;
    }
    // For other types, you might want to add duration fields to your content items
    return "10 min"; // Default duration
  };

  const overallProgress = calculateOverallProgress();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-700">
            Course not found
          </h2>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
          <div className="flex flex-col lg:flex-row gap-12 items-center justify-center">
            <div className="lg:w-2/3">
              <div className="mb-4 flex items-center">
                <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {course.level}
                </span>
                <span className="ml-4 text-gray-300">
                  {course.content.length} lessons • {course.type} course
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center lg:text-left">
                {course.title}
              </h1>
              <h2 className="text-xl md:text-2xl text-gray-300 mb-6">
                {course.description.substring(0, 100) + "..."}
              </h2>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                    <span className="text-lg">I</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Instructor</p>
                    <p className="font-medium">Instructor Name</p>
                  </div>
                </div>
                <div className="bg-white/10 px-4 py-2 rounded-lg">
                  <p className="text-sm text-gray-300">Rating</p>
                  <p className="font-medium flex items-center">
                    <span className="text-yellow-400 mr-1">
                      {[...Array(5)].map((_, i) =>
                        i < Math.floor(course.averageRating) ? "★" : "☆"
                      )}
                    </span>{" "}
                    {course.averageRating.toFixed(1)}
                    <span className="text-gray-400 ml-2 text-sm">
                      ({course.ratings.length})
                    </span>
                  </p>
                </div>
                <div className="bg-white/10 px-4 py-2 rounded-lg">
                  <p className="text-sm text-gray-300">Enrolled</p>
                  <p className="font-medium">
                    {course.studentsEnrolled.length}+ students
                  </p>
                </div>
              </div>

              <button
                onClick={startCourse}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center justify-center text-lg transition-all duration-300 transform hover:scale-105"
              >
                {overallProgress > 0 ? (
                  <>
                    <span className="mr-3">Continue Learning</span>
                    <span className="w-8 h-8 bg-indigo-700 rounded-full flex items-center justify-center">
                      <FiPlay className="ml-0.5" />
                    </span>
                  </>
                ) : (
                  <>
                    <span className="mr-3">Start Learning</span>
                    <FiArrowRight className="ml-2" />
                  </>
                )}
              </button>
            </div>

            <div className="lg:w-1/3 flex items-center justify-center">
              <div className="relative group">
                <img
                  src={
                   `${base_url}/uploads/courses/${course.thumbnail?.filename}` ||
                    "https://via.placeholder.com/800x450?text=Course+Thumbnail"
                  }
                  alt={course.title}
                  className="w-full h-auto rounded-xl shadow-2xl transform group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-xl flex items-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-full">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-indigo-500 h-2 rounded-full"
                        style={{ width: `${overallProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-white mt-2 text-sm">
                      {overallProgress}% complete
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8"
            >
              <h2 className="text-2xl font-bold mb-6">About This Course</h2>

              <div className="mb-6">
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    expanded ? "max-h-full" : "max-h-32"
                  }`}
                >
                  <div 
                    className="whitespace-pre-line text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: course.description }}
                  />
                </div>
                <button
                  onClick={toggleDescription}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mt-2 flex items-center"
                >
                  {expanded ? (
                    <>
                      <span>Show less</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </>
                  ) : (
                    <>
                      <span>Show more</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </div>

              {course.requirements && course.requirements.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Requirements</h3>
                  <ul className="space-y-2">
                    {course.requirements.map((req, index) => (
                      <li key={index} className="flex items-start mb-2">
                        <span className="text-gray-500 mr-2 mt-0.5">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Course Content</h2>
                <div className="text-gray-600">
                  {overallProgress}% complete • {course.content.length} lessons
                </div>
              </div>

              <div className="space-y-2">
                {course.content.map((item, index) => {
                  const duration = getContentDuration(item);

                  return (
                    <motion.div
                      key={item._id || index}
                      whileHover={{ scale: 1.01 }}
                      className={`border rounded-lg overflow-hidden ${
                        item.isPremium
                          ? "border-gray-200"
                          : "border-gray-300 hover:border-indigo-400"
                      } ${
                        progress[item._id]?.completed
                          ? "bg-indigo-50 border-indigo-200"
                          : ""
                      }`}
                      onMouseEnter={() => setHoveredItem(item._id)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <div className="flex items-center p-4">
                        <div className="flex-shrink-0 relative">
                          {progress[item._id]?.completed ? (
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <FiCheck className="text-indigo-600 text-lg" />
                            </div>
                          ) : item.isPremium ? (
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                              <FiLock className="text-gray-400 text-lg" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                              <span className="text-gray-700 font-medium">
                                {index + 1}
                              </span>
                            </div>
                          )}

                          {progress[item._id]?.progress > 0 &&
                            !progress[item._id]?.completed && (
                              <div className="absolute -bottom-1 -right-3 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shadow-md">
                                {progress[item._id].progress}%
                              </div>
                            )}
                        </div>

                        <div className="ml-4 flex-1">
                          <div className="flex justify-between items-center">
                            <h3
                              className={`font-medium ${
                                item.isPremium ? "text-gray-500" : "text-gray-900"
                              }`}
                            >
                              {item.title}
                            </h3>
                            <span className="text-sm text-gray-500">
                              {duration}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center">
                            {item.type === "tutorial" && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded mr-2">
                                Video
                              </span>
                            )}
                            {item.type === "quiz" && (
                              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded mr-2">
                                Quiz
                              </span>
                            )}
                            {item.type === "live" && (
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded mr-2">
                                Live
                              </span>
                            )}
                            {item.isPremium && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                                Premium
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="ml-4 flex items-center">
                          {!item.isPremium && hoveredItem === item._id && (
                            <button
                              onClick={() => toggleComplete(item._id)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                progress[item._id]?.completed
                                  ? "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                              }`}
                            >
                              <FiCheck />
                            </button>
                          )}
                          {!item.isPremium && (
                            <button
                              onClick={() =>
                                navigate(
                                  `/course/${id}?lesson=${item._id}`
                                )
                              }
                              className="ml-2 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700"
                            >
                              <FiPlay className="ml-0.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {progress[item._id]?.progress > 0 &&
                        !progress[item._id]?.completed && (
                          <div className="w-full bg-gray-200 h-1">
                            <div
                              className="bg-indigo-500 h-1"
                              style={{
                                width: `${progress[item._id].progress}%`,
                              }}
                            ></div>
                          </div>
                        )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6 sticky top-6"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-lg mb-4">Course Progress</h3>
                <div className="flex items-center justify-center mb-4">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        className="text-gray-200"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                      />
                      <circle
                        className="text-indigo-600"
                        strokeWidth="8"
                        strokeDasharray={`${overallProgress * 2.51}, 251`}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold">
                        {overallProgress}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Completed</span>
                  <span>
                    {
                      Object.values(progress).filter((item) => item?.completed)
                        .length
                    }
                    /{course.content.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${overallProgress}%` }}
                  ></div>
                </div>
              </div>

              {course.attachments && course.attachments.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold text-lg mb-4">
                    Course Attachments
                  </h3>
                  <div className="space-y-3">
                    {course.attachments.map((file) => (
                      <div
                        key={file._id}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="p-2 bg-gray-100 rounded-lg mr-3">
                            <FiFile className="text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {file.filename}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(file.size / (1024 * 1024)).toFixed(1)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => downloadAttachment(file._id)}
                          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {certificate && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold text-lg mb-4">
                    Your Achievement
                  </h3>
                  <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex items-center">
                    <div className="bg-indigo-100 p-3 rounded-full mr-4">
                      <FiAward className="text-indigo-600 text-xl" />
                    </div>
                    <div>
                      <h4 className="font-medium text-indigo-800">
                        Course Completion Certificate
                      </h4>
                      <p className="text-sm text-indigo-600 mb-2">
                        Congratulations! You've completed this course.
                      </p>
                      <button
                        onClick={downloadCertificate}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                      >
                        <FiDownload className="mr-1" /> Download Certificate
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseOverview;