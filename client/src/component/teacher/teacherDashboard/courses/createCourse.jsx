/* eslint-disable no-unused-vars */
import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  FiPlus,
  FiTrash2,
  FiYoutube,
  FiUpload,
  FiDollarSign,
  FiImage,
  FiVideo,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { Editor } from "@toast-ui/react-editor";
import "@toast-ui/editor/dist/toastui-editor.css";
import colorSyntax from "@toast-ui/editor-plugin-color-syntax";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

const CourseCreator = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [courseType, setCourseType] = useState(null);
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    thumbnail: null,
    attachments: [],
    content: [],
    price: "",
  });
  const [expandedSections, setExpandedSections] = useState({});

  const editorRefs = useRef({});

  // Toggle section expansion
  const toggleSection = (id) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
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
      isExpanded: true, // New tutorials are expanded by default
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
      isExpanded: true, // New quizzes are expanded by default
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
      isExpanded: true, // New live classes are expanded by default
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
      const formData = new FormData();
      formData.append("title", courseData.title);
      formData.append("description", courseData.description);
      formData.append("thumbnail", courseData.thumbnail);
      formData.append("type", courseType);
      formData.append("price", courseType === "premium" ? courseData.price : 0);
      formData.append("content", JSON.stringify(courseData.content));
      formData.append("level", "beginner"); // Default level
      formData.append("status", "draft"); // Default status
      formData.append("user_id", "Admin");

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
      const response = await axios.post(`${base_url}/api/courses`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen p-6"
    >
      <div className="max-w-full mx-auto">
        {!courseType ? (
          <div className="flex flex-col items-center justify-center h-[70vh]">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">
              Create New Course
            </h1>
            <div className="flex gap-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCourseType("free")}
                className="bg-white p-8 rounded-xl shadow-md border border-gray-200 hover:border-gray-500 transition-all flex flex-col items-center w-64"
              >
                <div className="bg-gray-100 p-4 rounded-full mb-4">
                  <FiYoutube className="text-gray-600 text-2xl" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Free Course
                </h2>
                <p className="text-gray-600 text-center">
                  Create course with YouTube video links
                </p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCourseType("premium")}
                className="bg-white p-8 rounded-xl shadow-md border border-gray-200 hover:border-gray-500 transition-all flex flex-col items-center w-64"
              >
                <div className="bg-gray-100 p-4 rounded-full mb-4">
                  <FiDollarSign className="text-gray-600 text-2xl" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Premium Course
                </h2>
                <p className="text-gray-600 text-center">
                  Upload videos and charge for access
                </p>
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
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                Back to selection
              </button>
            </div>

            {/* Course Basic Info */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Course Information
              </h2>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Description *
                  </label>
                  <Editor
                    initialValue={courseData.description}
                    previewStyle="vertical"
                    height="200px"
                    initialEditType="wysiwyg"
                    useCommandShortcut={true}
                    plugins={[colorSyntax]}
                    ref={(el) => (editorRefs.current["main"] = el)}
                    onChange={() => {
                      const markdown = editorRefs.current["main"]
                        ?.getInstance()
                        .getMarkdown();
                      handleInputChange({
                        target: { name: "description", value: markdown },
                      });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Thumbnail *
                  </label>
                  {/* Added flex container for thumbnail and remove button */}
                  <div className="w-full flex items-center gap-4 bg-gray-100 hover:bg-gray-200 p-3 rounded-lg">
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

                    {/* Remove button, appears only when thumbnail exists */}
                    {courseData.thumbnail && (
                      <button
                        onClick={() =>
                          setCourseData((prev) => ({
                            ...prev,
                            thumbnail: null,
                          }))
                        }
                        className="text-gray-400 hover:text-red-500 p-3 rounded-full flex items-center justify-center"
                        type="button"
                      >
                        <FiTrash2 size={20} />
                      </button>
                    )}
                  </div>

                  {/* Existing file info display remains unchanged */}
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
                    {/* Upload button with fixed size */}
                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors w-56 flex justify-center items-center">
                      <FiUpload className="inline mr-2" />
                      Upload Files
                      <input
                        type="file"
                        multiple
                        onChange={handleAttachmentUpload}
                        className="hidden"
                      />
                    </label>

                    {/* Container for file names with overflow handling */}
                    <div className="flex flex-wrap gap-2 max-h-36 overflow-auto w-full">
                      {courseData.attachments.map((file, index) => (
                        <div
                          key={index}
                          className="bg-gray-100 px-3 py-1 rounded-lg text-sm flex items-center max-w-xs"
                        >
                          <span className="truncate max-w-xs">{file.name}</span>
                          <button
                            onClick={() => removeAttachment(index)}
                            className="ml-2 text-gray-500 hover:text-red-500"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
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
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center"
                  >
                    <FiPlus className="mr-2" />
                    Add Tutorial
                  </button>
                  <button
                    onClick={addQuiz}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center"
                  >
                    <FiPlus className="mr-2" />
                    Add Quiz
                  </button>
                  <button
                    onClick={addLiveClass}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center"
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
                    className="border border-gray-200 rounded-lg p-6 relative hover:border-gray-500"
                  >
                    <div
                      className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer"
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
                          className="text-gray-400 hover:text-red-500"
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                              </label>
                              <Editor
                                initialValue={item.description}
                                previewStyle="vertical"
                                height="150px"
                                initialEditType="wysiwyg"
                                useCommandShortcut={true}
                                plugins={[colorSyntax]}
                                ref={(el) =>
                                  (editorRefs.current[`tutorial-${item.id}`] =
                                    el)
                                }
                                onChange={() => {
                                  const markdown = editorRefs.current[
                                    `tutorial-${item.id}`
                                  ]
                                    ?.getInstance()
                                    .getMarkdown();
                                  handleContentChange(
                                    item.id,
                                    "description",
                                    markdown
                                  );
                                }}
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-500"
                                    required
                                  />
                                </div>
                              </div>
                            ) : (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Upload Video *
                                </label>
                                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors inline-flex items-center">
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                              </label>
                              <Editor
                                initialValue={item.description}
                                previewStyle="vertical"
                                height="150px"
                                initialEditType="wysiwyg"
                                useCommandShortcut={true}
                                plugins={[colorSyntax]}
                                ref={(el) =>
                                  (editorRefs.current[`live-${item.id}`] = el)
                                }
                                onChange={() => {
                                  const markdown = editorRefs.current[
                                    `live-${item.id}`
                                  ]
                                    ?.getInstance()
                                    .getMarkdown();
                                  handleContentChange(
                                    item.id,
                                    "description",
                                    markdown
                                  );
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Thumbnail Image
                              </label>
                              <div className="w-full flex items-center gap-4 bg-gray-100 hover:bg-gray-200 p-3 rounded-lg">
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

                                {/* Remove button, appears only when thumbnail exists */}
                                {item.thumbnail && (
                                  <button
                                    onClick={() =>
                                      handleContentChange(
                                        item.id,
                                        "thumbnail",
                                        null
                                      )
                                    }
                                    className="text-gray-400 hover:text-red-500 p-3 rounded-full flex items-center justify-center"
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-500"
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
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-500"
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                              </label>
                              <Editor
                                initialValue={item.description}
                                previewStyle="vertical"
                                height="150px"
                                initialEditType="wysiwyg"
                                useCommandShortcut={true}
                                plugins={[colorSyntax]}
                                ref={(el) =>
                                  (editorRefs.current[`quiz-${item.id}`] = el)
                                }
                                onChange={() => {
                                  const markdown = editorRefs.current[
                                    `quiz-${item.id}`
                                  ]
                                    ?.getInstance()
                                    .getMarkdown();
                                  handleContentChange(
                                    item.id,
                                    "description",
                                    markdown
                                  );
                                }}
                              />
                            </div>

                            <div className="space-y-6">
                              {item.questions.map((question, qIndex) => (
                                <div
                                  key={question.id}
                                  className="border-l-4 border-gray-500 pl-4"
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
                                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-500"
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
                                        className="text-gray-400 hover:text-red-500"
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
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-500"
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
                                            className={`flex items-center gap-2 p-2 rounded-lg ${
                                              (question.type === "mcq-single" &&
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
                                              className={`focus:ring-green-500 h-4 w-4 ${
                                                question.type === "mcq-single"
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
                                              placeholder={`Option ${
                                                oIndex + 1
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
                                                className="text-gray-400 hover:text-red-500"
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
                                          className="text-green-600 hover:text-green-800 flex items-center text-sm mt-2 bg-green-50 hover:bg-green-100 px-3 py-1 rounded"
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
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 ${
                                          question.answer
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
                                        className={`border rounded-lg ${
                                          question.answer
                                            ? "border-green-500 bg-green-50"
                                            : "border-gray-300"
                                        }`}
                                      >
                                        <Editor
                                          initialValue={question.answer}
                                          previewStyle="vertical"
                                          height="150px"
                                          initialEditType="wysiwyg"
                                          useCommandShortcut={true}
                                          plugins={[colorSyntax]}
                                          ref={(el) =>
                                            (editorRefs.current[
                                              `question-${question.id}`
                                            ] = el)
                                          }
                                          onChange={() => {
                                            const markdown = editorRefs.current[
                                              `question-${question.id}`
                                            ]
                                              ?.getInstance()
                                              .getMarkdown();
                                            handleAnswerChange(
                                              item.id,
                                              question.id,
                                              markdown
                                            );
                                          }}
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
                                  className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded text-sm flex items-center border border-green-200"
                                >
                                  <FiPlus className="mr-1" /> Single Choice
                                </button>
                                <button
                                  onClick={() =>
                                    addQuestion(item.id, "mcq-multiple")
                                  }
                                  className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded text-sm flex items-center border border-green-200"
                                >
                                  <FiPlus className="mr-1" /> Multiple Choice
                                </button>
                                <button
                                  onClick={() =>
                                    addQuestion(item.id, "short-answer")
                                  }
                                  className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded text-sm flex items-center border border-green-200"
                                >
                                  <FiPlus className="mr-1" /> Short Answer
                                </button>
                                <button
                                  onClick={() =>
                                    addQuestion(item.id, "broad-answer")
                                  }
                                  className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded text-sm flex items-center border border-green-200"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-500"
                    required
                  />
                </div>
              </div>
            )}

            {/* Publish Button */}
            <div className="flex justify-end">
              <button
                onClick={publishCourse}
                disabled={
                  !courseData.title ||
                  !courseData.description ||
                  !courseData.thumbnail ||
                  courseData.content.length === 0 ||
                  (courseType === "premium" && !courseData.price)
                }
                className={`px-6 py-3 rounded-lg font-medium text-white ${
                  !courseData.title ||
                  !courseData.description ||
                  !courseData.thumbnail ||
                  courseData.content.length === 0 ||
                  (courseType === "premium" && !courseData.price)
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gray-600 hover:bg-gray-700"
                } transition-colors`}
              >
                Publish Course
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CourseCreator;
