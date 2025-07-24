/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { FiEdit2, FiTrash2, FiUser, FiSearch, FiFilter, FiX, FiPlus } from "react-icons/fi";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-hot-toast";
import DOMPurify from 'dompurify';
const CourseList = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [editingCourse, setEditingCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newAttachment, setNewAttachment] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);

  // Fetch courses from API
  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${base_url}/api/admin/courses`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setCourses(response.data.data);
      setError(null);
    } catch (err) {
      setError("Failed to load courses. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch teachers from API
  const fetchTeachers = async () => {
    try {
      const response = await axios.get(`${base_url}/api/admin/teachers`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setTeachers(response.data.data);
    } catch (err) {
      toast.error("Error fetching teachers:", {
        style: {
          background: "#fff",
          color: "#000",
          border: "1px solid #e5e7eb",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        },
        iconTheme: {
          primary: "#ff0000",
          secondary: "#ffffff",
        },
      });
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchCourses();
    fetchTeachers();
  }, []);

  // Filter courses based on search and filter
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilterType =
      filterType === "all" || course.type === filterType;

    const matchesFilterCategory =
      filterCategory === "all" ||
      (course.categories || []).includes(filterCategory);

    const matchesFilterLevel =
      filterLevel === "all" || course.level === filterLevel;

    return matchesSearch && matchesFilterType && matchesFilterCategory && matchesFilterLevel;
  });

  const categoryOptions = Array.from(
    new Set(courses.flatMap((c) => c.categories || []))
  );

  const levelOptions = ["beginner", "intermediate", "advanced"];

  // Handle changing course instructor
  const changeInstructor = async (courseId, newInstructorId) => {
    try {
      if (!courseId || !newInstructorId) {
        toast.error("Both course and teacher selection are required.");
        return;
      }

      // Get admin ID from your authentication context or localStorage
      const admindata = JSON.parse(localStorage.getItem("admin"));

      const response = await axios.put(
        `${base_url}/api/admin/courses/${courseId}/change-instructor`,
        {
          newInstructorId,
          changedBy: admindata._id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Instructor changed successfully!", {
          style: {
            background: "#fff",
            color: "#000",
            border: "1px solid #e5e7eb",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          },
          iconTheme: {
            primary: "#000",
            secondary: "#fff",
          },
        });
        fetchCourses(); // Refresh the course list
      }
    } catch (err) {
      console.error("Error changing instructor:", err);
      toast.error("Failed to change instructor. Please try again.", {
        style: {
          background: "#fff",
          color: "#000",
          border: "1px solid #e5e7eb",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        },
        iconTheme: {
          primary: "#ff0000",
          secondary: "#ffffff",
        },
      });
    }
  };

  // Handle deleting a course
  const deleteCourse = async (courseId) => {
    try {
      await axios.delete(`${base_url}/api/admin/courses/${courseId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchCourses(); // Refresh the course list after deletion
      toast.success("Course deleted successfully!", {
        style: {
          background: "#fff",
          color: "#000",
          border: "1px solid #e5e7eb",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        },
        iconTheme: {
          primary: "#000",
          secondary: "#fff",
        },
      });
    } catch (err) {
      toast.error("Failed to delete course. Please try again.", {
        style: {
          background: "#fff",
          color: "#000",
          border: "1px solid #e5e7eb",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        },
        iconTheme: {
          primary: "#ff0000",
          secondary: "#ffffff",
        },
      });
    }
  };

  // Handle starting course edit
  const startEdit = (course) => {
    setEditingCourse({ ...course });
    setEditingQuiz(null);
  };

  // Handle saving edited course
  const saveEdit = async () => {
    try {
      const formData = new FormData();
      formData.append("title", editingCourse.title);
      formData.append("description", editingCourse.description);
      formData.append("type", editingCourse.type);
      formData.append("level", editingCourse.level);
      formData.append("price", editingCourse.price);
      
      if (editingCourse.newThumbnail) {
        formData.append("thumbnail", editingCourse.newThumbnail);
      }
      
      if (newAttachment) {
        formData.append("attachments", newAttachment);
      }
      
      // Append categories if they exist
      if (editingCourse.categories && editingCourse.categories.length > 0) {
        editingCourse.categories.forEach((cat, index) => {
          formData.append(`categories[${index}]`, cat);
        });
      }

      await axios.put(
        `${base_url}/api/admin/courses/${editingCourse._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      fetchCourses(); // Refresh the course list
      setEditingCourse(null);
      setNewAttachment(null);
      toast.success("Course updated successfully!", {
        style: {
          background: "#fff",
          color: "#000",
          border: "1px solid #e5e7eb",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        },
        iconTheme: {
          primary: "#000",
          secondary: "#fff",
        },
      });
    } catch (err) {
      console.error("Error updating course:", err);
      toast.error("Failed to update course. Please try again.", {
        style: {
          background: "#fff",
          color: "#000",
          border: "1px solid #e5e7eb",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        },
        iconTheme: {
          primary: "#ff0000",
          secondary: "#ffffff",
        },
      });
    }
  };

  // Handle thumbnail change
  const handleThumbnailChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setEditingCourse({
        ...editingCourse,
        newThumbnail: e.target.files[0],
      });
    }
  };

  // Handle attachment change
  const handleAttachmentChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewAttachment(e.target.files[0]);
    }
  };

  // Remove attachment
  const removeAttachment = (attachmentId) => {
    setEditingCourse({
      ...editingCourse,
      attachments: editingCourse.attachments.filter(
        (att) => att._id !== attachmentId
      ),
    });
  };

  // Start editing quiz
  const startQuizEdit = (quiz) => {
    setEditingQuiz(JSON.parse(JSON.stringify(quiz)));
  };

  // Save quiz changes
  const saveQuizChanges = () => {
    setEditingCourse({
      ...editingCourse,
      content: editingCourse.content.map((item) =>
        item._id === editingQuiz._id ? editingQuiz : item
      ),
    });
    setEditingQuiz(null);
  };

  // Update quiz question
  const updateQuizQuestion = (questionIndex, field, value) => {
    const updatedQuestions = [...editingQuiz.questions];
    updatedQuestions[questionIndex][field] = value;
    setEditingQuiz({
      ...editingQuiz,
      questions: updatedQuestions,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-15 w-15 border-b-4 border-l-gray-900 border-solid"></div>
          <p className="mt-2 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={fetchCourses}
            className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="w-full mb-6 pb-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 text-left">
            Course Management
          </h1>
          <p className="text-gray-600 mt-2">
            Streamline course creation and assign qualified instructors to
            ensure high-quality learning.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search courses..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-600" />
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:border-gray-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Courses</option>
              <option value="free">Free Courses</option>
              <option value="premium">Premium Courses</option>
            </select>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:border-gray-500"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:border-gray-500"
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
            >
              <option value="all">All Levels</option>
              {levelOptions.map((level) => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Course List */}
        <div className="space-y-6">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                No courses found matching your criteria
              </p>
            </div>
          ) : (
            filteredCourses.map((course) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Course Thumbnail */}
                    <div className="w-full md:w-48 h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={`${base_url}/uploads/courses/${course.thumbnail.filename}`}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Course Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">
                            {course.title}
                          </h2>
                          
                                                        <div 
  className="text-sm text-gray-500 line-clamp-1 overflow-hidden"
  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(course.description) }}
/>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {course.level && (
                              <span className="bg-black text-white text-xs px-2 py-1 rounded-md">
                                {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                              </span>
                            )}
                            {course.categories && course.categories.map((category, index) => (
                              <span key={index} className="bg-black text-white text-xs px-2 py-1 rounded-md">
                                {category}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(course)}
                            className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => deleteCourse(course._id)}
                            className="text-gray-600 hover:text-red-500 p-2 rounded-full hover:bg-gray-100"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-4 items-center">
                        <div className="flex items-center">
                          <FiUser className="text-gray-500 mr-2" />
                          <select
                            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:border-gray-500"
                            value={course.instructor?._id || ""}
                            onChange={(e) =>
                              changeInstructor(course._id, e.target.value)
                            }
                          >
                            <option value="">Select Teacher</option>
                            {teachers.map((teacher) => (
                              <option
                                key={teacher._id}
                                value={teacher._id}
                                selected={teacher._id === course.instructor}
                              >
                                {teacher.full_name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="text-sm text-gray-500">
                          {course.type === "premium" ? (
                            <span className="font-medium text-green-600">
                             ৳{course.price}
                            </span>
                          ) : (
                            <span className="font-medium text-blue-600">
                              Free
                            </span>
                          )}
                        </div>

                        <div className="text-sm text-gray-500">
                          {course.studentsEnrolled?.length || 0} students
                        </div>

                        <div className="text-sm text-gray-500">
                          Created:{" "}
                          {new Date(course.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Edit Modal */}
        {editingCourse && (
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center p-4 z-[10000]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Edit Course
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                      value={editingCourse.title}
                      onChange={(e) =>
                        setEditingCourse({
                          ...editingCourse,
                          title: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Level
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-500"
                      value={editingCourse.level || ""}
                      onChange={(e) =>
                        setEditingCourse({
                          ...editingCourse,
                          level: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Level</option>
                      {levelOptions.map((level) => (
                        <option key={level} value={level}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-500"
                    rows="3"
                    value={editingCourse.description}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-500"
                      value={editingCourse.type}
                      onChange={(e) =>
                        setEditingCourse({
                          ...editingCourse,
                          type: e.target.value,
                          price:
                            e.target.value === "free" ? 0 : editingCourse.price,
                        })
                      }
                    >
                      <option value="free">Free</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>

                  {editingCourse.type === "premium" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price
                      </label>
                      <input
                        type="number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                        value={editingCourse.price}
                        onChange={(e) =>
                          setEditingCourse({
                            ...editingCourse,
                            price: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categories
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editingCourse.categories?.map((category, index) => (
                      <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                        <span>{category}</span>
                        <button
                          type="button"
                          className="ml-1 text-gray-500 hover:text-red-500"
                          onClick={() => {
                            const updatedCategories = [...editingCourse.categories];
                            updatedCategories.splice(index, 1);
                            setEditingCourse({
                              ...editingCourse,
                              categories: updatedCategories,
                            });
                          }}
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:border-gray-500"
                      placeholder="Add category"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.target.value.trim()) {
                          const updatedCategories = [...(editingCourse.categories || []), e.target.value.trim()];
                          setEditingCourse({
                            ...editingCourse,
                            categories: updatedCategories,
                          });
                          e.target.value = '';
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-900 text-white rounded-r-lg hover:bg-gray-800"
                      onClick={(e) => {
                        const input = e.target.previousElementSibling;
                        if (input.value.trim()) {
                          const updatedCategories = [...(editingCourse.categories || []), input.value.trim()];
                          setEditingCourse({
                            ...editingCourse,
                            categories: updatedCategories,
                          });
                          input.value = '';
                        }
                      }}
                    >
                      <FiPlus />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thumbnail
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-20 bg-gray-100 rounded-lg overflow-hidden">
                        {editingCourse.newThumbnail ? (
                          <img
                           src={
                                      editingCourse.thumbnail?.filename
                                        ? `${base_url}/uploads/courses/${editingCourse.thumbnail.filename}`
                                        : "/default-thumbnail.jpg"
                                    }
                            alt="New thumbnail"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={`${base_url}/uploads/courses/${editingCourse.thumbnail.filename}`}
                            alt="Current thumbnail"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <label className="cursor-pointer">
                        <span className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                          Change
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleThumbnailChange}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Attachments ({editingCourse.attachments?.length || 0}/10)
                    </label>
                    <div className="space-y-2">
                      {editingCourse.attachments?.map((attachment) => (
                        <div key={attachment._id} className="flex items-center justify-between bg-gray-100 rounded-lg px-3 py-2">
                          <span className="truncate">{attachment.filename}</span>
                          <button
                            type="button"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => removeAttachment(attachment._id)}
                          >
                            <FiX />
                          </button>
                        </div>
                      ))}
                      {(!editingCourse.attachments || editingCourse.attachments.length < 10) && (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <span className="px-3 py-1 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm">
                            Add Attachment
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleAttachmentChange}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quiz Content Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Quiz Content</h3>
                  <div className="space-y-4">
                    {editingCourse.content
                      ?.filter(item => item.type === "quiz")
                      .map((quiz, quizIndex) => (
                        <div key={quiz._id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">{quiz.title}</h4>
                            <button
                              onClick={() => startQuizEdit(quiz)}
                              className="text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100"
                            >
                              Edit Questions
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setEditingCourse(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Quiz Edit Modal */}
        {editingQuiz && (
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center p-4 z-[1000]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Edit Quiz: {editingQuiz.title}
              </h2>

              <div className="space-y-4">
                {editingQuiz.questions.map((question, qIndex) => (
                  <div key={qIndex} className="border border-gray-200 rounded-lg p-4">
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        value={question.question}
                        onChange={(e) =>
                          updateQuizQuestion(qIndex, "question", e.target.value)
                        }
                      />
                    </div>

                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        value={question.type}
                        onChange={(e) =>
                          updateQuizQuestion(qIndex, "type", e.target.value)
                        }
                      >
                        <option value="mcq-single">Single Choice MCQ</option>
                        <option value="mcq-multiple">Multiple Choice MCQ</option>
                        <option value="short-answer">Short Answer</option>
                        <option value="broad-answer">Broad Answer</option>
                      </select>
                    </div>

                    {(question.type === "mcq-single" || question.type === "mcq-multiple") && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Options
                        </label>
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-2">
                            <input
                              type="text"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...question.options];
                                newOptions[oIndex] = e.target.value;
                                updateQuizQuestion(qIndex, "options", newOptions);
                              }}
                            />
                            <button
                              type="button"
                              className="text-red-500 hover:text-red-700 p-1"
                              onClick={() => {
                                const newOptions = [...question.options];
                                newOptions.splice(oIndex, 1);
                                updateQuizQuestion(qIndex, "options", newOptions);
                              }}
                            >
                              <FiX />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="text-sm text-blue-600 hover:text-blue-800"
                          onClick={() => {
                            const newOptions = [...question.options, ""];
                            updateQuizQuestion(qIndex, "options", newOptions);
                          }}
                        >
                          + Add Option
                        </button>
                      </div>
                    )}

                    {question.type === "mcq-single" && question.options.length > 0 && (
                      <div className="mt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Correct Answer
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          value={question.correctAnswer}
                          onChange={(e) =>
                            updateQuizQuestion(qIndex, "correctAnswer", parseInt(e.target.value))
                          }
                        >
                          {question.options.map((option, oIndex) => (
                            <option key={oIndex} value={oIndex}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {question.type === "mcq-multiple" && question.options.length > 0 && (
                      <div className="mt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Correct Answers
                        </label>
                        <div className="space-y-1">
                          {question.options.map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`q${qIndex}-o${oIndex}`}
                                checked={question.correctAnswer.includes(oIndex)}
                                onChange={(e) => {
                                  const newCorrectAnswers = [...question.correctAnswer];
                                  if (e.target.checked) {
                                    newCorrectAnswers.push(oIndex);
                                  } else {
                                    const index = newCorrectAnswers.indexOf(oIndex);
                                    if (index > -1) {
                                      newCorrectAnswers.splice(index, 1);
                                    }
                                  }
                                  updateQuizQuestion(qIndex, "correctAnswer", newCorrectAnswers);
                                }}
                                className="mr-2"
                              />
                              <label htmlFor={`q${qIndex}-o${oIndex}`}>{option}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(question.type === "short-answer" || question.type === "broad-answer") && (
                      <div className="mt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Guideline Answer
                        </label>
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          rows={question.type === "broad-answer" ? 3 : 1}
                          value={question.answer}
                          onChange={(e) =>
                            updateQuizQuestion(qIndex, "answer", e.target.value)
                          }
                        />
                      </div>
                    )}
                  </div>
                ))}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setEditingQuiz(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveQuizChanges}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseList;