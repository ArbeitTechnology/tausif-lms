/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiEdit, FiEye, FiSearch, FiFilter, FiX, FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "../sidebar";
import Theader from "../common/Theader";
import axios from "axios";
import { MdDelete } from "react-icons/md";
const CourseList = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingCourse, setEditingCourse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [viewingCourse, setViewingCourse] = useState(null);
const [isViewModalOpen, setIsViewModalOpen] = useState(false);
const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
const [courseToDelete, setCourseToDelete] = useState(null);
  // Get teacher ID from localStorage
  // Get teacher ID from localStorage
  const teacherData = JSON.parse(localStorage.getItem("teacherData"));
  const teacherId = teacherData?._id;

  useEffect(() => {
    if (teacherId) {
      fetchCourses();
    }
  }, [teacherId]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${base_url}/api/teacher/my-courses/${teacherId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("teacherToken")}`,
        },
      });
      setCourses(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to fetch courses");
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "free" && course.type === "free") ||
      (filter === "premium" && course.type === "premium");
    return matchesSearch && matchesFilter;
  });

  const handleEdit = (course) => {
    setEditingCourse(JSON.parse(JSON.stringify(course))); // Deep copy
    setIsModalOpen(true);
  };
const handleDeleteCourse = async (courseId) => {
  if (window.confirm("Are you sure you want to delete this course?")) {
    try {
      await axios.delete(`${base_url}/api/teacher/delete-content/${courseId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("teacherToken")}`,
        },
      });
      toast.success("Course deleted successfully");
      fetchCourses(); // Refresh the course list
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error("Failed to delete course");
    }
  }
};
  const handleSave = async (updatedCourse) => {
    try {
      const response = await axios.put(
        `${base_url}/api/teacher/update-course/${updatedCourse._id}`,
        updatedCourse,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("teacherToken")}`,
          },
        }
      );
      setCourses(
        courses.map((c) => (c._id === updatedCourse._id ? response.data : c))
      );
      toast.success("Course updated successfully");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating course:", error);
      toast.error("Failed to update course");
    }
  };

  const handleAddContent = async (courseId, newContent) => {
    try {
      const response = await axios.post(
        `/api/teacher/add-content/${courseId}`,
        newContent,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("teacherToken")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error adding content:", error);
      throw error;
    }
  };

  const handleUpdateContent = async (courseId, contentId, updatedContent) => {
    try {
      const response = await axios.put(
        `${base_url}/api/teacher/update-content/${courseId}/${contentId}`,
        updatedContent,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("teacherToken")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating content:", error);
      throw error;
    }
  };

const handleDeleteClick = (courseId) => {
  setCourseToDelete(courseId);
  setIsDeleteModalOpen(true);
};

const handleDeleteConfirm = async () => {
  if (!courseToDelete) return;
  
  try {
    await axios.delete(`${base_url}/api/teacher/delete-content/${courseToDelete}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("teacherToken")}`,
      },
    });
    toast.success("Course deleted successfully");
    fetchCourses(); // Refresh the course list
  } catch (error) {
    console.error("Error deleting course:", error);
    toast.error("Failed to delete course");
  } finally {
    setIsDeleteModalOpen(false);
    setCourseToDelete(null);
  }
};


  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-300 min-h-screen flex items-center justify-center">
      <div className="flex w-full h-[100vh] bg-white overflow-hidden">
        {/* Sidebar Section */}
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />

        {/* Main Content Section */}
        <div className="flex-1 h-full overflow-auto">
          <Theader
            toggleSidebar={toggleSidebar}
            isSidebarOpen={isSidebarOpen}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen p-6 bg-gray-50"
          >
            <div className="max-w-full mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">My Courses</h1>
              </div>

              <div className="bg-white rounded-[5px] shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <FiFilter className="text-gray-400" />
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-500"
                    >
                      <option value="all">All Courses</option>
                      <option value="free">Free Courses</option>
                      <option value="premium">Premium Courses</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto border-[1px] border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs md:text-sm font-[700] text-gray-500 uppercase tracking-wider">
                          Course
                        </th>
                        <th className="px-6 py-3 text-left text-xs md:text-sm font-[700] text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs md:text-sm font-[700] text-gray-500 uppercase tracking-wider">
                          Students
                        </th>
                        <th className="px-6 py-3 text-left text-xs md:text-sm font-[700] text-gray-500 uppercase tracking-wider">
                          Rating
                        </th>
                        <th className="px-6 py-3 text-left text-xs md:text-sm font-[700] text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCourses.length > 0 ? (
                        filteredCourses.map((course) => (
                          <tr key={course._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <img
                                    className="h-10 w-10 rounded-md object-cover"
                                    src={
                                      course.thumbnail?.path
                                        ? `${base_url}/uploads/courses/${course.thumbnail.filename}`
                                        : "/default-thumbnail.jpg"
                                    }
                                    alt={course.title}
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {course.title}
                                  </div>
                                  <div className="text-sm text-gray-500 line-clamp-1">
                                    {course.description}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  course.type === "premium"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {course.type === "premium"
                                  ? `$${course.price}`
                                  : "Free"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {course.studentsEnrolled?.length || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="text-sm font-medium text-gray-900 mr-2">
                                  {course.averageRating?.toFixed(1) || "0.0"}
                                </div>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <svg
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < Math.floor(course.averageRating || 0)
                                          ? "text-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                              </div>
                            </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
  <div className="flex space-x-2">
    <button
      onClick={() => handleEdit(course)}
      className="bg-blue-500 rounded-[5px] cursor-pointer text-white px-[8px] py-[6px]"
      title="Edit"
    >
      <FiEdit className="text-[15px]" />
    </button>
<button
  onClick={() => {
    setViewingCourse(course);
    setIsViewModalOpen(true);
  }}
  className="bg-green-500 rounded-[5px] cursor-pointer text-white px-[8px] py-[6px]"
  title="View"
>
  <FiEye className="text-[15px]" />
</button>
<button
  onClick={() => handleDeleteClick(course._id)}
  className="bg-red-500 cursor-pointer rounded-[5px] text-white px-[8px] py-[6px]"
  title="Delete"
>
  <MdDelete className="h-5 w-5" />
</button>
  </div>
</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                            No courses found. Create your first course to get started.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Edit Course Modal */}
            {isModalOpen && editingCourse && (
              <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[10000] p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-xl shadow-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto"
                >
                  <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">
                      Edit Course: {editingCourse.title}
                    </h2>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FiX className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Basic Information</h3>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Course Title *
                          </label>
                          <input
                            type="text"
                            value={editingCourse.title}
                            onChange={(e) =>
                              setEditingCourse({
                                ...editingCourse,
                                title: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Course Description *
                          </label>
                          <textarea
                            value={editingCourse.description}
                            onChange={(e) =>
                              setEditingCourse({
                                ...editingCourse,
                                description: e.target.value,
                              })
                            }
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Course Type *
                          </label>
                          <select
                            value={editingCourse.type}
                            onChange={(e) =>
                              setEditingCourse({
                                ...editingCourse,
                                type: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-500"
                          >
                            <option value="free">Free</option>
                            <option value="premium">Premium</option>
                          </select>
                        </div>
                        {editingCourse.type === "premium" && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Price *
                            </label>
                            <input
                              type="number"
                              value={editingCourse.price}
                              onChange={(e) =>
                                setEditingCourse({
                                  ...editingCourse,
                                  price: parseFloat(e.target.value),
                                })
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-500"
                            />
                          </div>
                        )}
                      </div>

                      {/* Course Content */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold">Course Content</h3>
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                try {
                                  const newContent = {
                                    id: Date.now().toString(),
                                    type: "tutorial",
                                    title: "New Tutorial",
                                    description: "",
                                    isPremium: editingCourse.type === "premium",
                                    ...(editingCourse.type === "free"
                                      ? { youtubeLink: "" }
                                      : { content: "" }),
                                  };
                                  
                                  const updatedCourse = await handleAddContent(
                                    editingCourse._id,
                                    newContent
                                  );
                                  
                                  setEditingCourse(updatedCourse);
                                  toast.success("Content added successfully");
                                } catch (error) {
                                  toast.error("Failed to add content");
                                }
                              }}
                              className="flex items-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
                            >
                              <FiPlus /> Add Tutorial
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  const newContent = {
                                    id: Date.now().toString(),
                                    type: "quiz",
                                    title: "New Quiz",
                                    description: "",
                                    questions: [
                                      {
                                        id: Date.now().toString(),
                                        question: "",
                                        type: "mcq-single",
                                        options: ["", ""],
                                        correctAnswer: null,
                                      },
                                    ],
                                  };
                                  
                                  const updatedCourse = await handleAddContent(
                                    editingCourse._id,
                                    newContent
                                  );
                                  
                                  setEditingCourse(updatedCourse);
                                  toast.success("Quiz added successfully");
                                } catch (error) {
                                  toast.error("Failed to add quiz");
                                }
                              }}
                              className="flex items-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
                            >
                              <FiPlus /> Add Quiz
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  const newContent = {
                                    id: Date.now().toString(),
                                    type: "live",
                                    title: "New Live Class",
                                    description: "",
                                    meetingLink: "",
                                    schedule: new Date().toISOString(),
                                  };
                                  
                                  const updatedCourse = await handleAddContent(
                                    editingCourse._id,
                                    newContent
                                  );
                                  
                                  setEditingCourse(updatedCourse);
                                  toast.success("Live class added successfully");
                                } catch (error) {
                                  toast.error("Failed to add live class");
                                }
                              }}
                              className="flex items-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
                            >
                              <FiPlus /> Add Live Class
                            </button>
                          </div>
                        </div>

                        {editingCourse.content.map((item, index) => (
                          <div
                            key={item._id || item.id}
                            className="border border-gray-200 rounded-lg p-4 space-y-4"
                          >
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">
                                {index + 1}.{" "}
                                {item.type === "tutorial"
                                  ? "Tutorial"
                                  : item.type === "quiz"
                                  ? "Quiz"
                                  : "Live Class"}
                              </h4>
                              <button
                                onClick={async () => {
                                  try {
                                    await handleDeleteContent(
                                      editingCourse._id,
                                      item._id || item.id
                                    );
                                    const newContent = editingCourse.content.filter(
                                      (c) => (c._id || c.id) !== (item._id || item.id)
                                    );
                                    setEditingCourse({
                                      ...editingCourse,
                                      content: newContent,
                                    });
                                    toast.success("Content removed successfully");
                                  } catch (error) {
                                    toast.error("Failed to remove content");
                                  }
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                Remove
                              </button>
                            </div>

                            {item.type === "tutorial" && (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title *
                                  </label>
                                  <input
                                    type="text"
                                    value={item.title}
                                    onChange={(e) => {
                                      const newContent = [...editingCourse.content];
                                      newContent[index].title = e.target.value;
                                      setEditingCourse({
                                        ...editingCourse,
                                        content: newContent,
                                      });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                  </label>
                                  <textarea
                                    value={item.description}
                                    onChange={(e) => {
                                      const newContent = [...editingCourse.content];
                                      newContent[index].description = e.target.value;
                                      setEditingCourse({
                                        ...editingCourse,
                                        content: newContent,
                                      });
                                    }}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                  />
                                </div>
                                {editingCourse.type === "free" ? (
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      YouTube Link *
                                    </label>
                                    <input
                                      type="url"
                                      value={item.youtubeLink || ""}
                                      onChange={(e) => {
                                        const newContent = [...editingCourse.content];
                                        newContent[index].youtubeLink =
                                          e.target.value;
                                        setEditingCourse({
                                          ...editingCourse,
                                          content: newContent,
                                        });
                                      }}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                  </div>
                                ) : (
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Video Content *
                                    </label>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="text"
                                        value={item.content || ""}
                                        onChange={(e) => {
                                          const newContent = [
                                            ...editingCourse.content,
                                          ];
                                          newContent[index].content = e.target.value;
                                          setEditingCourse({
                                            ...editingCourse,
                                            content: newContent,
                                          });
                                        }}
                                        placeholder="Video file path"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                      />
                                      <button className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded">
                                        Upload
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {item.type === "quiz" && (
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Quiz Title *
                                  </label>
                                  <input
                                    type="text"
                                    value={item.title}
                                    onChange={(e) => {
                                      const newContent = [...editingCourse.content];
                                      newContent[index].title = e.target.value;
                                      setEditingCourse({
                                        ...editingCourse,
                                        content: newContent,
                                      });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                  </label>
                                  <textarea
                                    value={item.description}
                                    onChange={(e) => {
                                      const newContent = [...editingCourse.content];
                                      newContent[index].description = e.target.value;
                                      setEditingCourse({
                                        ...editingCourse,
                                        content: newContent,
                                      });
                                    }}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                  />
                                </div>

                                <div className="space-y-4">
                                  {item.questions?.map((question, qIndex) => (
                                    <div
                                      key={question._id || question.id}
                                      className="border-l-2 border-gray-300 pl-3 space-y-3"
                                    >
                                      <div className="flex justify-between items-center">
                                        <h5 className="font-medium">
                                          Question {qIndex + 1}
                                        </h5>
                                        <button
                                          onClick={async () => {
                                            try {
                                              const updatedQuestions = item.questions.filter(
                                                (q) => (q._id || q.id) !== (question._id || question.id)
                                              );
                                              
                                              const updatedContent = {
                                                ...item,
                                                questions: updatedQuestions
                                              };
                                              
                                              await handleUpdateContent(
                                                editingCourse._id,
                                                item._id || item.id,
                                                updatedContent
                                              );
                                              
                                              const newContent = [...editingCourse.content];
                                              newContent[index].questions = updatedQuestions;
                                              setEditingCourse({
                                                ...editingCourse,
                                                content: newContent,
                                              });
                                              
                                              toast.success("Question removed successfully");
                                            } catch (error) {
                                              toast.error("Failed to remove question");
                                            }
                                          }}
                                          className="text-red-500 hover:text-red-700 text-sm"
                                        >
                                          Remove
                                        </button>
                                      </div>

                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Question Text *
                                        </label>
                                        <input
                                          type="text"
                                          value={question.question}
                                          onChange={(e) => {
                                            const newContent = [...editingCourse.content];
                                            newContent[index].questions[qIndex].question = e.target.value;
                                            setEditingCourse({
                                              ...editingCourse,
                                              content: newContent,
                                            });
                                          }}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Question Type *
                                        </label>
                                        <select
                                          value={question.type}
                                          onChange={(e) => {
                                            const newContent = [...editingCourse.content];
                                            newContent[index].questions[qIndex].type =
                                              e.target.value;
                                            // Reset correct answer when changing type
                                            newContent[index].questions[qIndex].correctAnswer = null;
                                            setEditingCourse({
                                              ...editingCourse,
                                              content: newContent,
                                            });
                                          }}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        >
                                          <option value="mcq-single">
                                            Single Choice MCQ
                                          </option>
                                          <option value="mcq-multiple">
                                            Multiple Choice MCQ
                                          </option>
                                          <option value="short-answer">
                                            Short Answer
                                          </option>
                                          <option value="broad-answer">
                                            Broad Answer
                                          </option>
                                        </select>
                                      </div>

                                      {/* MCQ Question Types */}
                                      {(question.type === "mcq-single" ||
                                        question.type === "mcq-multiple") && (
                                        <div className="space-y-2">
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Options *
                                          </label>
                                          {question.options?.map((option, oIndex) => (
                                            <div
                                              key={oIndex}
                                              className={`flex items-center gap-2 p-2 rounded-lg ${
                                                (question.type === "mcq-single" &&
                                                  question.correctAnswer ===
                                                    oIndex) ||
                                                (question.type === "mcq-multiple" &&
                                                  Array.isArray(
                                                    question.correctAnswer
                                                  ) &&
                                                  question.correctAnswer.includes(
                                                    oIndex
                                                  ))
                                                  ? "border-2 border-green-500 bg-green-50"
                                                  : "border border-gray-300"
                                              }`}
                                            >
                                              <input
                                                type={
                                                  question.type === "mcq-single"
                                                    ? "radio"
                                                    : "checkbox"
                                                }
                                                name={`question-${qIndex}`}
                                                checked={
                                                  question.type === "mcq-single"
                                                    ? question.correctAnswer ===
                                                      oIndex
                                                    : Array.isArray(
                                                        question.correctAnswer
                                                      ) &&
                                                      question.correctAnswer.includes(
                                                        oIndex
                                                      )
                                                }
                                                onChange={() => {
                                                  const newContent = [
                                                    ...editingCourse.content,
                                                  ];
                                                  if (
                                                    question.type === "mcq-single"
                                                  ) {
                                                    newContent[index].questions[
                                                      qIndex
                                                    ].correctAnswer = oIndex;
                                                  } else {
                                                    const currentAnswers =
                                                      newContent[index].questions[
                                                        qIndex
                                                      ].correctAnswer || [];
                                                    newContent[index].questions[
                                                      qIndex
                                                    ].correctAnswer =
                                                      currentAnswers.includes(oIndex)
                                                        ? currentAnswers.filter(
                                                            (a) => a !== oIndex
                                                          )
                                                        : [...currentAnswers, oIndex];
                                                  }
                                                  setEditingCourse({
                                                    ...editingCourse,
                                                    content: newContent,
                                                  });
                                                }}
                                                className={`h-4 w-4 ${
                                                  question.type === "mcq-single"
                                                    ? "text-green-600"
                                                    : "text-green-600"
                                                } border-gray-300 focus:ring-green-500`}
                                              />
                                              <input
                                                type="text"
                                                value={option}
                                                onChange={(e) => {
                                                  const newContent = [
                                                    ...editingCourse.content,
                                                  ];
                                                  newContent[index].questions[
                                                    qIndex
                                                  ].options[oIndex] = e.target.value;
                                                  setEditingCourse({
                                                    ...editingCourse,
                                                    content: newContent,
                                                  });
                                                }}
                                                className="flex-1 px-3 py-1 border-none focus:ring-0 bg-transparent"
                                                placeholder={`Option ${oIndex + 1}`}
                                              />
                                              {question.options.length > 2 && (
                                                <button
                                                  onClick={async () => {
                                                    try {
                                                      const newOptions = item.questions[qIndex].options.filter(
                                                        (_, i) => i !== oIndex
                                                      );
                                                      
                                                      const updatedQuestions = [...item.questions];
                                                      updatedQuestions[qIndex].options = newOptions;
                                                      
                                                      if (question.type === "mcq-single") {
                                                        if (updatedQuestions[qIndex].correctAnswer === oIndex) {
                                                          updatedQuestions[qIndex].correctAnswer = null;
                                                        } else if (updatedQuestions[qIndex].correctAnswer > oIndex) {
                                                          updatedQuestions[qIndex].correctAnswer -= 1;
                                                        }
                                                      } else {
                                                        updatedQuestions[qIndex].correctAnswer =
                                                          updatedQuestions[qIndex].correctAnswer
                                                            ?.filter((a) => a !== oIndex)
                                                            ?.map((a) => (a > oIndex ? a - 1 : a)) || [];
                                                      }
                                                      
                                                      const updatedContent = {
                                                        ...item,
                                                        questions: updatedQuestions
                                                      };
                                                      
                                                      await handleUpdateContent(
                                                        editingCourse._id,
                                                        item._id || item.id,
                                                        updatedContent
                                                      );
                                                      
                                                      const newContent = [...editingCourse.content];
                                                      newContent[index].questions = updatedQuestions;
                                                      setEditingCourse({
                                                        ...editingCourse,
                                                        content: newContent,
                                                      });
                                                      
                                                      toast.success("Option removed successfully");
                                                    } catch (error) {
                                                      toast.error("Failed to remove option");
                                                    }
                                                  }}
                                                  className="text-red-500 hover:text-red-700"
                                                >
                                                  Remove
                                                </button>
                                              )}
                                            </div>
                                          ))}
                                          <button
                                            onClick={async () => {
                                              try {
                                                const newOptions = [...item.questions[qIndex].options, ""];
                                                
                                                const updatedQuestions = [...item.questions];
                                                updatedQuestions[qIndex].options = newOptions;
                                                
                                                const updatedContent = {
                                                  ...item,
                                                  questions: updatedQuestions
                                                };
                                                
                                                await handleUpdateContent(
                                                  editingCourse._id,
                                                  item._id || item.id,
                                                  updatedContent
                                                );
                                                
                                                const newContent = [...editingCourse.content];
                                                newContent[index].questions = updatedQuestions;
                                                setEditingCourse({
                                                  ...editingCourse,
                                                  content: newContent,
                                                });
                                                
                                                toast.success("Option added successfully");
                                              } catch (error) {
                                                toast.error("Failed to add option");
                                              }
                                            }}
                                            className="text-sm text-green-600 hover:text-green-800 flex items-center gap-1"
                                          >
                                            <FiPlus className="h-4 w-4" /> Add Option
                                          </button>
                                        </div>
                                      )}

                                      {/* Short Answer Question Type */}
                                      {question.type === "short-answer" && (
                                        <div className="space-y-2">
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Expected Answer (for reference)
                                          </label>
                                          <input
                                            type="text"
                                            value={question.correctAnswer || ""}
                                            onChange={(e) => {
                                              const newContent = [
                                                ...editingCourse.content,
                                              ];
                                              newContent[index].questions[
                                                qIndex
                                              ].correctAnswer = e.target.value;
                                              setEditingCourse({
                                                ...editingCourse,
                                                content: newContent,
                                              });
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            placeholder="Expected short answer"
                                          />
                                        </div>
                                      )}

                                      {/* Broad Answer Question Type */}
                                      {question.type === "broad-answer" && (
                                        <div className="space-y-2">
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Answer Guidelines
                                          </label>
                                          <textarea
                                            value={question.correctAnswer || ""}
                                            onChange={(e) => {
                                              const newContent = [
                                                ...editingCourse.content,
                                              ];
                                              newContent[index].questions[
                                                qIndex
                                              ].correctAnswer = e.target.value;
                                              setEditingCourse({
                                                ...editingCourse,
                                                content: newContent,
                                              });
                                            }}
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            placeholder="Provide guidelines for evaluating broad answers"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  ))}

                                  <button
                                    onClick={async () => {
                                      try {
                                        const newQuestion = {
                                          id: Date.now().toString(),
                                          question: "New Question",
                                          type: "mcq-single",
                                          options: ["Option 1", "Option 2"],
                                          correctAnswer: null,
                                        };

                                        const updatedQuestions = [...item.questions, newQuestion];
                                        
                                        const updatedContent = {
                                          ...item,
                                          questions: updatedQuestions
                                        };
                                        
                                        await handleUpdateContent(
                                          editingCourse._id,
                                          item._id || item.id,
                                          updatedContent
                                        );
                                        
                                        const newContent = [...editingCourse.content];
                                        newContent[index].questions = updatedQuestions;
                                        setEditingCourse({
                                          ...editingCourse,
                                          content: newContent,
                                        });
                                        
                                        toast.success("Question added successfully");
                                      } catch (error) {
                                        toast.error("Failed to add question");
                                      }
                                    }}
                                    className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
                                  >
                                    + Add Question
                                  </button>
                                </div>
                              </div>
                            )}

                            {item.type === "live" && (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title *
                                  </label>
                                  <input
                                    type="text"
                                    value={item.title}
                                    onChange={(e) => {
                                      const newContent = [...editingCourse.content];
                                      newContent[index].title = e.target.value;
                                      setEditingCourse({
                                        ...editingCourse,
                                        content: newContent,
                                      });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                  </label>
                                  <textarea
                                    value={item.description}
                                    onChange={(e) => {
                                      const newContent = [...editingCourse.content];
                                      newContent[index].description = e.target.value;
                                      setEditingCourse({
                                        ...editingCourse,
                                        content: newContent,
                                      });
                                    }}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Meeting Link *
                                  </label>
                                  <input
                                    type="url"
                                    value={item.meetingLink || ""}
                                    onChange={(e) => {
                                      const newContent = [...editingCourse.content];
                                      newContent[index].meetingLink = e.target.value;
                                      setEditingCourse({
                                        ...editingCourse,
                                        content: newContent,
                                      });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Schedule *
                                  </label>
                                  <input
                                    type="datetime-local"
                                    value={item.schedule || ""}
                                    onChange={(e) => {
                                      const newContent = [...editingCourse.content];
                                      newContent[index].schedule = e.target.value;
                                      setEditingCourse({
                                        ...editingCourse,
                                        content: newContent,
                                      });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-6">
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="px-6 py-2 rounded-lg font-medium text-gray-700 bg-gray-200 hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSave(editingCourse)}
                        className="px-6 py-2 rounded-lg font-medium text-white bg-gray-600 hover:bg-gray-700"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}     
            {/* View Course Modal */}
{isViewModalOpen && viewingCourse && (
  <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[10000] p-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
    >
      <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">
          Course Details: {viewingCourse.title}
        </h2>
        <button
          onClick={() => setIsViewModalOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <FiX className="h-6 w-6" />
        </button>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          {/* Course Thumbnail */}
          <div className="flex justify-center">
            <img
              className="h-48 w-full object-cover rounded-lg"
              src={
                viewingCourse.thumbnail?.path
                  ? `${base_url}/uploads/courses/${viewingCourse.thumbnail.filename}`
                  : "/default-thumbnail.jpg"
              }
              alt={viewingCourse.title}
            />
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2 border-gray-200">Basic Information</h3>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Title</h4>
              <p className="text-gray-800">{viewingCourse.title}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Description</h4>
              <p className="text-gray-800 whitespace-pre-line">
                {viewingCourse.description}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Type</h4>
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    viewingCourse.type === "premium"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {viewingCourse.type === "premium"
                    ? `Premium ($${viewingCourse.price})`
                    : "Free"}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Students Enrolled</h4>
                <p className="text-gray-800">
                  {viewingCourse.studentsEnrolled?.length || 0}
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Rating</h4>
              <div className="flex items-center">
                <div className="text-lg font-medium text-gray-900 mr-2">
                  {viewingCourse.averageRating?.toFixed(1) || "0.0"}
                </div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(viewingCourse.averageRating || 0)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Course Content */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b border-gray-200 pb-2">Course Content</h3>
            {viewingCourse.content?.length > 0 ? (
              <div className="space-y-3">
                {viewingCourse.content.map((item, index) => (
                  <div
                    key={item._id || item.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <h4 className="font-medium">
                      {index + 1}. {item.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.type === "tutorial"
                        ? "Tutorial"
                        : item.type === "quiz"
                        ? "Quiz"
                        : "Live Class"}
                    </p>
                    {item.description && (
                      <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">
                        {item.description}
                      </p>
                    )}
                    {item.type === "tutorial" && (
                      <div className="mt-2">
                        {viewingCourse.type === "free" ? (
                          <a
                            href={item.youtubeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Watch on YouTube
                          </a>
                        ) : (
                          <p className="text-sm text-gray-700">
                            Premium content available
                          </p>
                        )}
                      </div>
                    )}
                    {item.type === "live" && (
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Scheduled:</span>{" "}
                          {new Date(item.schedule).toLocaleString()}
                        </p>
                        <a
                          href={item.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Join Meeting
                        </a>
                      </div>
                    )}
                    {item.type === "quiz" && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-700">
                          {item.questions?.length || 0} questions
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No content available for this course.</p>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={() => setIsViewModalOpen(false)}
            className="px-6 py-2 rounded-lg font-medium text-white cursor-pointer bg-gray-600 hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </motion.div>
  </div>
)}

{/* Delete Confirmation Modal */}
{isDeleteModalOpen && (
  <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[10000] p-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl shadow-lg w-full max-w-md"
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Confirm Deletion</h3>
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this course? This action cannot be undone.
        </p>
        
        <div className="flex justify-end gap-4">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="px-4 py-2 rounded-lg font-medium text-gray-700 bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteConfirm}
            className="px-4 py-2 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  </div>
)}
                 </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CourseList;