import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiTrash2, FiSave, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import Sidebar from '../sidebar';
import Theader from '../common/Theader';

const CreateMCQ = () => {
  const navigate = useNavigate();
    const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [mcqs, setMcqs] = useState([
    {
      question: '',
      options: ['', ''],
      correctAnswer: null,
      category: 'General',
      difficulty: 'Medium',
      explanation: '',
      points: 1,
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState(0);
  const [activeView, setActiveView] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Add sidebar state
  // Toggle sidebar function
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  // Handler functions
  const handleAddMCQ = () => {
    const newMcq = {
      question: '',
      options: ['', ''],
      correctAnswer: null,
      category: 'General',
      difficulty: 'Medium',
      explanation: '',
      points: 1,
    };
    setMcqs([...mcqs, newMcq]);
    setActiveAccordion(mcqs.length);
  };

  const handleRemoveMCQ = (index) => {
    if (mcqs.length === 1) {
      toast.error('You must have at least one MCQ');
      return;
    }
    const newMcqs = [...mcqs];
    newMcqs.splice(index, 1);
    setMcqs(newMcqs);
    setActiveAccordion(Math.min(index, newMcqs.length - 1));
  };

  const handleQuestionChange = (index, value) => {
    const newMcqs = [...mcqs];
    newMcqs[index].question = value;
    setMcqs(newMcqs);
  };

  const handleOptionChange = (mcqIndex, optionIndex, value) => {
    const newMcqs = [...mcqs];
    newMcqs[mcqIndex].options[optionIndex] = value;
    setMcqs(newMcqs);
  };

  const handleAddOption = (mcqIndex) => {
    if (mcqs[mcqIndex].options.length >= 5) {
      toast.error('Maximum 5 options allowed');
      return;
    }
    const newMcqs = [...mcqs];
    newMcqs[mcqIndex].options.push('');
    setMcqs(newMcqs);
  };

  const handleRemoveOption = (mcqIndex, optionIndex) => {
    if (mcqs[mcqIndex].options.length <= 2) {
      toast.error('Minimum 2 options required');
      return;
    }
    const newMcqs = [...mcqs];
    newMcqs[mcqIndex].options.splice(optionIndex, 1);
    
    if (newMcqs[mcqIndex].correctAnswer === optionIndex) {
      newMcqs[mcqIndex].correctAnswer = null;
    } else if (newMcqs[mcqIndex].correctAnswer > optionIndex) {
      newMcqs[mcqIndex].correctAnswer -= 1;
    }
    
    setMcqs(newMcqs);
  };

  const handleCorrectAnswerChange = (mcqIndex, optionIndex) => {
    const newMcqs = [...mcqs];
    newMcqs[mcqIndex].correctAnswer = optionIndex;
    setMcqs(newMcqs);
  };

  const handleCategoryChange = (mcqIndex, value) => {
    const newMcqs = [...mcqs];
    newMcqs[mcqIndex].category = value;
    setMcqs(newMcqs);
  };

  const handleDifficultyChange = (mcqIndex, value) => {
    const newMcqs = [...mcqs];
    newMcqs[mcqIndex].difficulty = value;
    setMcqs(newMcqs);
  };

  const handleExplanationChange = (mcqIndex, value) => {
    const newMcqs = [...mcqs];
    newMcqs[mcqIndex].explanation = value;
    setMcqs(newMcqs);
  };

  const handlePointsChange = (mcqIndex, value) => {
    const newMcqs = [...mcqs];
    newMcqs[mcqIndex].points = parseInt(value) || 0;
    setMcqs(newMcqs);
  };

  const validateMCQs = () => {
    for (let i = 0; i < mcqs.length; i++) {
      const mcq = mcqs[i];
      
      if (!mcq.question.trim()) {
        toast.error(`Question ${i + 1}: Please enter a question`);
        return false;
      }
      
      if (mcq.correctAnswer === null) {
        toast.error(`Question ${i + 1}: Please select a correct answer`);
        return false;
      }
      
      for (let j = 0; j < mcq.options.length; j++) {
        if (!mcq.options[j].trim()) {
          toast.error(`Question ${i + 1}: Option ${j + 1} cannot be empty`);
          return false;
        }
      }

      if (mcq.points <= 0) {
        toast.error(`Question ${i + 1}: Points must be greater than 0`);
        return false;
      }
    }
    return true;
  };

const handleSubmit = async () => {
  if (!validateMCQs()) return;
  
  setIsSubmitting(true);
  try {
    // Get the token from wherever you store it (localStorage, cookies, etc.)
    const token = localStorage.getItem('token'); // or your preferred storage method
    
    // Process MCQs sequentially
    for (const mcq of mcqs) {
      await axios.post(`${base_url}/api/teacher/create-mcq`, {
        question: mcq.question,
        options: mcq.options,
        correctAnswer: mcq.correctAnswer,
        category: mcq.category,
        difficulty: mcq.difficulty,
        explanation: mcq.explanation,
        points: mcq.points,
        user_id: JSON.parse(localStorage.getItem("teacherData"))._id // Pass teacher ID
      }, {
        headers: {
        Authorization: `Bearer ${localStorage.getItem("teacherToken")}`,
        }
      });
    }
    
    toast.success(`${mcqs.length} MCQs created successfully!`);
    setMcqs([
      {
        question: '',
        options: ['', ''],
        correctAnswer: null,
        category: 'General',
        difficulty: 'Medium',
        explanation: '',
        points: 1,
      },
    ]);
  } catch (error) {
    console.error('Error creating MCQs:', error);
    toast.error(error.response?.data?.error || 'Failed to create MCQs');
  } finally {
    setIsSubmitting(false);
  }
};

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  return (
        <div className="bg-gradient-to-br from-gray-100 to-gray-300 min-h-screen flex items-center justify-center">
      <div className="flex w-full h-[100vh] bg-white overflow-hidden">
        {/* Sidebar Section */}
        <Sidebar 
          activeView={activeView} 
          setActiveView={setActiveView} 
          isOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} // Pass toggle function
        />

        {/* Main Content Section */}
        <div className="flex-1 h-full overflow-auto ">
          <Theader 
            toggleSidebar={toggleSidebar} // Pass toggle function
            isSidebarOpen={isSidebarOpen} // Pass sidebar state
          />
         <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="w-full mx-auto">
   

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
                 <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create MCQ</h1>
          <p className="text-gray-600">Create multiple choice questions for student</p>
        </div>
          <div>
            <button
              onClick={handleAddMCQ}
              className="flex items-center gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg transition-colors"
            >
              <FiPlus className="h-5 w-5" />
              <span>Add Question</span>
            </button>
          </div>
     
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {mcqs.map((mcq, mcqIndex) => (
            <div key={mcqIndex} className="bg-white rounded-[5px] shadow-sm border border-gray-200 overflow-hidden">
              {/* Question Header */}
              <div 
                className="flex justify-between items-center p-5 cursor-pointer bg-gray-50 hover:bg-gray-100"
                onClick={() => toggleAccordion(mcqIndex)}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center">
                    {mcqIndex + 1}
                  </div>
                  <h3 className="font-medium text-gray-800">
                    {mcq.question || 'New Question'}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full font-[700] text-xs  ${
                    mcq.difficulty === 'Easy' ? 'bg-green-500 text-white' :
                    mcq.difficulty === 'Medium' ? 'bg-yellow-500 text-white' :
                    'bg-red-500 text-white'
                  }`}>
                    {mcq.difficulty}
                  </span>
                  <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    {mcq.points} point{mcq.points !== 1 ? 's' : ''}
                  </span>
                  <button className="text-gray-500 hover:text-red-500 cursor-pointer transition-colors">
                    {activeAccordion === mcqIndex ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                </div>
              </div>

              {/* Question Content */}
              {activeAccordion === mcqIndex && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-5 border-t border-gray-200"
                >
                  <div className="space-y-5">
                    {/* Question Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Text *
                      </label>
                      <textarea
                        value={mcq.question}
                        onChange={(e) => handleQuestionChange(mcqIndex, e.target.value)}
                        placeholder="Enter your question here"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-blue-500 transition-all"
                        rows={3}
                      />
                    </div>

                    {/* Options Section */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Answer Options *
                        </label>
                        <button
                          onClick={() => handleAddOption(mcqIndex)}
                          className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1"
                        >
                          <FiPlus className="h-4 w-4" />
                          Add Option
                        </button>
                      </div>

                      <div className="space-y-3">
                        {mcq.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-start gap-3">
                            <div className="flex items-center h-11">
                              <input
                                type="radio"
                                name={`correctAnswer-${mcqIndex}`}
                                checked={mcq.correctAnswer === optionIndex}
                                onChange={() => handleCorrectAnswerChange(mcqIndex, optionIndex)}
                                className="h-4 w-4 text-blue-600 border-gray-300 outline-blue-500 focus:ring-blue-500"
                              />
                            </div>
                            <div className="flex-1">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => handleOptionChange(mcqIndex, optionIndex, e.target.value)}
                                placeholder={`Option ${optionIndex + 1}`}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-blue-500 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            {mcq.options.length > 2 && (
                              <button
                                onClick={() => handleRemoveOption(mcqIndex, optionIndex)}
                                className="text-gray-400 hover:text-red-500 cursor-pointer p-2 transition-colors"
                                title="Remove option"
                              >
                                <FiX className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Meta Section */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <select
                          value={mcq.category}
                          onChange={(e) => handleCategoryChange(mcqIndex, e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-blue-500 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="General">General</option>
                          <option value="Science">Science</option>
                          <option value="History">History</option>
                          <option value="Mathematics">Mathematics</option>
                          <option value="Technology">Technology</option>
                          <option value="Language">Language</option>
                          <option value="Business">Business</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Difficulty *
                        </label>
                        <select
                          value={mcq.difficulty}
                          onChange={(e) => handleDifficultyChange(mcqIndex, e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-blue-500 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Points *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={mcq.points}
                          onChange={(e) => handlePointsChange(mcqIndex, e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-blue-500 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Explanation (Optional)
                        </label>
                        <input
                          type="text"
                          value={mcq.explanation}
                          onChange={(e) => handleExplanationChange(mcqIndex, e.target.value)}
                          placeholder="Explain why this answer is correct"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-blue-500 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Delete Button */}
                    <div className="flex justify-end pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleRemoveMCQ(mcqIndex)}
                        className="flex items-center gap-2 text-red-600 cursor-pointer hover:text-red-800"
                      >
                        <FiTrash2 className="h-5 w-5" />
                        <span>Remove Question</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Action Buttons */}
        {mcqs.length > 0 && (
          <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
            <div className="text-gray-500 text-sm">
              {mcqs.length} question{mcqs.length !== 1 ? 's' : ''} in this assessment
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddMCQ}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg transition-colors shadow-md"
              >
                <FiPlus className="h-5 w-5" />
                <span>Add Another Question</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <FiSave className="h-5 w-5" />
                <span>{isSubmitting ? 'Saving...' : 'Save Assessment'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
        </div>
      </div>
    </div>

  );
};

export default CreateMCQ;