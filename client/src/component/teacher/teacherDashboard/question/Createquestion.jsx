import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiTrash2, FiSave, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import Sidebar from '../sidebar';
import Theader from '../common/Theader';

const Createquestion = () => {
  const navigate = useNavigate();
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
    const [activeView, setActiveView] = useState("dashboard");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Add sidebar state
    // Toggle sidebar function
    const toggleSidebar = () => {
      setIsSidebarOpen(!isSidebarOpen);
    };
  const [cqs, setCqs] = useState([
    {
      title: '',
      content: '',
      type: 'block',
      number: 1,
      tags: [],
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState(0);
  const [newTag, setNewTag] = useState('');

  // Handler functions
  const handleAddCQ = () => {
    const newCq = {
      title: '',
      content: '',
      type: 'block',
      number: cqs.length + 1,
      tags: [],
    };
    setCqs([...cqs, newCq]);
    setActiveAccordion(cqs.length);
  };

  const handleRemoveCQ = (index) => {
    if (cqs.length === 1) {
      toast.error('You must have at least one question');
      return;
    }
    const newCqs = [...cqs];
    newCqs.splice(index, 1);
    // Update question numbers
    const updatedCqs = newCqs.map((cq, i) => ({
      ...cq,
      number: i + 1
    }));
    setCqs(updatedCqs);
    setActiveAccordion(Math.min(index, updatedCqs.length - 1));
  };

  const handleTitleChange = (index, value) => {
    const newCqs = [...cqs];
    newCqs[index].title = value;
    setCqs(newCqs);
  };

  const handleContentChange = (index, value) => {
    const newCqs = [...cqs];
    newCqs[index].content = value;
    setCqs(newCqs);
  };

  const handleTypeChange = (index, value) => {
    const newCqs = [...cqs];
    newCqs[index].type = value;
    setCqs(newCqs);
  };

  const handleAddTag = (index) => {
    if (!newTag.trim()) return;
    if (cqs[index].tags.length >= 5) {
      toast.error('Maximum 5 tags allowed');
      return;
    }
    if (cqs[index].tags.includes(newTag.trim())) {
      toast.error('Tag already exists');
      return;
    }
    
    const newCqs = [...cqs];
    newCqs[index].tags.push(newTag.trim());
    setCqs(newCqs);
    setNewTag('');
  };

  const handleRemoveTag = (index, tagIndex) => {
    const newCqs = [...cqs];
    newCqs[index].tags.splice(tagIndex, 1);
    setCqs(newCqs);
  };

  const validateCQs = () => {
    for (let i = 0; i < cqs.length; i++) {
      const cq = cqs[i];
      
      if (!cq.title.trim()) {
        toast.error(`Question ${i + 1}: Please enter a title`);
        return false;
      }
      
      if (!cq.content.trim()) {
        toast.error(`Question ${i + 1}: Please enter content`);
        return false;
      }
      
      if (cq.title.length > 200) {
        toast.error(`Question ${i + 1}: Title cannot exceed 200 characters`);
        return false;
      }
      
      if (cq.content.length > 5000) {
        toast.error(`Question ${i + 1}: Content cannot exceed 5000 characters`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateCQs()) return;
    
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${base_url}/api/teacher/create-question`, { questions: cqs ,user_id:JSON.parse(localStorage.getItem("teacherData"))._id},{headers:{
                Authorization: `Bearer ${localStorage.getItem("teacherToken")}`,
      }});
      toast.success(`${cqs.length} question${cqs.length !== 1 ? 's' : ''} created successfully!`);
      setCqs([
        {
          title: '',
          content: '',
          type: 'block',
          number: 1,
          tags: [],
        },
      ]);
    } catch (error) {
      console.error('Error creating questions:', error);
      toast.error(error.response?.data?.message || 'Failed to create questions');
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
             {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Questions</h1>
          <p className="text-gray-600">Create question for your students</p>
        </div>
          <div className="">
            <button
              onClick={handleAddCQ}
              className="flex items-center gap-2 bg-blue-600 cursor-pointer hover:bg-blue-700 text-white px-5 py-3 rounded-lg transition-colors shadow-sm"
            >
              <FiPlus className="h-5 w-5" />
              <span>Add Question</span>
            </button>
          </div>
    
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {cqs.map((cq, cqIndex) => (
            <div key={cqIndex} className="bg-white rounded-[5px] border border-gray-200 overflow-hidden">
              {/* Question Header */}
              <div 
                className="flex justify-between items-center p-5 cursor-pointer bg-gray-50 hover:bg-gray-100"
                onClick={() => toggleAccordion(cqIndex)}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center">
                    {cq.number}
                  </div>
                  <h3 className="font-medium text-gray-800">
                    {cq.title || 'New Question'}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    cq.type === 'short' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
                  }`}>
                    {cq.type === 'short' ? 'Short Answer' : 'Block Answer'}
                  </span>
                  <button className="text-gray-500 hover:text-red-500 transition-colors">
                    {activeAccordion === cqIndex ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                </div>
              </div>

              {/* Question Content */}
              {activeAccordion === cqIndex && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-5 border-t border-gray-200"
                >
                  <div className="space-y-5">
                    {/* Title Input */}
                    <div>
                      <label className="block text-sm md:text-[15px] font-medium text-gray-700 mb-2">
                        Question Title *
                      </label>
                      <input
                        type="text"
                        value={cq.title}
                        onChange={(e) => handleTitleChange(cqIndex, e.target.value)}
                        placeholder="Enter question title"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-blue-500 transition-all"
                        maxLength={200}
                      />
                      <div className="text-xs text-gray-500 mt-1 text-right">
                        {cq.title.length}/200 characters
                      </div>
                    </div>

                    {/* Content Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Content *
                      </label>
                      <textarea
                        value={cq.content}
                        onChange={(e) => handleContentChange(cqIndex, e.target.value)}
                        placeholder="Enter the full question content"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-blue-500 transition-all"
                        rows={5}
                        maxLength={5000}
                      />
                      <div className="text-xs text-gray-500 mt-1 text-right">
                        {cq.content.length}/5000 characters
                      </div>
                    </div>

                    {/* Meta Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Question Type
                        </label>
                        <select
                          value={cq.type}
                          onChange={(e) => handleTypeChange(cqIndex, e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-blue-500 cursor-pointer"
                        >
                          <option value="block">Block Answer (Long form)</option>
                          <option value="short">Short Answer</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tags (Optional)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddTag(cqIndex)}
                            placeholder="Add tag and press Enter"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-blue-500"
                            maxLength={20}
                          />
                          <button
                            onClick={() => handleAddTag(cqIndex)}
                            className="bg-blue-600 text-white  px-3 rounded-lg cursor-pointer"
                          >
                            Add
                          </button>
                        </div>
                        {cq.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {cq.tags.map((tag, tagIndex) => (
                              <span 
                                key={tagIndex}
                                className="inline-flex items-center bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full"
                              >
                                {tag}
                                <button 
                                  onClick={() => handleRemoveTag(cqIndex, tagIndex)}
                                  className="ml-1 text-gray-500 hover:text-red-500"
                                >
                                  <FiX className="h-3 w-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delete Button */}
                    <div className="flex justify-end pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleRemoveCQ(cqIndex)}
                        className="flex items-center gap-2 cursor-pointer text-red-600 hover:text-red-800"
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
        {cqs.length > 0 && (
          <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
            <div className="text-gray-500 text-sm">
              {cqs.length} question{cqs.length !== 1 ? 's' : ''} in this assessment
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddCQ}
                className="flex items-center gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg transition-colors shadow-md"
              >
                <FiPlus className="h-5 w-5" />
                <span>Add Another Question</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 cursor-pointer bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <FiSave className="h-5 w-5" />
                <span>{isSubmitting ? 'Saving...' : 'Save Questions'}</span>
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

export default Createquestion;