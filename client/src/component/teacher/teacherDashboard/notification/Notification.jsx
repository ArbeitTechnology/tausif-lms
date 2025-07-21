import React, { useState, useEffect } from "react";

import { FiBell, FiCheckCircle, FiAlertCircle, FiInfo, FiX, FiFilter } from "react-icons/fi";
import Sidebar from "../sidebar";
import Theader from "../common/Theader";

const Notification = () => {
  const [activeView, setActiveView] = useState("notifications");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Fetch notifications (mock data)
  useEffect(() => {
    const fetchNotifications = () => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const mockNotifications = [
          {
            id: 1,
            title: "New assignment posted",
            message: "Math homework due Friday has been posted",
            type: "assignment",
            date: "2023-06-15T10:30:00",
            read: false
          },
          {
            id: 2,
            title: "Grade updated",
            message: "Your grade for Science test has been updated",
            type: "grade",
            date: "2023-06-14T14:15:00",
            read: true
          },
          {
            id: 3,
            title: "Class canceled",
            message: "History class on June 16th has been canceled",
            type: "alert",
            date: "2023-06-13T09:45:00",
            read: false
          },
          {
            id: 4,
            title: "School event reminder",
            message: "Parent-teacher meeting scheduled for next week",
            type: "info",
            date: "2023-06-12T16:20:00",
            read: true
          },
          {
            id: 5,
            title: "Library book due",
            message: "Your borrowed book 'Introduction to React' is due tomorrow",
            type: "reminder",
            date: "2023-06-11T11:10:00",
            read: false
          }
        ];
        setNotifications(mockNotifications);
        setLoading(false);
      }, 800);
    };

    fetchNotifications();
  }, []);

  const markAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      read: true
    })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const filteredNotifications = filter === "all" 
    ? notifications 
    : notifications.filter(notification => notification.type === filter);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "assignment":
        return <FiCheckCircle className="text-blue-500" size={20} />;
      case "alert":
        return <FiAlertCircle className="text-red-500" size={20} />;
      case "grade":
        return <FiCheckCircle className="text-green-500" size={20} />;
      default:
        return <FiInfo className="text-gray-500" size={20} />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="flex w-full h-screen bg-white overflow-hidden">
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

          <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <FiBell className="mr-2" /> Notifications
              </h1>
              <div className="flex space-x-2">
                <div className="relative">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Notifications</option>
                    <option value="assignment">Assignments</option>
                    <option value="grade">Grades</option>
                    <option value="alert">Alerts</option>
                    <option value="info">Information</option>
                  </select>
                  <FiFilter className="absolute right-3 top-2.5 text-gray-400" size={16} />
                </div>
                <button
                  onClick={markAllAsRead}
                  className="px-3 py-2 bg-blue-50 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  Mark all as read
                </button>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="p-4 border border-gray-200 rounded-lg bg-white animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <FiBell className="mx-auto text-gray-400" size={48} />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No notifications</h3>
                <p className="mt-1 text-sm text-gray-500">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg transition-all duration-200 ${
                      notification.read
                        ? 'bg-white border-gray-200'
                        : 'bg-blue-50 border-blue-200'
                    } hover:shadow-sm`}
                  >
                    <div className="flex items-start">
                      <div className="mt-1 mr-3">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className={`font-medium ${
                            notification.read ? 'text-gray-700' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </h3>
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <FiX size={18} />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">
                            {formatDate(notification.date)}
                          </span>
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification;