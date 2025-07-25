/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { FiEdit2, FiTrash2, FiUser, FiSearch, FiFilter, FiX, FiPlus, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-hot-toast";
import DOMPurify from 'dompurify';
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FiImage } from "react-icons/fi";
import { FiUpload } from "react-icons/fi";
import { FiYoutube } from "react-icons/fi";


const CourseList = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInstructorDropdown, setShowInstructorDropdown] = useState({});
  const [categories, setCategories] = useState([]);
  const [editingCourse, setEditingCourse] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    thumbnail: null,
    attachments: [],
    content: [],
    price: "",
    categories: [],
    requirements: [],
    whatYouWillLearn: [],
    level: "beginner",
    category: "",
  });
  const [existingThumbnail, setExistingThumbnail] = useState(null);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newRequirement, setNewRequirement] = useState("");
  const [newLearningPoint, setNewLearningPoint] = useState("");

  // React Quill modules configuration
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  };

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "link",
    "image",
  ];

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${base_url}/api/admin/all-category`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setCategories(response.data.data);
    } catch (err) {
      toast.error("Failed to load categories. Please try again later.", {
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

  useEffect(() => {
    fetchCourses();
    fetchTeachers();
    fetchCategories();
  }, []);

  const toggleInstructorDropdown = (courseId) => {
    setShowInstructorDropdown(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

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

  const levelOptions = ["beginner", "intermediate", "advanced"];

  const changeInstructor = async (courseId, newInstructorId) => {
    try {
      if (!courseId || !newInstructorId) {
        toast.error("Both course and teacher selection are required.");
        return;
      }

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
        fetchCourses();
        setShowInstructorDropdown(prev => ({ ...prev, [courseId]: false }));
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

  const deleteCourse = async (courseId) => {
    try {
      await axios.delete(`${base_url}/api/admin/courses/${courseId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchCourses();
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

  const startEdit = (course) => {
    setEditingCourse(course._id);
    
    // Set existing thumbnail and attachments
    if (course.thumbnail) {
      setExistingThumbnail(course.thumbnail);
    }
    if (course.attachments && course.attachments.length > 0) {
      setExistingAttachments(course.attachments);
    }

    // Transform the course data to match our form state
    setCourseData({
      title: course.title,
      description: course.description,
      thumbnail: null,
      attachments: [],
      content: course.content.map(item => {
        if (item.type === 'quiz') {
          return {
            ...item,
            questions: item.questions.map(q => ({
              ...q,
              options: q.options || [],
              correctAnswer: q.correctAnswer || (q.type === 'mcq-multiple' ? [] : 0)
            }))
          };
        }
        return item;
      }),
            type: course.type, // Add type to courseData
      price: course.price,
      categories: course.categories || [],
      requirements: course.requirements || [],
      whatYouWillLearn: course.whatYouWillLearn || [],
      level: course.level || "beginner",
      category: course.category || "",
    });

    // Expand all sections by default
    const expanded = {};
    course.content.forEach(item => {
      expanded[item._id] = true;
    });
    setExpandedSections(expanded);
  };

  const cancelEdit = () => {
    setEditingCourse(null);
    setCourseData({
      title: "",
      description: "",
      thumbnail: null,
      attachments: [],
      content: [],
      price: "",
      categories: [],
      requirements: [],
      whatYouWillLearn: [],
      level: "beginner",
      category: "",
    });
    setExistingThumbnail(null);
    setExistingAttachments([]);
  };

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t._id === teacherId);
    return teacher ? teacher.full_name : "No instructor";
  };

  // Edit form handlers
  const toggleSection = (id) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const addCategory = () => {
    if (newCategory.trim() && !courseData.categories.includes(newCategory.trim())) {
      setCourseData(prev => ({
        ...prev,
        categories: [...prev.categories, newCategory.trim()]
      }));
      setNewCategory("");
    }
  };

  const removeCategory = (index) => {
    setCourseData(prev => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index)
    }));
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setCourseData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement("");
    }
  };

  const removeRequirement = (index) => {
    setCourseData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const addLearningPoint = () => {
    if (newLearningPoint.trim()) {
      setCourseData(prev => ({
        ...prev,
        whatYouWillLearn: [...prev.whatYouWillLearn, newLearningPoint.trim()]
      }));
      setNewLearningPoint("");
    }
  };

  const removeLearningPoint = (index) => {
    setCourseData(prev => ({
      ...prev,
      whatYouWillLearn: prev.whatYouWillLearn.filter((_, i) => i !== index)
    }));
  };

  const addTutorial = (isPremium = false) => {
    const newTutorial = {
      id: Date.now(),
      type: "tutorial",
      title: "",
      description: "",
      content: isPremium ? null : "",
      youtubeLink: !isPremium ? "" : null,
      isPremium: isPremium,
      isExpanded: true,
    };
    setCourseData((prev) => ({
      ...prev,
      content: [...prev.content, newTutorial],
    }));
    setExpandedSections((prev) => ({
      ...prev,
      [newTutorial.id]: true,
    }));
  };

  const addQuiz = () => {
    const newQuiz = {
      id: Date.now(),
      type: "quiz",
      title: "",
      description: "",
      questions: [
        {
          id: Date.now() + 1,
          question: "",
          type: "mcq-single",
          options: ["", ""],
          correctAnswer: 0,
          answer: "",
        },
      ],
      isExpanded: true,
    };
    setCourseData((prev) => ({
      ...prev,
      content: [...prev.content, newQuiz],
    }));
    setExpandedSections((prev) => ({
      ...prev,
      [newQuiz.id]: true,
    }));
  };

  const addLiveClass = () => {
    const newLiveClass = {
      id: Date.now(),
      type: "live",
      title: "",
      description: "",
      thumbnail: null,
      meetingLink: "",
      schedule: new Date().toISOString().slice(0, 16),
      isExpanded: true,
    };
    setCourseData((prev) => ({
      ...prev,
      content: [...prev.content, newLiveClass],
    }));
    setExpandedSections((prev) => ({
      ...prev,
      [newLiveClass.id]: true,
    }));
  };

  const addQuestion = (quizId, questionType = "mcq-single") => {
    const baseQuestion = {
      id: Date.now(),
      question: "",
      type: questionType,
      answer: "",
    };

    let question;
    switch (questionType) {
      case "mcq-single":
      case "mcq-multiple":
        question = {
          ...baseQuestion,
          options: ["", ""],
          correctAnswer: questionType === "mcq-single" ? 0 : [],
        };
        break;
      case "short-answer":
      case "broad-answer":
        question = baseQuestion;
        break;
      default:
        question = baseQuestion;
    }

    setCourseData((prev) => ({
      ...prev,
      content: prev.content.map((item) => {
        if (item.id === quizId || item._id === quizId) {
          return {
            ...item,
            questions: [...(item.questions || []), question],
          };
        }
        return item;
      }),
    }));
  };

  const addOption = (quizId, questionId) => {
    setCourseData((prev) => ({
      ...prev,
      content: prev.content.map((item) => {
        if (item.id === quizId || item._id === quizId) {
          return {
            ...item,
            questions: item.questions.map((q) => {
              if (q.id === questionId || q._id === questionId) {
                return {
                  ...q,
                  options: [...(q.options || []), ""],
                };
              }
              return q;
            }),
          };
        }
        return item;
      }),
    }));
  };

  const removeContentItem = (id) => {
    setCourseData((prev) => ({
      ...prev,
      content: prev.content.filter((item) => item.id !== id && item._id !== id),
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleContentChange = (id, field, value) => {
    setCourseData((prev) => ({
      ...prev,
      content: prev.content.map((item) => {
        if (item.id === id || item._id === id) {
          return { ...item, [field]: value };
        }
        return item;
      }),
    }));
  };

  const handleQuestionChange = (quizId, questionId, field, value) => {
    setCourseData((prev) => ({
      ...prev,
      content: prev.content.map((item) => {
        if (item.id === quizId || item._id === quizId) {
          return {
            ...item,
            questions: item.questions.map((q) => {
              if (q.id === questionId || q._id === questionId) {
                return { ...q, [field]: value };
              }
              return q;
            }),
          };
        }
        return item;
      }),
    }));
  };

  const handleOptionChange = (quizId, questionId, optionIndex, value) => {
    setCourseData((prev) => ({
      ...prev,
      content: prev.content.map((item) => {
        if (item.id === quizId || item._id === quizId) {
          return {
            ...item,
            questions: item.questions.map((q) => {
              if (q.id === questionId || q._id === questionId) {
                const newOptions = [...(q.options || [])];
                newOptions[optionIndex] = value;
                return { ...q, options: newOptions };
              }
              return q;
            }),
          };
        }
        return item;
      }),
    }));
  };

  const handleCorrectAnswerChange = (quizId, questionId, answerIndex) => {
    setCourseData((prev) => ({
      ...prev,
      content: prev.content.map((item) => {
        if (item.id === quizId || item._id === quizId) {
          return {
            ...item,
            questions: item.questions.map((q) => {
              if ((q.id === questionId || q._id === questionId) && q.type === "mcq-single") {
                return { ...q, correctAnswer: answerIndex };
              }
              if ((q.id === questionId || q._id === questionId) && q.type === "mcq-multiple") {
                const currentAnswers = Array.isArray(q.correctAnswer)
                  ? q.correctAnswer
                  : [];
                const newAnswers = currentAnswers.includes(answerIndex)
                  ? currentAnswers.filter((a) => a !== answerIndex)
                  : [...currentAnswers, answerIndex];
                return { ...q, correctAnswer: newAnswers };
              }
              return q;
            }),
          };
        }
        return item;
      }),
    }));
  };

  const handleAnswerChange = (quizId, questionId, value) => {
    setCourseData((prev) => ({
      ...prev,
      content: prev.content.map((item) => {
        if (item.id === quizId || item._id === quizId) {
          return {
            ...item,
            questions: item.questions.map((q) => {
              if (q.id === questionId || q._id === questionId) {
                return { ...q, answer: value };
              }
              return q;
            }),
          };
        }
        return item;
      }),
    }));
  };

  const handleFileUpload = (e, id, field = "content") => {
    const file = e.target.files[0];
    if (file) {
      handleContentChange(id, field, file);
    }
  };

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCourseData((prev) => ({
        ...prev,
        thumbnail: file,
      }));
      setExistingThumbnail(null);
    }
  };

  const handleAttachmentUpload = (e) => {
    const files = Array.from(e.target.files);
    setCourseData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
  };

  const removeAttachment = (index) => {
    setCourseData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const removeExistingAttachment = (index) => {
    setExistingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const removeOption = (quizId, questionId, optionIndex) => {
    setCourseData((prev) => ({
      ...prev,
      content: prev.content.map((item) => {
        if (item.id === quizId || item._id === quizId) {
          return {
            ...item,
            questions: item.questions.map((q) => {
              if (q.id === questionId || q._id === questionId) {
                const newOptions = (q.options || []).filter(
                  (_, i) => i !== optionIndex
                );
                let newCorrectAnswer = q.correctAnswer;

                if (q.type === "mcq-single") {
                  newCorrectAnswer =
                    newCorrectAnswer === optionIndex
                      ? 0
                      : newCorrectAnswer > optionIndex
                          ? newCorrectAnswer - 1
                          : newCorrectAnswer;
                } else if (q.type === "mcq-multiple") {
                  newCorrectAnswer = Array.isArray(newCorrectAnswer)
                    ? newCorrectAnswer
                        .filter((a) => a !== optionIndex)
                        .map((a) => (a > optionIndex ? a - 1 : a))
                    : [];
                }

                return {
                  ...q,
                  options: newOptions,
                  correctAnswer: newCorrectAnswer,
                };
              }
              return q;
            }),
          };
        }
        return item;
      }),
    }));
  };

  const updateCourse = async () => {
    try {
      // Validate required fields
      if (
        !courseData.title ||
        !courseData.description ||
        (!courseData.thumbnail && !existingThumbnail)
      ) {
        throw new Error("Please fill all required fields");
      }

      if (courseData.content.length === 0) {
        throw new Error("Please add at least one content item");
      }

      if (courseData.type === "premium" && !courseData.price) {
        throw new Error("Please set a price for premium courses");
      }

      // Validate content items
      for (const item of courseData.content) {
        if (!item.title) {
          throw new Error(`Please add a title for all content items`);
        }

        if (item.type === "tutorial") {
          if (courseData.type === "free" && !item.youtubeLink) {
            throw new Error(
              `Please add a YouTube link for tutorial "${item.title}"`
            );
          }
          // if (courseData.type === "premium" && !item.content) {
          //   throw new Error(
          //     `Please upload a video for tutorial "${item.title}"`
          //   );
          // }
        }

        if (item.type === "live" && !item.meetingLink) {
          throw new Error(
            `Please add a meeting link for live class "${item.title}"`
          );
        }

        if (item.type === "quiz") {
          if (item.questions.length === 0) {
            throw new Error(
              `Please add at least one question to quiz "${item.title}"`
            );
          }
          for (const question of item.questions) {
            if (!question.question) {
              throw new Error(
                `Please add question text for all questions in quiz "${item.title}"`
              );
            }
            if (["mcq-single", "mcq-multiple"].includes(question.type)) {
              if (question.options.length < 2) {
                throw new Error(
                  `Please add at least 2 options for MCQ questions in quiz "${item.title}"`
                );
              }
              if (
                question.type === "mcq-single" &&
                question.correctAnswer === undefined
              ) {
                throw new Error(
                  `Please select a correct answer for all MCQ questions in quiz "${item.title}"`
                );
              }
              if (
                question.type === "mcq-multiple" &&
                (!Array.isArray(question.correctAnswer) ||
                question.correctAnswer.length === 0)
              ) {
                throw new Error(
                  `Please select at least one correct answer for multiple-choice questions in quiz "${item.title}"`
                );
              }
            }
          }
        }
      }

      // Prepare form data for upload
      const formData = new FormData();
      formData.append("title", courseData.title);
      formData.append("description", courseData.description);
      if (courseData.thumbnail) {
        formData.append("thumbnail", courseData.thumbnail);
      }
      formData.append("type", courseData.type);
      formData.append("price", courseData.type === "premium" ? courseData.price : 0);
      formData.append("content", JSON.stringify(courseData.content));
      formData.append("categories", JSON.stringify(courseData.categories));
      formData.append("requirements", JSON.stringify(courseData.requirements));
      formData.append("whatYouWillLearn", JSON.stringify(courseData.whatYouWillLearn));
      formData.append("level", courseData.level);
      formData.append("status", "draft");
      formData.append("category", courseData.category);

      // Add new attachments
      courseData.attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      // Add content files (videos and thumbnails for premium courses)
      if (courseData.type === "premium") {
        courseData.content.forEach((item) => {
          if (item.type === "tutorial" && item.content) {
            formData.append("contentVideos", item.content);
          }
          if (item.type === "live" && item.thumbnail) {
            formData.append("contentThumbnails", item.thumbnail);
          }
        });
      }

      // Show loading toast
      const loadingToast = toast.loading("Updating course...");

      // Make API call
      const response = await axios.put(`${base_url}/api/admin/courses/${editingCourse}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Success handling
      toast.dismiss(loadingToast);
      toast.success(`Course "${courseData.title}" updated successfully!`);
      fetchCourses();
      cancelEdit();

    } catch (error) {
      toast.dismiss();
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Failed to update course"
      );
      console.error("Update error:", error);
    }
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
              {categories.map((category) => (
                <option key={category._id} value={category.name}>
                  {category.name}
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
              <React.Fragment key={course._id}>
                {editingCourse === course._id ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
                  >
                    {/* Edit Course Form */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">
                          Edit {course.type === "free" ? "Free" : "Premium"} Course
                        </h1>
                        <button
                          onClick={cancelEdit}
                          className="text-gray-500 cursor-pointer hover:text-gray-700"
                        >
                          Cancel
                        </button>
                      </div>

                      {/* Course Basic Info */}
                      <div className="mb-8">
                        <div className="grid grid-cols-1 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Course Title *
                            </label>
                            <input
                              type="text"
                              name="title"
                              value={courseData.title}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-[6px] focus:outline-blue-600 transition-colors"
                              required
                            />
                          </div>
                          <div className="h-[300px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Course Description *
                            </label>
                            <ReactQuill
                              theme="snow"
                              value={courseData.description}
                              onChange={(value) => handleInputChange({ target: { name: "description", value } })}
                              modules={quillModules}
                              formats={quillFormats}
                              className="rounded-lg h-[250px] rounded-[5px]"
                            />
                          </div>

                           {/* Course Basic Info */}
                      <div className="mb-8">
                        <div className="grid grid-cols-1 gap-6">
                          {/* Add Course Type Selector */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Course Type *
                            </label>
                            <select
                              name="type"
                              value={courseData.type}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-500 transition-colors"
                              required
                            >
                              <option value="">Select course type</option>
                              <option value="free">Free</option>
                              <option value="premium">Premium</option>
                            </select>
                          </div>

                          {/* ... (other form fields remain the same) */}

                          {/* Pricing (show only for premium courses) */}
                          {courseData.type === "premium" && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price *
                              </label>
                              <div className="flex items-center">
                                <span className="mr-2 text-gray-700">৳</span>
                                <input
                                  type="number"
                                  name="price"
                                  value={courseData.price}
                                  onChange={handleInputChange}
                                  placeholder="Enter course price"
                                  min="0"
                                  step="0.01"
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-500 transition-colors"
                                  required
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Course Thumbnail *
                            </label>
                            <div className="w-full flex items-center gap-4 bg-gray-50 hover:bg-gray-100 p-3 rounded-lg border border-gray-300 hover:border-blue-500 transition-colors">
                              <label className="cursor-pointer flex items-center w-full gap-4">
                                <FiImage className="text-xl text-gray-600" />
                                <span className="text-md flex-1 text-gray-700">
                                  {courseData.thumbnail
                                    ? courseData.thumbnail.name
                                    : existingThumbnail
                                      ? existingThumbnail.filename
                                      : "Select Thumbnail Image"}
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleThumbnailUpload}
                                  className="hidden"
                                />
                              </label>
                              {(courseData.thumbnail || existingThumbnail) && (
                                <button
                                  onClick={() => {
                                    setCourseData((prev) => ({
                                      ...prev,
                                      thumbnail: null,
                                    }));
                                    setExistingThumbnail(null);
                                  }}
                                  className="text-gray-400 hover:text-red-500 p-3 rounded-full flex items-center justify-center transition-colors"
                                  type="button"
                                >
                                  <FiTrash2 size={20} />
                                </button>
                              )}
                            </div>
                            {courseData.thumbnail && (
                              <div className="mt-2 text-sm text-gray-500">
                                Selected Image: {courseData.thumbnail.name} (
                                {(courseData.thumbnail.size / (1024 * 1024)).toFixed(2)}{" "}
                                MB)
                              </div>
                            )}
                            {existingThumbnail && !courseData.thumbnail && (
                              <div className="mt-2 text-sm text-gray-500">
                                Current Image: {existingThumbnail.filename} (
                                {(existingThumbnail.size / (1024 * 1024)).toFixed(2)}{" "}
                                MB)
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Attachments (PDFs, Docs, etc.)
                            </label>
                            <div className="flex items-center gap-4">
                              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors w-56 flex justify-center items-center border border-gray-300 hover:border-blue-500">
                                <FiUpload className="inline mr-2" />
                                Upload Files
                                <input
                                  type="file"
                                  multiple
                                  onChange={handleAttachmentUpload}
                                  className="hidden"
                                />
                              </label>
                              <div className="flex flex-wrap gap-2 max-h-36 overflow-auto w-full">
                                {existingAttachments.map((file, index) => (
                                  <div
                                    key={index}
                                    className="bg-gray-100 px-3 py-1 rounded-lg text-sm flex items-center max-w-xs border border-gray-200"
                                  >
                                    <span className="truncate max-w-xs">{file.filename}</span>
                                    <button
                                      onClick={() => removeExistingAttachment(index)}
                                      className="ml-2 text-gray-500 hover:text-red-500 transition-colors"
                                    >
                                      <FiTrash2 size={14} />
                                    </button>
                                  </div>
                                ))}
                                {courseData.attachments.map((file, index) => (
                                  <div
                                    key={`new-${index}`}
                                    className="bg-gray-100 px-3 py-1 rounded-lg text-sm flex items-center max-w-xs border border-gray-200"
                                  >
                                    <span className="truncate max-w-xs">{file.name}</span>
                                    <button
                                      onClick={() => removeAttachment(index)}
                                      className="ml-2 text-gray-500 hover:text-red-500 transition-colors"
                                    >
                                      <FiTrash2 size={14} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Category *
                            </label>
                            <select
                              name="category"
                              value={courseData.category}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-500"
                              required
                            >
                              <option value="">Select a category</option>
                              {categories.map((category) => (
                                <option key={category._id} value={category.name}>
                                  {category.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Course Level
                            </label>
                            <select
                              name="level"
                              value={courseData.level}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-500 transition-colors"
                            >
                              <option value="beginner">Beginner</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="advanced">Advanced</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Course Content */}
                      <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-xl font-semibold text-gray-800">
                            Course Content
                          </h2>
                          <div className="flex gap-3">
                            <button
                              onClick={() => addTutorial(course.type === "premium")}
                              className="bg-theme_color text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                            >
                              <FiPlus className="mr-2" />
                              Add Tutorial
                            </button>
                            <button
                              onClick={addQuiz}
                              className="bg-theme_color text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                            >
                              <FiPlus className="mr-2" />
                              Add Quiz
                            </button>
                            <button
                              onClick={addLiveClass}
                              className="bg-theme_color text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                            >
                              <FiPlus className="mr-2" />
                              Add Live Class
                            </button>
                          </div>
                        </div>

                        <div className="space-y-6">
                          {courseData.content.map((item, index) => (
                            <motion.div
                              key={item.id || item._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                              className="border border-gray-200 rounded-lg p-0 relative hover:border-blue-500 transition-colors"
                            >
                              <div
                                className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer rounded-t-lg"
                                onClick={() => toggleSection(item.id || item._id)}
                              >
                                <div className="flex items-center">
                                  <h3 className="font-medium text-gray-800">
                                    {index + 1}.{" "}
                                    {item.type === "tutorial"
                                      ? "Tutorial"
                                      : item.type === "quiz"
                                        ? "Quiz"
                                        : "Live Class"}
                                  </h3>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeContentItem(item.id || item._id);
                                    }}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                  >
                                    <FiTrash2 />
                                  </button>
                                  {expandedSections[item.id || item._id] ? (
                                    <FiChevronUp className="text-gray-500" />
                                  ) : (
                                    <FiChevronDown className="text-gray-500" />
                                  )}
                                </div>
                              </div>
                              {expandedSections[item.id || item._id] && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="p-6"
                                >
                                  {item.type === "tutorial" ? (
                                    <div className="space-y-4">
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Title *
                                        </label>
                                        <input
                                          type="text"
                                          value={item.title}
                                          onChange={(e) =>
                                            handleContentChange(
                                              item.id || item._id,
                                              "title",
                                              e.target.value
                                            )
                                          }
                                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-500 transition-colors"
                                          required
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Description
                                        </label>
                                        <ReactQuill
                                          theme="snow"
                                          value={item.description}
                                          onChange={(value) => handleContentChange(item.id || item._id, "description", value)}
                                          modules={quillModules}
                                          formats={quillFormats}
                                          className="border border-gray-300 rounded-lg hover:border-blue-500 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200"
                                        />
                                      </div>
                                      {course.type === "free" ? (
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            YouTube Video Link *
                                          </label>
                                          <div className="flex items-center">
                                            <FiYoutube className="text-red-500 mr-2 text-xl" />
                                            <input
                                              type="url"
                                              value={item.youtubeLink}
                                              onChange={(e) =>
                                                handleContentChange(
                                                  item.id || item._id,
                                                  "youtubeLink",
                                                  e.target.value
                                                )
                                              }
                                              placeholder="https://www.youtube.com/watch?v=..."
                                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-500 transition-colors"
                                              required
                                            />
                                          </div>
                                        </div>
                                      ) : (
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Upload Video *
                                          </label>
                                          <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors inline-flex items-center border border-gray-300 hover:border-blue-500">
                                            <FiUpload className="mr-2" />
                                            {item.content
                                              ? typeof item.content === 'object' 
                                                ? item.content.name 
                                                : "Video already uploaded"
                                              : "Select Video File"}
                                            <input
                                              type="file"
                                              accept="video/*"
                                              onChange={(e) =>
                                                handleFileUpload(e, item.id || item._id)
                                              }
                                              className="hidden"
                                            />
                                          </label>
                                          {item.content && typeof item.content === 'object' && (
                                            <div className="mt-2 text-sm text-gray-500">
                                              Selected: {item.content.name} (
                                              {(
                                                item.content.size /
                                                (1024 * 1024)
                                              ).toFixed(2)}{" "}
                                              MB)
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ) : item.type === "live" ? (
                                    <div className="space-y-4">
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Title *
                                        </label>
                                        <input
                                          type="text"
                                          value={item.title}
                                          onChange={(e) =>
                                            handleContentChange(
                                              item.id || item._id,
                                              "title",
                                              e.target.value
                                            )
                                          }
                                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-500 transition-colors"
                                          required
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Description
                                        </label>
                                        <ReactQuill
                                          theme="snow"
                                          value={item.description}
                                          onChange={(value) => handleContentChange(item.id || item._id, "description", value)}
                                          modules={quillModules}
                                          formats={quillFormats}
                                          className="border border-gray-300 rounded-lg hover:border-blue-500 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Thumbnail Image
                                        </label>
                                        <div className="w-full flex items-center gap-4 bg-gray-50 hover:bg-gray-100 p-3 rounded-lg border border-gray-300 hover:border-blue-500 transition-colors">
                                          <label className="cursor-pointer flex items-center w-full gap-4">
                                            <FiImage className="text-md text-gray-600" />
                                            <span className="text-md flex-1 text-gray-700">
                                              {item.thumbnail
                                                ? typeof item.thumbnail === 'object'
                                                  ? item.thumbnail.name
                                                  : "Thumbnail already uploaded"
                                                : "Select Thumbnail Image"}
                                            </span>
                                            <input
                                              type="file"
                                              accept="image/*"
                                              onChange={(e) =>
                                                handleFileUpload(e, item.id || item._id, "thumbnail")
                                              }
                                              className="hidden"
                                            />
                                          </label>
                                          {item.thumbnail && (
                                            <button
                                              onClick={() =>
                                                handleContentChange(
                                                  item.id || item._id,
                                                  "thumbnail",
                                                  null
                                                )
                                              }
                                              className="text-gray-400 hover:text-red-500 p-3 rounded-full flex items-center justify-center transition-colors"
                                              type="button"
                                            >
                                              <FiTrash2 size={20} />
                                            </button>
                                          )}
                                        </div>
                                        {item.thumbnail && typeof item.thumbnail === 'object' && (
                                          <div className="mt-2 text-sm text-gray-500">
                                            Selected Image: {item.thumbnail.name} (
                                            {(
                                              item.thumbnail.size /
                                              (1024 * 1024)
                                            ).toFixed(2)}{" "}
                                            MB)
                                          </div>
                                        )}
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Meeting Link (Zoom/Google Meet)
                                        </label>
                                        <input
                                          type="url"
                                          value={item.meetingLink}
                                          onChange={(e) =>
                                            handleContentChange(
                                              item.id || item._id,
                                              "meetingLink",
                                              e.target.value
                                            )
                                          }
                                          placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-500 transition-colors"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Schedule *
                                        </label>
                                        <input
                                          type="datetime-local"
                                          value={item.schedule}
                                          onChange={(e) =>
                                            handleContentChange(
                                              item.id || item._id,
                                              "schedule",
                                              e.target.value
                                            )
                                          }
                                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-500 transition-colors"
                                          required
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="space-y-4">
                                      <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-medium text-gray-800 mb-2">
                                          Quiz Title *
                                        </h4>
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Quiz Title *
                                        </label>
                                        <input
                                          type="text"
                                          value={item.title}
                                          onChange={(e) =>
                                            handleContentChange(
                                              item.id || item._id,
                                              "title",
                                              e.target.value
                                            )
                                          }
                                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-500 transition-colors"
                                          required
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Description
                                        </label>
                                        <ReactQuill
                                          theme="snow"
                                          value={item.description}
                                          onChange={(value) => handleContentChange(item.id || item._id, "description", value)}
                                          modules={quillModules}
                                          formats={quillFormats}
                                          className="border border-gray-300 rounded-lg hover:border-blue-500 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200"
                                        />
                                      </div>

                                      <div className="space-y-6">
                                        {item.questions.map((question, qIndex) => (
                                          <div
                                            key={question.id || question._id}
                                            className="border-l-4 border-blue-500 pl-4"
                                          >
                                            <div className="flex justify-between items-start mb-2">
                                              <h4 className="font-medium text-gray-800 mb-2">
                                                Question {qIndex + 1}
                                              </h4>
                                              <div className="flex gap-2">
                                                <select
                                                  value={question.type}
                                                  onChange={(e) =>
                                                    handleQuestionChange(
                                                      item.id || item._id,
                                                      question.id || question._id,
                                                      "type",
                                                      e.target.value
                                                    )
                                                  }
                                                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-500 transition-colors"
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
                                                <button
                                                  onClick={() => {
                                                    setCourseData((prev) => ({
                                                      ...prev,
                                                      content: prev.content.map(
                                                        (contentItem) => {
                                                          if (
                                                            contentItem.id === item.id || contentItem._id === item._id
                                                          ) {
                                                            return {
                                                              ...contentItem,
                                                              questions:
                                                                contentItem.questions.filter(
                                                                  (q) =>
                                                                    q.id !== (question.id || question._id)
                                                                ),
                                                            };
                                                          }
                                                          return contentItem;
                                                        }
                                                      ),
                                                    }));
                                                  }}
                                                  className="text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                  <FiTrash2 size={14} />
                                                </button>
                                              </div>
                                            </div>
                                            <div className="mb-3">
                                              <input
                                                type="text"
                                                value={question.question}
                                                onChange={(e) =>
                                                  handleQuestionChange(
                                                    item.id || item._id,
                                                    question.id || question._id,
                                                    "question",
                                                    e.target.value
                                                  )
                                                }
                                                placeholder="Enter question"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-500 transition-colors"
                                                required
                                              />
                                            </div>

                                            {["mcq-single", "mcq-multiple"].includes(
                                              question.type
                                            ) ? (
                                              <div className="space-y-2">
                                                {question.options.map(
                                                  (option, oIndex) => (
                                                    <div
                                                      key={oIndex}
                                                      className={`flex items-center gap-2 p-2 rounded-lg ${(question.type === "mcq-single" &&
                                                          question.correctAnswer ===
                                                          oIndex) ||
                                                          (question.type ===
                                                            "mcq-multiple" &&
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
                                                        name={`correct-${question.id || question._id}`}
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
                                                        onChange={() =>
                                                          handleCorrectAnswerChange(
                                                            item.id || item._id,
                                                            question.id || question._id,
                                                            oIndex
                                                          )
                                                        }
                                                        className={`focus:ring-green-500 h-4 w-4 ${question.type === "mcq-single"
                                                            ? "text-green-600"
                                                            : "text-green-600"
                                                          }`}
                                                      />
                                                      <input
                                                        type="text"
                                                        value={option}
                                                        onChange={(e) =>
                                                          handleOptionChange(
                                                            item.id || item._id,
                                                            question.id || question._id,
                                                            oIndex,
                                                            e.target.value
                                                          )
                                                        }
                                                        className="flex-1 px-3 py-1 border-none focus:ring-0 bg-transparent"
                                                        placeholder={`Option ${oIndex + 1
                                                          }`}
                                                        required
                                                      />
                                                      {question.options.length > 2 && (
                                                        <button
                                                          onClick={() =>
                                                            removeOption(
                                                              item.id || item._id,
                                                              question.id || question._id,
                                                              oIndex
                                                            )
                                                          }
                                                          className="text-gray-400 hover:text-red-500 transition-colors"
                                                        >
                                                          <FiTrash2 size={14} />
                                                        </button>
                                                      )}
                                                    </div>
                                                  )
                                                )}
                                                <div className="flex justify-end">
                                                  <button
                                                    onClick={() =>
                                                      addOption(item.id || item._id, question.id || question._id)
                                                    }
                                                    className="text-green-600 hover:text-green-800 flex items-center text-sm mt-2 bg-green-50 hover:bg-green-100 px-3 py-1 rounded border border-green-200 transition-colors"
                                                  >
                                                    <FiPlus className="mr-1" /> Add Option
                                                  </button>
                                                </div>
                                              </div>
                                            ) : question.type === "short-answer" ? (
                                              <div className="mt-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                  Answer
                                                </label>
                                                <input
                                                  type="text"
                                                  value={question.answer}
                                                  onChange={(e) =>
                                                    handleAnswerChange(
                                                      item.id || item._id,
                                                      question.id || question._id,
                                                      e.target.value
                                                    )
                                                  }
                                                  placeholder="Enter expected short answer"
                                                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${question.answer
                                                    ? "border-green-500 bg-green-50"
                                                    : "border-gray-300"
                                                    }`}
                                                />
                                              </div>
                                            ) : (
                                              <div className="mt-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                  Answer
                                                </label>
                                                <div
                                                  className={`border rounded-lg ${question.answer
                                                    ? "border-green-500 bg-green-50"
                                                    : "border-gray-300"
                                                    }`}
                                                >
                                                  <ReactQuill
                                                    theme="snow"
                                                    value={question.answer}
                                                    onChange={(value) => handleAnswerChange(item.id || item._id, question.id || question._id, value)}
                                                    modules={quillModules}
                                                    formats={quillFormats}
                                                  />
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                        <div className="flex flex-wrap gap-2">
                                          <button
                                            onClick={() =>
                                              addQuestion(item.id || item._id, "mcq-single")
                                            }
                                            className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded text-sm flex items-center border border-green-200 transition-colors"
                                          >
                                            <FiPlus className="mr-1" /> Single Choice
                                          </button>
                                          <button
                                            onClick={() =>
                                              addQuestion(item.id || item._id, "mcq-multiple")
                                            }
                                            className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded text-sm flex items-center border border-green-200 transition-colors"
                                          >
                                            <FiPlus className="mr-1" /> Multiple Choice
                                          </button>
                                          <button
                                            onClick={() =>
                                              addQuestion(item.id || item._id, "short-answer")
                                            }
                                            className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded text-sm flex items-center border border-green-200 transition-colors"
                                          >
                                            <FiPlus className="mr-1" /> Short Answer
                                          </button>
                                          <button
                                            onClick={() =>
                                              addQuestion(item.id || item._id, "broad-answer")
                                            }
                                            className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded text-sm flex items-center border border-green-200 transition-colors"
                                          >
                                            <FiPlus className="mr-1" /> Broad Answer
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Pricing (for premium courses) */}
                      {course.type === "premium" && (
                        <div className="mb-8">
                          <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Pricing
                          </h2>
                          <div className="flex items-center">
                            <span className="mr-2 text-gray-700">$</span>
                            <input
                              type="number"
                              name="price"
                              value={courseData.price}
                              onChange={handleInputChange}
                              placeholder="Enter course price"
                              min="0"
                              step="0.01"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-500 transition-colors"
                              required
                            />
                          </div>
                        </div>
                      )}

                      {/* Publish Button */}
                      <div className="flex justify-end gap-4">
                        <button
                          onClick={cancelEdit}
                          className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg text-lg font-medium transition-colors shadow-md hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={updateCourse}
                          className="bg-theme_color text-white px-6 py-3 rounded-lg text-lg font-medium transition-colors shadow-md"
                        >
                          Update Course
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
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
                            {/* Instructor Dropdown */}
                            {/* <div className="relative">
                              <div className="flex items-center">
                                <FiUser className="text-gray-500 mr-2" />
                                <button
                                  onClick={() => toggleInstructorDropdown(course._id)}
                                  className="flex items-center gap-1 border border-gray-300 rounded-lg px-3 py-1 text-sm focus:border-gray-500"
                                >
                                  {getTeacherName(course.instructor?._id)}
                                  <FiChevronDown className={`transition-transform ${showInstructorDropdown[course._id] ? 'transform rotate-180' : ''}`} />
                                </button>
                              </div>
                              
                              {showInstructorDropdown[course._id] && (
                                <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                                  {teachers.map((teacher) => (
                                    <div
                                      key={teacher._id}
                                      className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${course.instructor?._id === teacher._id ? 'bg-gray-100 font-medium' : ''}`}
                                      onClick={() => {
                                        changeInstructor(course._id, teacher._id);
                                      }}
                                    >
                                      {teacher.full_name}
                                    </div>
                                  ))}
                                  <div
                                    className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
                                    onClick={() => {
                                      changeInstructor(course._id, null);
                                    }}
                                  >
                                    Remove Instructor
                                  </div>
                                </div>
                              )}
                            </div> */}
{/* Instructor Dropdown */}
<div className="relative">
  <div className="flex items-center">
    <FiUser className="text-gray-500 mr-2" />
    <button
      onClick={() => toggleInstructorDropdown(course._id)}
      className="flex items-center gap-1 border border-gray-300 rounded-lg px-3 py-1 text-sm focus:border-gray-500"
    >
      {getTeacherName(course.instructor)}
      <FiChevronDown className={`transition-transform ${showInstructorDropdown[course._id] ? 'transform rotate-180' : ''}`} />
    </button>
  </div>
  
  {showInstructorDropdown[course._id] && (
    <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
      {teachers.map((teacher) => (
        <div
          key={teacher._id}
          className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
            course.instructor=== teacher._id ? 'bg-gray-100 font-medium' : ''
          }`}
          onClick={() => {
            changeInstructor(course._id, teacher._id);
          }}
        >
          {teacher.full_name}
          {course.instructor?._id === teacher._id && (
            <span className="ml-2 text-green-500">✓</span>
          )}
        </div>
      ))}
      <div
        className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
          !course.instructor?._id ? 'bg-gray-100 font-medium' : ''
        }`}
        onClick={() => {
          changeInstructor(course._id, null);
        }}
      >
        Remove Instructor
        {!course.instructor?._id && (
          <span className="ml-2 text-green-500">✓</span>
        )}
      </div>
    </div>
  )}
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
                )}
              </React.Fragment>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseList;