/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiEdit, FiEye, FiSearch, FiFilter, FiX, FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// Dummy data - replace with real API calls in production
const dummyCourses = [
  {
    _id: "1",
    title: "Introduction to React",
    description:
      "Learn React from scratch with this comprehensive beginner's guide",
    instructor: { _id: "101", name: "John Doe" },
    thumbnail: {
      path: "/thumbnails/react.jpg",
    },
    type: "free",
    price: 0,
    studentsEnrolled: 150,
    averageRating: 4.5,
    content: [
      {
        id: "1",
        type: "tutorial",
        title: "React Basics",
        description: "Introduction to React concepts and fundamentals",
        isPremium: false,
        youtubeLink: "https://youtube.com/react-basics",
      },
      {
        id: "2",
        type: "quiz",
        title: "React Fundamentals Quiz",
        description: "Test your understanding of basic React concepts",
        questions: [
          {
            id: "1",
            question: "What is JSX in React?",
            type: "mcq-single",
            options: [
              "A JavaScript extension",
              "A template language",
              "A syntax extension for JavaScript",
              "A state management library",
            ],
            correctAnswer: 2,
          },
          {
            id: "2",
            question: "Which of these are React hooks? (Select all that apply)",
            type: "mcq-multiple",
            options: ["useState", "useEffect", "useContext", "useReducer"],
            correctAnswer: [0, 1, 2, 3],
          },
          {
            id: "3",
            question: "Explain the virtual DOM in your own words",
            type: "broad-answer",
            correctAnswer:
              "The virtual DOM is a lightweight copy of the real DOM that React uses to optimize updates.",
          },
        ],
      },
    ],
    createdAt: "2023-05-15T10:00:00Z",
  },
  {
    _id: "2",
    title: "Advanced JavaScript",
    description: "Deep dive into advanced JavaScript concepts and patterns",
    instructor: { _id: "101", name: "John Doe" },
    thumbnail: {
      path: "/thumbnails/js.jpg",
    },
    type: "premium",
    price: 49.99,
    studentsEnrolled: 89,
    averageRating: 4.8,
    content: [
      {
        id: "1",
        type: "tutorial",
        title: "Closures and Scope",
        description: "Understanding JavaScript closures and scope chain",
        isPremium: true,
        content: "/videos/closures.mp4",
      },
      {
        id: "2",
        type: "live",
        title: "Async JavaScript Workshop",
        description: "Live session on promises, async/await and event loop",
        meetingLink: "https://zoom.us/j/123456789",
        schedule: "2023-12-15T18:00:00Z",
      },
      {
        id: "3",
        type: "quiz",
        title: "JS Fundamentals Quiz",
        description: "Test your JavaScript knowledge",
        questions: [
          {
            id: "1",
            question: "What is a closure?",
            type: "mcq-single",
            options: [
              "A function",
              "A scope",
              "A combination of function and its lexical environment",
              "A JavaScript class",
            ],
            correctAnswer: 2,
          },
          {
            id: "2",
            question: "What does 'this' refer to in JavaScript?",
            type: "short-answer",
            correctAnswer:
              "'this' refers to the object that the function is a property of",
          },
          {
            id: "3",
            question: "Which of these are JavaScript data types?",
            type: "mcq-multiple",
            options: [
              "String",
              "Number",
              "Boolean",
              "Object",
              "All of the above",
            ],
            correctAnswer: [0, 1, 2, 3, 4],
          },
        ],
      },
    ],
    createdAt: "2023-06-20T14:30:00Z",
  },
  {
    _id: "3",
    title: "Complete Python Bootcamp",
    description:
      "Go from zero to hero in Python with this comprehensive bootcamp",
    instructor: { _id: "102", name: "Jane Smith" },
    thumbnail: {
      path: "/thumbnails/python.jpg",
    },
    type: "premium",
    price: 79.99,
    studentsEnrolled: 215,
    averageRating: 4.9,
    content: [
      {
        id: "1",
        type: "tutorial",
        title: "Python Basics",
        description: "Introduction to Python syntax and fundamentals",
        isPremium: true,
        content: "/videos/python-basics.mp4",
      },
      {
        id: "2",
        type: "tutorial",
        title: "Object-Oriented Programming",
        description: "Learn OOP concepts in Python",
        isPremium: true,
        content: "/videos/python-oop.mp4",
      },
      {
        id: "3",
        type: "quiz",
        title: "Python Fundamentals Test",
        description: "Assess your Python knowledge",
        questions: [
          {
            id: "1",
            question: "How do you create a list in Python?",
            type: "short-answer",
            correctAnswer: "Using square brackets, e.g., my_list = [1, 2, 3]",
          },
          {
            id: "2",
            question: "What is the output of 'print(3 * 'a')'?",
            type: "mcq-single",
            options: ["aaa", "3a", "a a a", "Error"],
            correctAnswer: 0,
          },
          {
            id: "3",
            question:
              "Explain the difference between a list and a tuple in Python",
            type: "broad-answer",
            correctAnswer:
              "Lists are mutable (can be changed) while tuples are immutable (cannot be changed). Lists use square brackets [] while tuples use parentheses ().",
          },
        ],
      },
    ],
    createdAt: "2023-04-10T08:15:00Z",
  },
  {
    _id: "4",
    title: "Web Design Fundamentals",
    description: "Learn modern web design principles and techniques",
    instructor: { _id: "103", name: "Alex Johnson" },
    thumbnail: {
      path: "/thumbnails/web-design.jpg",
    },
    type: "free",
    price: 0,
    studentsEnrolled: 320,
    averageRating: 4.7,
    content: [
      {
        id: "1",
        type: "tutorial",
        title: "HTML5 Crash Course",
        description: "Learn modern HTML5 features",
        isPremium: false,
        youtubeLink: "https://youtube.com/html5-crash-course",
      },
      {
        id: "2",
        type: "tutorial",
        title: "CSS Flexbox and Grid",
        description: "Master modern CSS layout techniques",
        isPremium: false,
        youtubeLink: "https://youtube.com/css-layouts",
      },
      {
        id: "3",
        type: "quiz",
        title: "Web Design Basics Quiz",
        description: "Test your web design knowledge",
        questions: [
          {
            id: "1",
            question: "What does CSS stand for?",
            type: "mcq-single",
            options: [
              "Computer Style Sheets",
              "Cascading Style Sheets",
              "Creative Style System",
              "Colorful Style Syntax",
            ],
            correctAnswer: 1,
          },
          {
            id: "2",
            question: "Which of these are CSS layout techniques?",
            type: "mcq-multiple",
            options: ["Flexbox", "Grid", "Floats", "All of the above"],
            correctAnswer: [0, 1, 2, 3],
          },
        ],
      },
    ],
    createdAt: "2023-03-05T09:30:00Z",
  },
  {
    _id: "5",
    title: "Data Science with Python",
    description:
      "Learn data analysis, visualization, and machine learning with Python",
    instructor: { _id: "104", name: "Maria Garcia" },
    thumbnail: {
      path: "/thumbnails/data-science.jpg",
    },
    type: "premium",
    price: 99.99,
    studentsEnrolled: 178,
    averageRating: 4.8,
    content: [
      {
        id: "1",
        type: "tutorial",
        title: "Pandas Fundamentals",
        description: "Introduction to data manipulation with Pandas",
        isPremium: true,
        content: "/videos/pandas-fundamentals.mp4",
      },
      {
        id: "2",
        type: "live",
        title: "Data Visualization Workshop",
        description: "Live session on Matplotlib and Seaborn",
        meetingLink: "https://zoom.us/j/987654321",
        schedule: "2023-12-20T16:00:00Z",
      },
      {
        id: "3",
        type: "quiz",
        title: "Data Science Concepts",
        description: "Test your data science knowledge",
        questions: [
          {
            id: "1",
            question: "What is the purpose of NumPy in Python?",
            type: "broad-answer",
            correctAnswer:
              "NumPy provides support for large, multi-dimensional arrays and matrices, along with a collection of mathematical functions to operate on these arrays.",
          },
          {
            id: "2",
            question:
              "Which library is primarily used for data manipulation in Python?",
            type: "mcq-single",
            options: ["Pandas", "NumPy", "Matplotlib", "Scikit-learn"],
            correctAnswer: 0,
          },
        ],
      },
    ],
    createdAt: "2023-07-22T11:45:00Z",
  },
];

const CourseList = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState(dummyCourses);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingCourse, setEditingCourse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleSave = (updatedCourse) => {
    setCourses(
      courses.map((c) => (c._id === updatedCourse._id ? updatedCourse : c))
    );
    toast.success("Course updated successfully");
    setIsModalOpen(false);
  };

  return (
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
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

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Students
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCourses.map((course) => (
                  <tr key={course._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-md object-cover"
                            src={
                              course.thumbnail?.path || "/default-thumbnail.jpg"
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
                      {course.studentsEnrolled}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900 mr-2">
                          {course.averageRating.toFixed(1)}
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(course.averageRating)
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
                          className="text-gray-600 hover:text-gray-900 p-1 rounded-md hover:bg-gray-100"
                          title="Edit"
                        >
                          <FiEdit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => navigate(`/courses/${course._id}`)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50"
                          title="View"
                        >
                          <FiEye className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Course Modal */}
      {isModalOpen && editingCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                        onClick={() => {
                          const newContent = [
                            ...editingCourse.content,
                            {
                              id: Date.now().toString(),
                              type: "tutorial",
                              title: "",
                              description: "",
                              isPremium: editingCourse.type === "premium",
                              ...(editingCourse.type === "free"
                                ? { youtubeLink: "" }
                                : { content: "" }),
                            },
                          ];
                          setEditingCourse({
                            ...editingCourse,
                            content: newContent,
                          });
                        }}
                        className="flex items-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
                      >
                        <FiPlus /> Add Tutorial
                      </button>
                      <button
                        onClick={() => {
                          const newContent = [
                            ...editingCourse.content,
                            {
                              id: Date.now().toString(),
                              type: "quiz",
                              title: "",
                              description: "",
                              questions: [
                                {
                                  id: Date.now().toString(),
                                  question: "",
                                  type: "mcq-single",
                                  options: ["", ""],
                                  correctAnswer: null, // Change from 0 to null
                                },
                              ],
                            },
                          ];
                          setEditingCourse({
                            ...editingCourse,
                            content: newContent,
                          });
                        }}
                        className="flex items-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
                      >
                        <FiPlus /> Add Quiz
                      </button>
                      <button
                        onClick={() => {
                          const newContent = [
                            ...editingCourse.content,
                            {
                              id: Date.now().toString(),
                              type: "live",
                              title: "",
                              description: "",
                              meetingLink: "",
                              schedule: new Date().toISOString(),
                            },
                          ];
                          setEditingCourse({
                            ...editingCourse,
                            content: newContent,
                          });
                        }}
                        className="flex items-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
                      >
                        <FiPlus /> Add Live Class
                      </button>
                    </div>
                  </div>

                  {editingCourse.content.map((item, index) => (
                    <div
                      key={item.id}
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
                          onClick={() => {
                            const newContent = editingCourse.content.filter(
                              (c) => c.id !== item.id
                            );
                            setEditingCourse({
                              ...editingCourse,
                              content: newContent,
                            });
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
                                value={item.youtubeLink}
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
                            {item.questions.map((question, qIndex) => (
                              <div
                                key={question.id}
                                className="border-l-2 border-gray-300 pl-3 space-y-3"
                              >
                                <div className="flex justify-between items-center">
                                  <h5 className="font-medium">
                                    Question {qIndex + 1}
                                  </h5>
                                  <button
                                    onClick={() => {
                                      const newContent = [
                                        ...editingCourse.content,
                                      ];
                                      newContent[index].questions = newContent[
                                        index
                                      ].questions.filter(
                                        (q) => q.id !== question.id
                                      );
                                      setEditingCourse({
                                        ...editingCourse,
                                        content: newContent,
                                      });
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
                                      const newContent = [
                                        ...editingCourse.content,
                                      ];
                                      newContent[index].questions[
                                        qIndex
                                      ].question = e.target.value;
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
                                      const newContent = [
                                        ...editingCourse.content,
                                      ];
                                      newContent[index].questions[qIndex].type =
                                        e.target.value;
                                      // Reset correct answer when changing type
                                      newContent[index].questions[
                                        qIndex
                                      ].correctAnswer = null;
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
                                    {question.options.map((option, oIndex) => (
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
                                            onClick={() => {
                                              const newContent = [
                                                ...editingCourse.content,
                                              ];
                                              newContent[index].questions[
                                                qIndex
                                              ].options = newContent[
                                                index
                                              ].questions[
                                                qIndex
                                              ].options.filter(
                                                (_, i) => i !== oIndex
                                              );
                                              if (
                                                question.type === "mcq-single"
                                              ) {
                                                if (
                                                  newContent[index].questions[
                                                    qIndex
                                                  ].correctAnswer === oIndex
                                                ) {
                                                  newContent[index].questions[
                                                    qIndex
                                                  ].correctAnswer = null;
                                                }
                                              } else {
                                                newContent[index].questions[
                                                  qIndex
                                                ].correctAnswer =
                                                  newContent[index].questions[
                                                    qIndex
                                                  ].correctAnswer?.filter(
                                                    (a) => a !== oIndex
                                                  ) || [];
                                              }
                                              setEditingCourse({
                                                ...editingCourse,
                                                content: newContent,
                                              });
                                            }}
                                            className="text-red-500 hover:text-red-700"
                                          >
                                            Remove
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                    <button
                                      onClick={() => {
                                        const newContent = [
                                          ...editingCourse.content,
                                        ];
                                        newContent[index].questions[
                                          qIndex
                                        ].options.push("");
                                        setEditingCourse({
                                          ...editingCourse,
                                          content: newContent,
                                        });
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
                              onClick={() => {
                                const newContent = [...editingCourse.content];
                                const newQuestion = {
                                  id: Date.now().toString(),
                                  question: "",
                                  type: "mcq-single",
                                  options: ["", ""],
                                  correctAnswer: null,
                                };

                                // Initialize different structures based on type if needed
                                if (
                                  newQuestion.type === "short-answer" ||
                                  newQuestion.type === "broad-answer"
                                ) {
                                  newQuestion.correctAnswer = "";
                                  delete newQuestion.options;
                                }

                                newContent[index].questions.push(newQuestion);
                                setEditingCourse({
                                  ...editingCourse,
                                  content: newContent,
                                });
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
                              value={item.meetingLink}
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
                              value={item.schedule}
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
    </motion.div>
  );
};

export default CourseList;
