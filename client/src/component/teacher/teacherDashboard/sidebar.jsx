/* eslint-disable no-unused-vars */
// src/components/Sidebar.js
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
  FiBook,
  FiFileText,
  FiEdit,
  FiList,
} from "react-icons/fi";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [teacherData, setTeacherData] = useState({
    name: "Loading...",
    email: "loading...@example.com",
    avatarColor: "bg-gradient-to-r from-blue-600 to-blue-400",
  });
  const [loading, setLoading] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const baseNavItems = [
    {
      name: "Dashboard",
      icon: <FiHome size={18} />,
      path: "/teacher/dashboard",
    },
    {
      name: "Courses",
      icon: <FiBook size={18} />,
      children: [
        {
          name: "Create Course",
          icon: <FiEdit size={16} />,
          path: "/teacher/courses/create",
        },
        {
          name: "Course List",
          icon: <FiList size={16} />,
          path: "/teacher/course-list",
        },
      ],
    },
    // {
    //   name: "Assessments",
    //   icon: <FiFileText size={18} />,
    //   children: [
    //     { name: "Create MCQ", icon: <FiEdit size={16} />, path: "/teacher/create-mcq" },
    //     { name: "MCQ List", icon: <FiList size={16} />, path: "/teacher/mcq-list" },
    //     { name: "Create Question", icon: <FiEdit size={16} />, path: "/teacher/create-question" },
    //     { name: "Question List", icon: <FiList size={16} />, path: "/teacher/question-list" },
    //   ],
    // },
    {
      name: "notifications",
      icon: (
        <div className="relative">
          <FiBell size={18} />
          <span className="animate-ping absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 opacity-75"></span>
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-[10px] text-white">
            0
          </span>
        </div>
      ),
      path: "/teacher/notifications",
    },
    {
      name: "settings",
      icon: <FiSettings size={18} />,
      path: "/teacher/settings",
    },
  ];

  const toggleMenu = (menuName) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("teacherData");
    toast.success("Logged out successfully");
    setTimeout(() => {
      navigate("/teacher", { replace: true });
    }, 800);
  };

  // Auto-close menus when sidebar collapses
  useEffect(() => {
    if (!isOpen) {
      setExpandedMenus({});
    }
  }, [isOpen]);

  return (
    <aside
      className={`
      bg-white h-full flex flex-col border-r border-gray-200 shadow-sm overflow-hidden
      transition-all duration-300 ease-in-out ${isOpen ? "w-72" : "w-0"}
    `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 h-16">
        <h1 className="text-xl font-semibold text-gray-800 animate-fade-in">
          Teacher Portal
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {baseNavItems.map((item) => (
            <li key={item.name}>
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`
                      flex items-center justify-between w-full px-3 cursor-pointer py-2.5 mb-2 rounded-md
                      transition-all duration-200 ease-in-out hover:scale-[1.01] active:scale-[0.99]
                      ${
                        expandedMenus[item.name]
                          ? "bg-blue-600 text-white"
                          : "text-gray-600 hover:bg-gray-50"
                      }
                    `}
                  >
                    <div className="flex items-center">
                      <span
                        className={`
                        w-6 h-6 flex items-center justify-center
                        ${
                          expandedMenus[item.name]
                            ? "text-white"
                            : "text-gray-500"
                        }
                      `}
                      >
                        {item.icon}
                      </span>
                      {isOpen && (
                        <span className="ml-3 font-medium text-sm">
                          {item.name}
                        </span>
                      )}
                    </div>
                    {isOpen &&
                      (expandedMenus[item.name] ? (
                        <FiChevronUp className="text-white" />
                      ) : (
                        <FiChevronDown className="text-gray-500" />
                      ))}
                  </button>

                  {expandedMenus[item.name] && isOpen && (
                    <ul className="overflow-hidden transition-all duration-200 ease-in-out pl-9">
                      {item.children.map((child) => (
                        <li key={child.name}>
                          <button
                            onClick={() => navigate(child.path)}
                            className={`
                              flex items-center cursor-pointer text-xs md:text-sm py-2.5 px-3 w-full text-left 
                              rounded-md transition-all duration-150 ease-in-out font-[600] text-gray-700 hover:text-blue-600 hover:translate-x-1
                              ${
                                location.pathname === child.path
                                  ? "text-blue-500"
                                  : ""
                              }
                            `}
                          >
                            <span className="mr-2">{child.icon}</span>
                            {child.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <button
                  onClick={() => navigate(item.path)}
                  className={`
                    flex items-center w-full px-3 py-2.5 mb-2 rounded-md
                    transition-all duration-200 ease-in-out cursor-pointer hover:scale-[1.01] active:scale-[0.99]
                    ${
                      location.pathname === item.path
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    }
                  `}
                >
                  <span
                    className={`
                    w-6 h-6 flex items-center justify-center
                    ${
                      location.pathname === item.path
                        ? "text-white"
                        : "text-gray-500"
                    }
                  `}
                  >
                    {item.icon}
                  </span>
                  {isOpen && (
                    <span className="ml-3 font-medium text-sm">
                      {item.name}
                    </span>
                  )}
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden w-full max-w-sm border border-gray-200 animate-modal-pop">
            <div className="p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                <FiLogOut className="h-5 w-5 text-gray-700" />
              </div>

              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Confirm Sign Out
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to sign out of your account?
              </p>

              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2 text-sm font-medium rounded-md bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all duration-150 hover:scale-105 active:scale-95"
                >
                  Cancel
                </button>

                <button
                  onClick={confirmLogout}
                  className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-all duration-150 hover:scale-105 active:scale-95"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
