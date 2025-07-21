// src/components/Theader.js
import React, { useState, useEffect } from "react";
import { FiBell, FiSearch, FiMenu, FiX, FiUser, FiHelpCircle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import { 
  FiSettings, 
  FiLogOut,
  FiChevronRight 
} from "react-icons/fi";

const Theader = ({ toggleSidebar, isSidebarOpen }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  const [userData, setUserData] = useState({
    name: "Loading...",
    email: "",
    role: "",
    avatar: ""
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeacherProfile = async () => {
      try {
        const token = localStorage.getItem("teacherToken");
        if (!token) {
          navigate("/teacher");
          return;
        }

        const teacherId = JSON.parse(localStorage.getItem("teacherData"));

        const response = await axios.get(`${base_url}/api/teacher/teacher-profile/${teacherId._id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          const teacher = response.data.data;
          setUserData({
            name: teacher.name || "Teacher",
            email: teacher.email || "",
            role: "Professor",
            avatar: getInitials(teacher.name || "T")
          });
        }
      } catch (error) {
        console.error('Error fetching teacher profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherProfile();
  }, [navigate]);

  const getInitials = (name) => {
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.success(`Searching for: ${searchQuery}`);
    }
  };

  const handleLogout = () => {
    // Clear all teacher-related data from storage
    localStorage.removeItem("teacherToken");
    localStorage.removeItem("teacherData");
    toast.success("Logged out successfully");
    navigate("/teacher");
    setShowLogoutModal(false);
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 left-0 border-gray-200">
      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[1000]"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <FiLogOut className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Logout Confirmation</h3>
                <p className="text-sm text-gray-500 text-center mb-6">
                  Are you sure you want to logout from your account?
                </p>
                <div className="flex justify-center space-x-4 w-full">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left section - Sidebar toggle and search */}
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none"
            >
              <FiMenu className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile search toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="p-1 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none"
            >
              {showMobileSearch ? <FiX className="h-6 w-6" /> : <FiSearch className="h-6 w-6" />}
            </button>
          </div>

          {/* Right section - Navigation icons */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-1 rounded-full text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none relative"
              >
                <FiBell className="h-6 w-6" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="origin-top-right absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                  >
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
                      </div>
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 text-sm ${!notification.read ? "bg-blue-50" : ""}`}
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0">
                                <div className="h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                  {notification.icon}
                                </div>
                              </div>
                              <div className="ml-3">
                                <p className="text-gray-700">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {notification.time}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-center text-gray-500">
                          No new notifications
                        </div>
                      )}
                      {notifications.length > 0 && (
                        <div className="border-t border-gray-200 px-4 py-2 text-center">
                          <button className="text-xs text-blue-600 hover:text-blue-800">
                            Mark all as read
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User dropdown */}
            <div className="relative ml-3">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center text-sm rounded-full focus:outline-none"
                id="user-menu"
              >
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                  {userData.avatar}
                </div>
                <span className="hidden md:inline ml-2 text-sm font-medium text-gray-700">
                  {loading ? "Loading..." : userData.name}
                </span>
              </button>

              <AnimatePresence>
                {showUserDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white border-[1px] border-gray-200 focus:outline-none z-50 divide-y divide-gray-100"
                  >
                    <div className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {userData.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {userData.email}
                      </p>
                    </div>
                    
                    <div className="py-1">
                      <button
                     
                        className="flex justify-between items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <FiUser className="h-4 w-4 mr-3 text-gray-400" />
                          Your Profile
                        </div>
                        <FiChevronRight className="h-4 w-4 text-gray-400" />
                      </button>
                      
                      <button
                        onClick={() => navigate("/teacher/settings")}
                        className="flex justify-between items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <FiSettings className="h-4 w-4 mr-3 text-gray-400" />
                          Settings
                        </div>
                        <FiChevronRight className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                    
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          setShowLogoutModal(true);
                        }}
                        className="flex justify-between items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <FiLogOut className="h-4 w-4 mr-3 text-gray-400" />
                          Sign out
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile search */}
        {/* <AnimatePresence>
          {showMobileSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden py-3"
            >
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowMobileSearch(false)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <FiX className="h-5 w-5 text-gray-400" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence> */}
      </div>
    </header>
  );
};

export default Theader;