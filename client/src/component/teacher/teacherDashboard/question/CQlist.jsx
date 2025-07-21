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

const CQlist = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  
  // Get teacher ID from localStorage
  const teacherData = JSON.parse(localStorage.getItem("teacherData"));
  const teacherId = teacherData?._id;

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${base_url}/api/teacher/teacher-own-cq/${teacherId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("teacherToken")}`,
        },
      });
      setQuestions(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to fetch questions");
      setLoading(false);
    }
  };
  useEffect(() => {
    if (teacherId) {
      fetchQuestions();
    }
  }, []);


  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const filteredQuestions = questions.filter((question) => {
    const matchesSearch =
      question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "block" && question.type === "block") ||
      (filter === "code" && question.type === "code");
    return matchesSearch && matchesFilter;
  });

  const handleEdit = (question) => {
    setEditingQuestion(JSON.parse(JSON.stringify(question))); // Deep copy
    setIsModalOpen(true);
  };

  const handleSave = async (updatedQuestion) => {
    try {
      const response = await axios.put(
        `${base_url}/teacher/update-question/${updatedQuestion._id}`,
        updatedQuestion,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("teacherToken")}`,
          },
        }
      );
      setQuestions(
        questions.map((q) => (q._id === updatedQuestion._id ? response.data : q))
      );
      toast.success("Question updated successfully");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error("Failed to update question");
    }
  };

  const handleDelete = async (questionId) => {
    try {
      await axios.delete(`${base_url}/api/teacher/delete-question/${questionId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("teacherToken")}`,
        },
      });
      setQuestions(questions.filter(q => q._id !== questionId));
      toast.success("Question deleted successfully");
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
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
                <h1 className="text-2xl font-bold text-gray-800">My Questions</h1>
              </div>

              <div className="bg-white rounded-[10px] border border-gray-200 p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search questions..."
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
                      <option value="all">All Questions</option>
                      <option value="block">Block Questions</option>
                      <option value="code">Code Questions</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto border-[1px] border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tags
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredQuestions.length > 0 ? (
                        filteredQuestions.map((question) => (
                          <tr key={question._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {question.title}
                              </div>
                              <div className="text-sm text-gray-500 line-clamp-1">
                                {question.content}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  question.type === "block"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {question.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {question.number}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-wrap gap-1">
                                {question.tags?.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEdit(question)}
                                  className="bg-blue-500 px-[7px] py-[6px] rounded-[5px] text-white text-[18px] cursor-pointer"
                                  title="Edit"
                                >
                                  <FiEdit className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(question._id)}
                                  className="bg-red-500 px-[7px] py-[6px] rounded-[5px] cursor-pointer text-white text-[22px]"
                                >
                                  <MdDelete />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                            {loading ? "Loading questions..." : "No questions found. Create your first question to get started."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Edit Question Modal */}
            {isModalOpen && editingQuestion && (
              <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[10000] p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                >
                  <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">
                      Edit Question
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
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title *
                          </label>
                          <input
                            type="text"
                            value={editingQuestion.title}
                            onChange={(e) =>
                              setEditingQuestion({
                                ...editingQuestion,
                                title: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Content *
                          </label>
                          <textarea
                            value={editingQuestion.content}
                            onChange={(e) =>
                              setEditingQuestion({
                                ...editingQuestion,
                                content: e.target.value,
                              })
                            }
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type *
                          </label>
                          <select
                            value={editingQuestion.type}
                            onChange={(e) =>
                              setEditingQuestion({
                                ...editingQuestion,
                                type: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-500"
                          >
                            <option value="block">Block</option>
                            <option value="code">Code</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Number
                          </label>
                          <input
                            type="number"
                            value={editingQuestion.number}
                            onChange={(e) =>
                              setEditingQuestion({
                                ...editingQuestion,
                                number: parseInt(e.target.value),
                              })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tags (comma separated)
                          </label>
                          <input
                            type="text"
                            value={editingQuestion.tags?.join(", ")}
                            onChange={(e) =>
                              setEditingQuestion({
                                ...editingQuestion,
                                tags: e.target.value.split(",").map(tag => tag.trim()),
                              })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-500"
                          />
                        </div>
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
                        onClick={() => handleSave(editingQuestion)}
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
        </div>
      </div>
    </div>
  );
};

export default CQlist;