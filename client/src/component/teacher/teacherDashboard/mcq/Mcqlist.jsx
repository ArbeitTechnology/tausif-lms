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

const Mcqlist = () => {
  const navigate = useNavigate();
  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingMcq, setEditingMcq] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  
  // Get teacher ID from localStorage
  const teacherData = JSON.parse(localStorage.getItem("teacherData"));
  const teacherId = teacherData?._id;

  useEffect(() => {
    if (teacherId) {
      fetchMcqs();
    }
  }, [teacherId]);

  const fetchMcqs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${base_url}/api/teacher/teacher-own-mcq/${teacherId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("teacherToken")}`,
        },
      });
      setMcqs(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching MCQs:", error);
      toast.error("Failed to fetch MCQs");
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const filteredMcqs = mcqs.filter((mcq) => {
    const matchesSearch = mcq.question.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleEdit = (mcq) => {
    setEditingMcq(JSON.parse(JSON.stringify(mcq))); // Deep copy
    setIsModalOpen(true);
  };

  const handleSave = async (updatedMcq) => {
    try {
      const response = await axios.put(
        `${base_url}/api/teacher/update-mcq/${updatedMcq._id}`,
        updatedMcq,
        {user_id:JSON.parse(localStorage.getItem("teacherData"))._id},
        {
          headers: {
              Authorization: `Bearer ${localStorage.getItem("teacherToken")}`,
          },
        }
      );
      setMcqs(mcqs.map((m) => (m._id === updatedMcq._id ? response.data : m)));
      toast.success("MCQ updated successfully");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating MCQ:", error);
      toast.error("Failed to update MCQ");
    }
  };

  const handleDelete = async (mcqId) => {
    try {
      await axios.delete(`${base_url}/api/teacher/delete-mcq/${mcqId}`,{user_id:JSON.parse(localStorage.getItem("teacherData"))._id}, {
        headers: {
         Authorization: `Bearer ${localStorage.getItem("teacherToken")}`,
        },
      });
      setMcqs(mcqs.filter((m) => m._id !== mcqId));
      toast.success("MCQ deleted successfully");
    } catch (error) {
      console.error("Error deleting MCQ:", error);
      toast.error("Failed to delete MCQ");
    }
  };

  const addNewOption = () => {
    setEditingMcq({
      ...editingMcq,
      options: [...editingMcq.options, ""],
    });
  };

  const removeOption = (index) => {
    const newOptions = [...editingMcq.options];
    newOptions.splice(index, 1);
    
    // Adjust correctAnswer if needed
    let newCorrectAnswer = editingMcq.correctAnswer;
    if (typeof newCorrectAnswer === 'number') {
      if (newCorrectAnswer === index) {
        newCorrectAnswer = null; // Reset if deleted option was correct
      } else if (newCorrectAnswer > index) {
        newCorrectAnswer -= 1; // Adjust index if it was higher
      }
    }
    
    setEditingMcq({
      ...editingMcq,
      options: newOptions,
      correctAnswer: newCorrectAnswer
    });
  };

  const updateOption = (index, value) => {
    const newOptions = [...editingMcq.options];
    newOptions[index] = value;
    setEditingMcq({
      ...editingMcq,
      options: newOptions,
    });
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
                <h1 className="text-2xl font-bold text-gray-800">My MCQs</h1>
                <button
                  onClick={() => {
                    setEditingMcq({
                      question: "",
                      options: ["", ""],
                      correctAnswer: null,
                      explanation: "",
                      points: 1,
                    });
                    setIsModalOpen(true);
                  }}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  <FiPlus /> Add New MCQ
                </button>
              </div>

              <div className="bg-white rounded-[10px] border border-gray-200 p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search MCQs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-500"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto border-[1px] border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Question
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Options
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Correct Answer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Points
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-4 text-center">
                            Loading...
                          </td>
                        </tr>
                      ) : filteredMcqs.length > 0 ? (
                        filteredMcqs.map((mcq) => (
                          <tr key={mcq._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {mcq.question}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-500">
                                <ul className="list-disc pl-5">
                                  {mcq.options.map((option, i) => (
                                    <li key={i}>{option}</li>
                                  ))}
                                </ul>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {mcq.options[mcq.correctAnswer]}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {mcq.points}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEdit(mcq)}
                                  className="bg-blue-500 px-[7px] py-[6px] rounded-[5px] text-white text-[18px] cursor-pointer"
                                  title="Edit"
                                >
                                  <FiEdit className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(mcq._id)}
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
                            No MCQs found. Create your first MCQ to get started.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Edit MCQ Modal */}
            {isModalOpen && (
              <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[10000] p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                >
                  <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">
                      {editingMcq._id ? "Edit MCQ" : "Create New MCQ"}
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Question *
                        </label>
                        <textarea
                          value={editingMcq.question}
                          onChange={(e) =>
                            setEditingMcq({
                              ...editingMcq,
                              question: e.target.value,
                            })
                          }
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Options *
                        </label>
                        <div className="space-y-2">
                          {editingMcq.options.map((option, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <input
                                type="radio"
                                checked={editingMcq.correctAnswer === index}
                                onChange={() =>
                                  setEditingMcq({
                                    ...editingMcq,
                                    correctAnswer: index,
                                  })
                                }
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateOption(index, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder={`Option ${index + 1}`}
                              />
                              {editingMcq.options.length > 2 && (
                                <button
                                  onClick={() => removeOption(index)}
                                  className="text-red-500 hover:text-red-700 p-2"
                                >
                                  <FiX />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            onClick={addNewOption}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                          >
                            <FiPlus /> Add Option
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Explanation
                        </label>
                        <textarea
                          value={editingMcq.explanation || ""}
                          onChange={(e) =>
                            setEditingMcq({
                              ...editingMcq,
                              explanation: e.target.value,
                            })
                          }
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-500"
                          placeholder="Explanation for the correct answer"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Points *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={editingMcq.points}
                          onChange={(e) =>
                            setEditingMcq({
                              ...editingMcq,
                              points: parseInt(e.target.value) || 1,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-500"
                        />
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
                        onClick={() => handleSave(editingMcq)}
                        className="px-6 py-2 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700"
                        disabled={!editingMcq.question || !editingMcq.options.every(opt => opt.trim()) || editingMcq.correctAnswer === null}
                      >
                        {editingMcq._id ? "Update MCQ" : "Create MCQ"}
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

export default Mcqlist;