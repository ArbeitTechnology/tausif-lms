/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  FiHome,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiBell,
  FiChevronDown,
  FiChevronUp,
  FiLogOut,
  FiLayers,
} from "react-icons/fi";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ activeView, setActiveView }) => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const studentdata = JSON.parse(localStorage.getItem("studentData"));
  const studentToken = localStorage.getItem("studentToken");
  const [isOpen, setIsOpen] = useState(true);
  const [studentData, setStudentData] = useState({
    name: "",
    email: "",
    avatarColor: "bg-gradient-to-r from-purple-500 to-pink-500",
  });
  const [loading, setLoading] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        // Fetch student profile data
        const response = await axios.get(
          `${base_url}/api/student/profile/${studentdata.id}`, // Use your actual backend URL
          {
            headers: {
              Authorization: `Bearer ${studentToken}`,
            },
          }
        );
        console.log(response.data);
        const gradients = [
          "bg-gradient-to-r from-purple-500 to-pink-500",
          "bg-gradient-to-r from-blue-500 to-teal-400",
          "bg-gradient-to-r from-amber-500 to-pink-500",
          "bg-gradient-to-r from-emerald-500 to-blue-500",
          "bg-gradient-to-r from-violet-500 to-fuchsia-500",
        ];
        const randomGradient =
          gradients[Math.floor(Math.random() * gradients.length)];

        setStudentData({
          name: response.data.student.full_name,
          email: response.data.student.email,
          avatarColor: randomGradient,
          // Add additional student data you want to display
          ...response.data.student,
        });

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch student data:", err);
        toast.error("Failed to load student data");
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  const studentInitial = studentData.name.charAt(0).toUpperCase();

  const baseNavItems = [
    { name: "dashboard", icon: <FiHome />, component: "dashboard" },
    {
      name: "Courses",
      icon: <FiLayers />,
      children: [
        { name: "Course List", component: "courseList" },
        { name: "Course Cart", component: "cart" },
        { name: "My Courses", component: "myCourses" },
      ],
    },
    {
      name: "notifications",
      icon: (
        <div className="relative">
          <FiBell />

          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white"
          >
            0
          </motion.span>
        </div>
      ),
      component: "notifications",
    },
    { name: "settings", icon: <FiSettings />, component: "settings" },
  ];

  const toggleMenu = (menuName) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const handleToggleSidebar = () => {
    if (isOpen) {
      setExpandedMenus({});
    }
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("student");
    toast.success("Logout successful!");
    setTimeout(() => {
      navigate("/", { replace: true });
    }, 800);
  };

  return (
    <motion.aside
      initial={{ width: isOpen ? 256 : 80 }}
      animate={{ width: isOpen ? 256 : 80 }}
      transition={{ type: "spring", damping: 20 }}
      className={`bg-gradient-to-b from-gray-50 to-gray-100 h-full flex flex-col border-r border-gray-200 shadow-xl overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 h-16">
        {isOpen ? (
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl font-bold text-black"
          >
            Student Portal
          </motion.h1>
        ) : (
          <div
            className={`w-8 h-8 rounded-full ${studentData.avatarColor} text-white flex items-center justify-center font-bold shadow-md`}
          >
            {studentInitial}
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleToggleSidebar}
          className="p-0.7 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors"
        >
          {isOpen ? <FiChevronLeft /> : <FiChevronRight />}
        </motion.button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {baseNavItems.map((item) => (
            <li key={item.name}>
              {item.children ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleMenu(item.name)}
                    className={`flex items-center justify-between w-full p-4 rounded-xl ${
                      expandedMenus[item.name]
                        ? "bg-gray-200 text-gray-900"
                        : "text-gray-700 hover:bg-gray-200"
                    } transition-colors`}
                  >
                    <div className="flex items-center">
                      <span className="w-5 h-5 flex items-center justify-center">
                        {item.icon}
                      </span>
                      {isOpen && (
                        <span className="ml-3 capitalize font-medium">
                          {item.name}
                        </span>
                      )}
                    </div>
                    {isOpen &&
                      (expandedMenus[item.name] ? (
                        <FiChevronUp />
                      ) : (
                        <FiChevronDown />
                      ))}
                  </motion.button>

                  <AnimatePresence>
                    {expandedMenus[item.name] && isOpen && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        {item.children.map((child) => (
                          <motion.li key={child.name} whileHover={{ x: 5 }}>
                            <button
                              onClick={() => setActiveView(child.component)}
                              className={`text-sm py-2.5 px-8 w-full text-left rounded-md transition-colors ${
                                activeView === child.component
                                  ? "bg-gray-800 text-white font-medium shadow-sm"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              {child.name}
                            </button>
                          </motion.li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveView(item.component)}
                  className={`flex items-center w-full p-4 rounded-xl transition-all ${
                    activeView === item.component
                      ? "bg-gray-900 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span className="w-5 h-5 flex items-center justify-center">
                    {item.icon}
                  </span>
                  {isOpen && (
                    <span className="ml-3 capitalize font-medium">
                      {item.name}
                    </span>
                  )}
                </motion.button>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer Profile */}
      <div className="p-4 border-t border-gray-200">
        <motion.div
          className="flex items-center"
          whileHover={isOpen ? { scale: 1.01 } : {}}
        >
          <div
            className={`w-10 h-10 rounded-full ${studentData.avatarColor} text-white flex items-center justify-center font-bold shadow-md`}
          >
            {studentInitial}
          </div>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="ml-3"
            >
              <p className="text-sm font-medium text-gray-900 truncate max-w-[160px]">
                {studentData.name}
              </p>
              <p className="text-xs text-gray-500 truncate max-w-[160px]">
                {studentData.email}
              </p>
              <motion.button
                whileHover={{ x: 2 }}
                onClick={handleLogout}
                className="flex items-center text-xs text-red-500 hover:text-red-700 mt-1 transition-colors"
              >
                <FiLogOut className="mr-1" /> Logout
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden w-full max-w-md border border-gray-200 dark:border-gray-700"
          >
            <div className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <FiLogOut className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </div>

              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Ready to leave?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to sign out of your account?
              </p>

              <div className="flex justify-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-5 py-2.5 text-sm font-medium rounded-lg bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-all shadow-sm"
                >
                  Cancel
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmLogout}
                  className="px-5 py-2.5 text-sm font-medium rounded-lg bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-all shadow-sm"
                >
                  Logout
                </motion.button>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 text-xs text-gray-500 dark:text-gray-400 text-center border-t border-gray-200 dark:border-gray-700">
              Session will be securely terminated
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.aside>
  );
};

export default Sidebar;
