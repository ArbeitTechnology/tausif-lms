/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlay,
  FiPause,
  FiVolume2,
  FiVolumeX,
  FiMaximize,
  FiMinimize,
  FiChevronLeft,
  FiCheck,
  FiX,
  FiClock,
  FiAward,
  FiBook,
  FiBarChart2,
  FiSettings,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const CoursePlayer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentContent, setCurrentContent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState({});
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedOptions, setShowSpeedOptions] = useState(false);
  const [videoQuality, setVideoQuality] = useState("Auto");
  const [currentTime, setCurrentTime] = useState(0);
  const [showPiP, setShowPiP] = useState(false);
  const [showBroadQuestions, setShowBroadQuestions] = useState(false);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [certificateUrl, setCertificateUrl] = useState(null);
  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`${base_url}/api/student/single-courses/${id}`);
        setCourse(response.data.data);
        
        // Initialize progress
        const initialProgress = {};
        response.data.data.content.forEach((item) => {
          initialProgress[item._id] = {
            completed: false,
            progress: 0,
          };
        });
        setProgress(initialProgress);
      } catch (err) {
        console.error("Error fetching course:", err);
        setError("Failed to load course data");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, base_url]);

  useEffect(() => {
    if (!course) return;

    // Check if current content is a quiz and show quiz modal
    if (course.content[currentContent]?.type === "quiz") {
      setShowQuiz(true);
      setIsPlaying(false);
    } else {
      setShowQuiz(false);
      setIsPlaying(true);
    }
  }, [currentContent, course]);

  useEffect(() => {
    // Update playback rate when changed
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoContainerRef.current?.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handleNext = () => {
    if (!course) return;
    
    if (currentContent < course.content.length - 1) {
      setCurrentContent(currentContent + 1);
      // Update progress
      setProgress((prev) => ({
        ...prev,
        [course.content[currentContent]._id]: {
          ...prev[course.content[currentContent]._id],
          completed: true,
          progress: 100,
        },
      }));
    }
  };

  const handlePrev = () => {
    if (currentContent > 0) {
      setCurrentContent(currentContent - 1);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const changePlaybackRate = (rate) => {
    setPlaybackRate(rate);
    setShowSpeedOptions(false);
  };

  const handleAnswerChange = (questionId, answer) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const submitQuiz = async () => {
    if (!course) return;
    
    try {
      // Calculate score
      let score = 0;
      const quiz = course.content[currentContent];
      const detailedAnswers = [];

      quiz.questions.forEach((question) => {
        const userAnswer = quizAnswers[question._id];
        let isCorrect = false;

        if (question.type === "mcq-single") {
          isCorrect = userAnswer === question.correctAnswer;
        } else if (question.type === "mcq-multiple") {
          const userAnswers = Array.isArray(userAnswer) ? userAnswer : [];
          const correctAnswers = question.correctAnswer;
          isCorrect = userAnswers.length === correctAnswers.length && 
                     userAnswers.every(val => correctAnswers.includes(val));
        } else if (question.type === "short-answer" || question.type === "broad-answer") {
          isCorrect = userAnswer && 
                     typeof userAnswer === 'string' && 
                     userAnswer.toLowerCase().includes(question.answer.toLowerCase());
        }

        if (isCorrect) score++;
        
        detailedAnswers.push({
          questionId: question._id,
          answer: userAnswer,
          isCorrect
        });
      });

      const percentageScore = Math.round((score / quiz.questions.length) * 100);
      const passed = percentageScore >= 70;

      // Submit quiz to backend
      const response = await axios.post(`${base_url}/api/student/submit-quiz`, {
        courseId: course._id,
        contentItemId: quiz._id,
        answers: quizAnswers,
        studentId: localStorage.getItem('userId') // Assuming you store user ID in localStorage
      });

      setQuizScore(percentageScore);
      setQuizSubmitted(true);
      setCertificateUrl(response.data.certificateUrl || null);

      // Update progress
      setProgress((prev) => ({
        ...prev,
        [quiz._id]: {
          ...prev[quiz._id],
          completed: true,
          progress: 100,
        },
      }));

    } catch (error) {
      console.error("Error submitting quiz:", error);
      setError("Failed to submit quiz");
    }
  };

  const closeQuiz = () => {
    setShowQuiz(false);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    if (course && currentContent < course.content.length - 1) {
      setCurrentContent(currentContent + 1);
    }
    setIsPlaying(true);
  };

  const calculateOverallProgress = () => {
    if (!course) return 0;
    
    const totalItems = course.content.length;
    const completedItems = Object.values(progress).filter(
      (item) => item?.completed
    ).length;
    return Math.round((completedItems / totalItems) * 100);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVideoClick = () => {
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Add this useEffect for time updates
  useEffect(() => {
    if (!course) return;
    
    const currentItem = course.content[currentContent];
    if (!currentItem || currentItem.type === "quiz") return;
    
    const interval = setInterval(() => {
      if (isPlaying && currentTime < (currentItem.duration || 0)) {
        setCurrentTime((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, currentContent, course]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <div className="text-red-500 mb-4">
            <FiX size={48} className="mx-auto" />
          </div>
          <h2 className="text-xl font-bold mb-2">Error Loading Course</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No course data available</p>
        </div>
      </div>
    );
  }

  const currentItem = course.content[currentContent];
  const overallProgress = calculateOverallProgress();

  // Extract YouTube video ID from URL
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  };

  const downloadCertificate = () => {
    if (certificateUrl) {
      window.open(`${base_url}${certificateUrl}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-full mx-auto px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate(`/course/${id}`)}
            className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <FiChevronLeft className="mr-1" /> Back to course
          </button>
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <h1 className="text-xl font-bold">{course.title}</h1>
              <p className="text-sm text-gray-600">{course.description.replace(/<[^>]+>/g, '')}</p>
            </div>
            <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
              {overallProgress}% Complete
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Video/content area - Left side */}
        <div className="lg:w-2/3 ">
          <div
            ref={videoContainerRef}
            className="relative max-w-full max-h-full flex items-center justify-center"
          >
            {currentItem.type === "tutorial" && (
              <div className="w-full max-h-full max-w-full aspect-video bg-black relative">
                <iframe
                  ref={videoRef}
                  src={`${getYouTubeEmbedUrl(currentItem.youtubeLink)}?autoplay=${
                    isPlaying ? 1 : 0
                  }&mute=${isMuted ? 1 : 0}&controls=0&modestbranding=1&rel=0`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                  onClick={handleVideoClick}
                ></iframe>

                {/* Overlay controls - updated design */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end">
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {currentItem.title}
                    </h2>
                    <p className="text-gray-300 mb-4">
                      {currentItem.description.replace(/<[^>]+>/g, '')}
                    </p>

                    {/* Progress bar */}
                    <div className="w-full bg-gray-600 h-1 rounded-full mb-4">
                      <div
                        className="bg-indigo-500 h-1 rounded-full"
                        style={{
                          width: `${
                            (currentTime / (currentItem.duration || 1)) * 100
                          }%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={togglePlay}
                          className="text-white hover:text-gray-300 bg-black/30 rounded-full p-3"
                        >
                          {isPlaying ? (
                            <FiPause size={24} />
                          ) : (
                            <FiPlay size={24} />
                          )}
                        </button>
                        <button
                          onClick={toggleMute}
                          className="text-white hover:text-gray-300 bg-black/30 rounded-full p-3"
                        >
                          {isMuted ? (
                            <FiVolumeX size={20} />
                          ) : (
                            <FiVolume2 size={20} />
                          )}
                        </button>
                        <div className="text-white text-sm bg-black/30 px-3 py-1 rounded-full">
                          {formatTime(currentTime)} /{" "}
                          {currentItem.duration ? formatDuration(currentItem.duration) : "0:00"}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {/* Updated Quality/Speed controls */}
                        <div className="flex items-center space-x-2">
                          <button
                            className="text-white text-sm bg-black/30 px-3 py-1 rounded"
                            onClick={() =>
                              setVideoQuality(
                                videoQuality === "Auto" ? "HD" : "Auto"
                              )
                            }
                          >
                            Quality: {videoQuality}
                          </button>
                          <button
                            className="text-white text-sm bg-black/30 px-3 py-1 rounded"
                            onClick={() =>
                              setPlaybackRate(playbackRate === 1 ? 1.5 : 1)
                            }
                          >
                            Speed: {playbackRate}x
                          </button>
                        </div>

                        <button
                          onClick={toggleFullscreen}
                          className="text-white hover:text-gray-300 bg-black/30 rounded-full p-3"
                        >
                          {isFullscreen ? (
                            <FiMinimize size={20} />
                          ) : (
                            <FiMaximize size={20} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="bg-white p-4 border-t border-gray-200">
            <div className="max-w-5xl mx-auto flex justify-between">
              <button
                onClick={handlePrev}
                disabled={currentContent === 0}
                className={`flex items-center px-5 py-3 rounded-lg ${
                  currentContent === 0
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <FiChevronLeft className="mr-2" /> Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentContent === course.content.length - 1}
                className={`flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors ${
                  currentContent === course.content.length - 1
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                Next Lesson{" "}
                <FiChevronLeft className="ml-2 transform rotate-180" />
              </button>
            </div>
          </div>
        </div>

        {/* Content tracking - Right side */}
        <div className="lg:w-1/3 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Course Content</h2>
              <div className="text-sm text-gray-600">
                {overallProgress}% complete
              </div>
            </div>

            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              {course.content.map((item, index) => (
                <motion.div
                  key={item._id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (item.type === "quiz") {
                      setCurrentContent(index);
                    } else {
                      setCurrentContent(index);
                      setIsPlaying(true);
                    }
                  }}
                  className={`p-4 rounded-xl cursor-pointer border transition-all ${
                    currentContent === index
                      ? "border-indigo-300 bg-indigo-50"
                      : "border-gray-200 hover:border-gray-300"
                  } ${
                    progress[item._id]?.completed
                      ? "bg-green-50 border-green-200"
                      : ""
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 relative">
                      {progress[item._id]?.completed ? (
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <FiCheck className="text-green-600 text-lg" />
                        </div>
                      ) : (
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            currentContent === index
                              ? "bg-indigo-100 text-indigo-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {item.type === "quiz" ? (
                            <FiBarChart2 />
                          ) : (
                            <FiPlay className="ml-1" />
                          )}
                        </div>
                      )}
                    </div>

                    <div className="ml-4 flex-1">
                      <div className="flex justify-between items-start">
                        <h3
                          className={`font-medium ${
                            currentContent === index
                              ? "text-indigo-700"
                              : "text-gray-800"
                          }`}
                        >
                          {item.title}
                        </h3>
                        <span className="text-xs text-gray-500 flex items-center">
                          <FiClock className="mr-1" />
                          {item.type === "quiz"
                            ? `${item.questions?.length || 0} questions`
                            : item.duration ? formatDuration(item.duration) : "0:00"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.description.replace(/<[^>]+>/g, '')}
                      </p>
                      {item.type === "quiz" && (
                        <span className="inline-block mt-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          Quiz
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Course completion card */}
            {overallProgress === 100 && (
              <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-center">
                  <div className="bg-white/20 p-3 rounded-full mr-4">
                    <FiAward size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Course Completed!</h3>
                    <p className="text-sm opacity-90">
                      Congratulations on finishing this course!
                    </p>
                  </div>
                </div>
                <button 
                  onClick={downloadCertificate}
                  className="mt-4 w-full bg-white text-indigo-600 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Download Certificate
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      <AnimatePresence>
        {showQuiz && currentItem?.type === "quiz" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">{currentItem.title}</h2>
                    <p className="text-gray-600">{currentItem.description.replace(/<[^>]+>/g, '')}</p>
                  </div>
                  <button
                    onClick={closeQuiz}
                    className="text-gray-500 hover:text-gray-700 p-2"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                {!quizSubmitted ? (
                  <div className="space-y-8">
                    {currentItem.questions?.map((question, qIndex) => (
                      <div key={question._id} className="mb-6">
                        <div className="flex items-start mb-4">
                          <div className="bg-indigo-100 text-indigo-800 w-8 h-8 rounded-full flex items-center justify-center font-medium mr-3 flex-shrink-0">
                            {qIndex + 1}
                          </div>
                          <h3 className="text-lg font-medium mt-1">
                            {question.question}
                          </h3>
                        </div>

                        {question.type === "mcq-single" && (
                          <div className="space-y-3 ml-11">
                            {question.options?.map((option, oIndex) => (
                              <label
                                key={oIndex}
                                className={`flex items-center space-x-3 p-4 border rounded-xl cursor-pointer transition-colors ${
                                  quizAnswers[question._id] === oIndex
                                    ? "border-indigo-500 bg-indigo-50"
                                    : "border-gray-200 hover:border-gray-400"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`question-${question._id}`}
                                  checked={quizAnswers[question._id] === oIndex}
                                  onChange={() =>
                                    handleAnswerChange(question._id, oIndex)
                                  }
                                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span>{option}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {question.type === "mcq-multiple" && (
                          <div className="space-y-3 ml-11">
                            {question.options?.map((option, oIndex) => (
                              <label
                                key={oIndex}
                                className={`flex items-center space-x-3 p-4 border rounded-xl cursor-pointer transition-colors ${
                                  (quizAnswers[question._id] || []).includes(
                                    oIndex
                                  )
                                    ? "border-indigo-500 bg-indigo-50"
                                    : "border-gray-200 hover:border-gray-400"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={(
                                    quizAnswers[question._id] || []
                                  ).includes(oIndex)}
                                  onChange={() => {
                                    const currentAnswers =
                                      quizAnswers[question._id] || [];
                                    const newAnswers = currentAnswers.includes(
                                      oIndex
                                    )
                                      ? currentAnswers.filter(
                                          (a) => a !== oIndex
                                        )
                                      : [...currentAnswers, oIndex];
                                    handleAnswerChange(
                                      question._id,
                                      newAnswers
                                    );
                                  }}
                                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span>{option}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {question.type === "short-answer" && (
                          <div className="ml-11">
                            <textarea
                              value={quizAnswers[question._id] || ""}
                              onChange={(e) =>
                                handleAnswerChange(question._id, e.target.value)
                              }
                              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              rows={4}
                              placeholder="Type your answer here..."
                            />
                          </div>
                        )}

                        {question.type === "broad-answer" && (
                          <div className="ml-11">
                            <textarea
                              value={quizAnswers[question._id] || ""}
                              onChange={(e) =>
                                handleAnswerChange(question._id, e.target.value)
                              }
                              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              rows={6}
                              placeholder="Type your detailed answer here..."
                            />
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="flex justify-end mt-8">
                      <button
                        onClick={submitQuiz}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                      >
                        Submit Quiz
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
                      <FiCheck className="text-green-600 text-4xl" />
                    </div>
                    <div className="text-4xl font-bold mb-2">
                      {quizScore}/{currentItem.questions?.length || 0}
                    </div>
                    <p className="text-xl mb-6">
                      {quizScore === (currentItem.questions?.length || 0)
                        ? "Perfect score! You're amazing!"
                        : quizScore >= (currentItem.questions?.length || 0) / 2
                        ? "Well done! You passed the quiz."
                        : "Keep practicing! Review the material and try again."}
                    </p>
                    <div className="mb-8">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-indigo-600 h-2.5 rounded-full"
                          style={{
                            width: `${
                              (quizScore / (currentItem.questions?.length || 1)) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        {Math.round(
                          (quizScore / (currentItem.questions?.length || 1)) * 100
                        )}
                        % correct
                      </div>
                    </div>
                    <button
                      onClick={closeQuiz}
                      className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                    >
                      Continue Learning
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoursePlayer;