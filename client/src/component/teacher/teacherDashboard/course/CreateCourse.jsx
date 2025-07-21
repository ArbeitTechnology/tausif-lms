/* eslint-disable no-unused-vars */
import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { FiPlus,FiTrash2,FiYoutube,FiUpload,FiDollarSign,FiImage,FiVideo,FiChevronDown,FiChevronUp,} from "react-icons/fi";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import Sidebar from "../sidebar";
import Theader from "../common/Theader";

const CreateCourse = () => {
    const base_url = import.meta.env.VITE_API_KEY_Base_URL;
    const [courseType, setCourseType] = useState(null);
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
    });
    const [expandedSections, setExpandedSections] = useState({});
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

    // Toggle section expansion
    const toggleSection = (id) => {
        setExpandedSections((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const [activeView, setActiveView] = useState("dashboard");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Toggle sidebar function
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Add a new category
    const addCategory = () => {
        if (newCategory.trim() && !courseData.categories.includes(newCategory.trim())) {
            setCourseData(prev => ({
                ...prev,
                categories: [...prev.categories, newCategory.trim()]
            }));
            setNewCategory("");
        }
    };

    // Remove a category
    const removeCategory = (index) => {
        setCourseData(prev => ({
            ...prev,
            categories: prev.categories.filter((_, i) => i !== index)
        }));
    };

    // Add a new requirement
    const addRequirement = () => {
        if (newRequirement.trim()) {
            setCourseData(prev => ({
                ...prev,
                requirements: [...prev.requirements, newRequirement.trim()]
            }));
            setNewRequirement("");
        }
    };

    // Remove a requirement
    const removeRequirement = (index) => {
        setCourseData(prev => ({
            ...prev,
            requirements: prev.requirements.filter((_, i) => i !== index)
        }));
    };

    // Add a new learning point
    const addLearningPoint = () => {
        if (newLearningPoint.trim()) {
            setCourseData(prev => ({
                ...prev,
                whatYouWillLearn: [...prev.whatYouWillLearn, newLearningPoint.trim()]
            }));
            setNewLearningPoint("");
        }
    };

    // Remove a learning point
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
                if (item.id === quizId) {
                    return {
                        ...item,
                        questions: [...item.questions, question],
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
                if (item.id === quizId) {
                    return {
                        ...item,
                        questions: item.questions.map((q) => {
                            if (q.id === questionId) {
                                return {
                                    ...q,
                                    options: [...q.options, ""],
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
            content: prev.content.filter((item) => item.id !== id),
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
                if (item.id === id) {
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
                if (item.id === quizId) {
                    return {
                        ...item,
                        questions: item.questions.map((q) => {
                            if (q.id === questionId) {
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
                if (item.id === quizId) {
                    return {
                        ...item,
                        questions: item.questions.map((q) => {
                            if (q.id === questionId) {
                                const newOptions = [...q.options];
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
                if (item.id === quizId) {
                    return {
                        ...item,
                        questions: item.questions.map((q) => {
                            if (q.id === questionId && q.type === "mcq-single") {
                                return { ...q, correctAnswer: answerIndex };
                            }
                            if (q.id === questionId && q.type === "mcq-multiple") {
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
                if (item.id === quizId) {
                    return {
                        ...item,
                        questions: item.questions.map((q) => {
                            if (q.id === questionId) {
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

    const removeOption = (quizId, questionId, optionIndex) => {
        setCourseData((prev) => ({
            ...prev,
            content: prev.content.map((item) => {
                if (item.id === quizId) {
                    return {
                        ...item,
                        questions: item.questions.map((q) => {
                            if (q.id === questionId) {
                                const newOptions = q.options.filter(
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

    const publishCourse = async () => {
        try {
            // Validate required fields
            if (
                !courseData.title ||
                !courseData.description ||
                !courseData.thumbnail
            ) {
                throw new Error("Please fill all required fields");
            }

            if (courseData.content.length === 0) {
                throw new Error("Please add at least one content item");
            }

            if (courseType === "premium" && !courseData.price) {
                throw new Error("Please set a price for premium courses");
            }

            // Validate content items
            for (const item of courseData.content) {
                if (!item.title) {
                    throw new Error(`Please add a title for all content items`);
                }

                if (item.type === "tutorial") {
                    if (courseType === "free" && !item.youtubeLink) {
                        throw new Error(
                            `Please add a YouTube link for tutorial "${item.title}"`
                        );
                    }
                    if (courseType === "premium" && !item.content) {
                        throw new Error(
                            `Please upload a video for tutorial "${item.title}"`
                        );
                    }
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
            const teacherdata = JSON.parse(localStorage.getItem("teacherData"))
            const formData = new FormData();
            formData.append("title", courseData.title);
            formData.append("description", courseData.description);
            formData.append("thumbnail", courseData.thumbnail);
            formData.append("type", courseType);
            formData.append("price", courseType === "premium" ? courseData.price : 0);
            formData.append("content", JSON.stringify(courseData.content));
            formData.append("categories", JSON.stringify(courseData.categories));
            formData.append("requirements", JSON.stringify(courseData.requirements));
            formData.append("whatYouWillLearn", JSON.stringify(courseData.whatYouWillLearn));
            formData.append("level", courseData.level);
            formData.append("status", "draft");
            formData.append("user_id", teacherdata._id);

            // Add attachments
            courseData.attachments.forEach((file) => {
                formData.append("attachments", file);
            });

            // Add content files (videos and thumbnails for premium courses)
            if (courseType === "premium") {
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
            const loadingToast = toast.loading("Publishing course...");

            // Make API call
            const response = await axios.post(`${base_url}/api/teacher/create-course`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${localStorage.getItem("teacherToken")}`,
                },
            });

            // Success handling
            toast.dismiss(loadingToast);
            toast.success(`Course "${courseData.title}" published successfully!`);

            // Reset form
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
            });
            setCourseType(null);
            setExpandedSections({});
        } catch (error) {
            toast.dismiss();
            toast.error(
                error.response?.data?.message ||
                error.message ||
                "Failed to publish course"
            );
            console.error("Publish error:", error);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
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
                        className="min-h-screen p-6"
                    >
                        <div className="max-w-full mx-auto">
                            {!courseType ? (
                            <div className="flex flex-col items-center justify-center h-[70vh]">
  <motion.h1 
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="text-3xl font-bold text-gray-800 mb-8"
  >
    Create New Course
  </motion.h1>
  
  <div className="flex gap-6">
    {/* Free Course Button */}
    <motion.button
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      whileHover={{ 
        scale: 1.05,
        boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)"
      }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setCourseType("free")}
      className="bg-white p-8 rounded-xl shadow-md border cursor-pointer border-gray-200 hover:border-blue-500 transition-all flex flex-col items-center w-64 relative overflow-hidden group"
    >
      {/* Background animation element */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <motion.div 
        whileHover={{ rotate: 10 }}
        className="bg-blue-100 p-4 rounded-full mb-4 z-10"
      >
        <FiYoutube className="text-blue-600 text-2xl" />
      </motion.div>
      
      <h2 className="text-xl font-semibold text-gray-800 mb-2 z-10">
        Free Course
      </h2>
      
      <p className="text-gray-600 text-center z-10">
        Create course with YouTube video links
      </p>
      
      {/* Ripple effect on hover */}
      <span className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-300 group-hover:animate-ping-once pointer-events-none"></span>
    </motion.button>

    {/* Premium Course Button */}
    <motion.button
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      whileHover={{ 
        scale: 1.05,
        boxShadow: "0 10px 25px -5px rgba(168, 85, 247, 0.4)"
      }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setCourseType("premium")}
      className="bg-white p-8 rounded-xl shadow-md border cursor-pointer border-gray-200 hover:border-purple-500 transition-all flex flex-col items-center w-64 relative overflow-hidden group"
    >
      {/* Background animation element */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50  to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <motion.div 
        whileHover={{ rotate: 10 }}
        className="bg-purple-100 p-4 rounded-full mb-4 z-10 "
      >
        <FiDollarSign className="text-purple-600 text-2xl" />
      </motion.div>
      
      <h2 className="text-xl font-semibold text-gray-800 mb-2 z-10">
        Premium Course
      </h2>
      
      <p className="text-gray-600 text-center z-10">
        Upload videos and charge for access
      </p>
      
      {/* Ripple effect on hover */}
      <span className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-purple-300 group-hover:animate-ping-once pointer-events-none"></span>
    </motion.button>
  </div>
</div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h1 className="text-2xl font-bold text-gray-800">
                                            Create {courseType === "free" ? "Free" : "Premium"} Course
                                        </h1>
                                        <button
                                            onClick={() => {
                                                setCourseType(null);
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
                                                });
                                            }}
                                            className="text-gray-500 cursor-pointer hover:text-gray-700"
                                        >
                                            Back to selection
                                        </button>
                                    </div>

                                    {/* Course Basic Info */}
                                    <div className="mb-8">
                                        {/* <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                            Course Information
                                        </h2> */}
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
                                                    className=" rounded-lg h-[250px] rounded-[5px]"
                                                />
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
                                                                : "Select Thumbnail Image"}
                                                        </span>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleThumbnailUpload}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                    {courseData.thumbnail && (
                                                        <button
                                                            onClick={() =>
                                                                setCourseData((prev) => ({
                                                                    ...prev,
                                                                    thumbnail: null,
                                                                }))
                                                            }
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
                                                        {courseData.attachments.map((file, index) => (
                                                            <div
                                                                key={index}
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
                                                    Categories
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={newCategory}
                                                        onChange={(e) => setNewCategory(e.target.value)}
                                                        placeholder="Add a category"
                                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-500 transition-colors"
                                                    />
                                                    <button
                                                        onClick={addCategory}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {courseData.categories.map((category, index) => (
                                                        <div
                                                            key={index}
                                                            className="bg-blue-100 px-3 py-1 rounded-full text-sm flex items-center border border-blue-200"
                                                        >
                                                            {category}
                                                            <button
                                                                onClick={() => removeCategory(index)}
                                                                className="ml-2 text-blue-500 hover:text-red-500 transition-colors"
                                                            >
                                                                <FiTrash2 size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Requirements
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={newRequirement}
                                                        onChange={(e) => setNewRequirement(e.target.value)}
                                                        placeholder="Add a requirement"
                                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-500 transition-colors"
                                                    />
                                                    <button
                                                        onClick={addRequirement}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                                    {courseData.requirements.map((req, index) => (
                                                        <li key={index} className="flex justify-between items-center">
                                                            <span>{req}</span>
                                                            <button
                                                                onClick={() => removeRequirement(index)}
                                                                className="text-gray-500 hover:text-red-500 ml-2 transition-colors"
                                                            >
                                                                <FiTrash2 size={14} />
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    What Students Will Learn
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={newLearningPoint}
                                                        onChange={(e) => setNewLearningPoint(e.target.value)}
                                                        placeholder="Add a learning point"
                                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-500 transition-colors"
                                                    />
                                                    <button
                                                        onClick={addLearningPoint}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                                    {courseData.whatYouWillLearn.map((point, index) => (
                                                        <li key={index} className="flex justify-between items-center">
                                                            <span>{point}</span>
                                                            <button
                                                                onClick={() => removeLearningPoint(index)}
                                                                className="text-gray-500 hover:text-red-500 ml-2 transition-colors"
                                                            >
                                                                <FiTrash2 size={14} />
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
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
                                                    onClick={() => addTutorial(courseType === "premium")}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                                                >
                                                    <FiPlus className="mr-2" />
                                                    Add Tutorial
                                                </button>
                                                <button
                                                    onClick={addQuiz}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                                                >
                                                    <FiPlus className="mr-2" />
                                                    Add Quiz
                                                </button>
                                                <button
                                                    onClick={addLiveClass}
                                                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                                                >
                                                    <FiPlus className="mr-2" />
                                                    Add Live Class
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            {courseData.content.map((item, index) => (
                                                <motion.div
                                                    key={item.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="border border-gray-200 rounded-lg p-0 relative hover:border-blue-500 transition-colors"
                                                >
                                                    <div
                                                        className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer rounded-t-lg"
                                                        onClick={() => toggleSection(item.id)}
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
                                                                    removeContentItem(item.id);
                                                                }}
                                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <FiTrash2 />
                                                            </button>
                                                            {expandedSections[item.id] ? (
                                                                <FiChevronUp className="text-gray-500" />
                                                            ) : (
                                                                <FiChevronDown className="text-gray-500" />
                                                            )}
                                                        </div>
                                                    </div>
                                                    {expandedSections[item.id] && (
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
                                                                                    item.id,
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
                                                                            onChange={(value) => handleContentChange(item.id, "description", value)}
                                                                            modules={quillModules}
                                                                            formats={quillFormats}
                                                                            className="border border-gray-300 rounded-lg hover:border-blue-500 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200"
                                                                        />
                                                                    </div>
                                                                    {courseType === "free" ? (
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
                                                                                            item.id,
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
                                                                                    ? item.content.name
                                                                                    : "Select Video File"}
                                                                                <input
                                                                                    type="file"
                                                                                    accept="video/*"
                                                                                    onChange={(e) =>
                                                                                        handleFileUpload(e, item.id)
                                                                                    }
                                                                                    className="hidden"
                                                                                />
                                                                            </label>
                                                                            {item.content && (
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
                                                                                    item.id,
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
                                                                            onChange={(value) => handleContentChange(item.id, "description", value)}
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
                                                                                        ? item.thumbnail.name
                                                                                        : "Select Thumbnail Image"}
                                                                                </span>
                                                                                <input
                                                                                    type="file"
                                                                                    accept="image/*"
                                                                                    onChange={(e) =>
                                                                                        handleFileUpload(e, item.id, "thumbnail")
                                                                                    }
                                                                                    className="hidden"
                                                                                />
                                                                            </label>
                                                                            {item.thumbnail && (
                                                                                <button
                                                                                    onClick={() =>
                                                                                        handleContentChange(
                                                                                            item.id,
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
                                                                        {item.thumbnail && (
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
                                                                                    item.id,
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
                                                                                    item.id,
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
                                                                    <div className="flex justify-between items-center"></div>
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                            Quiz Title *
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            value={item.title}
                                                                            onChange={(e) =>
                                                                                handleContentChange(
                                                                                    item.id,
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
                                                                            onChange={(value) => handleContentChange(item.id, "description", value)}
                                                                            modules={quillModules}
                                                                            formats={quillFormats}
                                                                            className="border border-gray-300 rounded-lg hover:border-blue-500 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200"
                                                                        />
                                                                    </div>

                                                                    <div className="space-y-6">
                                                                        {item.questions.map((question, qIndex) => (
                                                                            <div
                                                                                key={question.id}
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
                                                                                                    item.id,
                                                                                                    question.id,
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
                                                                                                                contentItem.id === item.id
                                                                                                            ) {
                                                                                                                return {
                                                                                                                    ...contentItem,
                                                                                                                    questions:
                                                                                                                        contentItem.questions.filter(
                                                                                                                            (q) =>
                                                                                                                                q.id !== question.id
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
                                                                                                item.id,
                                                                                                question.id,
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
                                                                                                        name={`correct-${question.id}`}
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
                                                                                                                item.id,
                                                                                                                question.id,
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
                                                                                                                item.id,
                                                                                                                question.id,
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
                                                                                                                    item.id,
                                                                                                                    question.id,
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
                                                                                                    addOption(item.id, question.id)
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
                                                                                                    item.id,
                                                                                                    question.id,
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
                                                                                                onChange={(value) => handleAnswerChange(item.id, question.id, value)}
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
                                                                                    addQuestion(item.id, "mcq-single")
                                                                                }
                                                                                className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded text-sm flex items-center border border-green-200 transition-colors"
                                                                            >
                                                                                <FiPlus className="mr-1" /> Single Choice
                                                                            </button>
                                                                            <button
                                                                                onClick={() =>
                                                                                    addQuestion(item.id, "mcq-multiple")
                                                                                }
                                                                                className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded text-sm flex items-center border border-green-200 transition-colors"
                                                                            >
                                                                                <FiPlus className="mr-1" /> Multiple Choice
                                                                            </button>
                                                                            <button
                                                                                onClick={() =>
                                                                                    addQuestion(item.id, "short-answer")
                                                                                }
                                                                                className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded text-sm flex items-center border border-green-200 transition-colors"
                                                                            >
                                                                                <FiPlus className="mr-1" /> Short Answer
                                                                            </button>
                                                                            <button
                                                                                onClick={() =>
                                                                                    addQuestion(item.id, "broad-answer")
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
                                    {courseType === "premium" && (
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
                                    <div className="flex justify-end">
                                        <button
                                            onClick={publishCourse}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-medium transition-colors shadow-md"
                                        >
                                            Publish Course
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
            <Toaster position="top-right" />
        </div>
    );
};

export default CreateCourse;