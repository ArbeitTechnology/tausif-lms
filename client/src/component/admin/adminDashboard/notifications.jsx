import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  FiCheckCircle,
  FiXCircle,
  FiUser,
  FiMail,
  FiBook,
  FiFileText,
  FiDownload,
  FiClock,
  FiChevronDown,
} from "react-icons/fi";

const Notifications = ({ setNotificationCount }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // Format date without date-fns
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        "http://localhost:3500/api/auth/notifications",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNotifications(data.notifications || []); // Ensure it's always an array
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load notifications",
        {
          style: {
            background: "#fff",
            color: "#000",
            border: "1px solid #e5e7eb",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          },
          iconTheme: {
            primary: "#ff0000", // bright red
            secondary: "#ffffff", // white
          },
        }
      );
    } finally {
      // Always stop loading
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleApproval = async (teacherId) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.patch(
        `http://localhost:3500/api/auth/teacher-status/${teacherId}`,
        { status: "approved" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        toast.success("Teacher approved successfully!", {
          style: {
            background: "#fff",
            color: "#000",
            border: "1px solid #e5e7eb",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          },
          iconTheme: {
            primary: "#000",
            secondary: "#fff",
          },
        });

        // Optimistically update notifications instead of refetching
        setNotifications((prev) =>
          prev.filter((teacher) => teacher.id !== teacherId)
        );

        // Update notification count
        setNotificationCount((prev) => (prev > 0 ? prev - 1 : 0));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error approving teacher", {
        style: {
          background: "#fff",
          color: "#000",
          border: "1px solid #e5e7eb",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        },
        iconTheme: {
          primary: "#ff0000", // bright red
          secondary: "#ffffff", // white
        },
      });
    }
  };

  const handleRejection = async () => {
    if (!selectedTeacher) return;

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.patch(
        `http://localhost:3500/api/auth/teacher-status/${selectedTeacher.id}`,
        {
          status: "rejected",
          rejectionReason: rejectionReason || "Not specified",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        toast.success("Teacher rejected successfully!", {
          style: {
            background: "#fff",
            color: "#000",
            border: "1px solid #e5e7eb",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          },
          iconTheme: {
            primary: "#000",
            secondary: "#fff",
          },
        });

        // Remove the rejected teacher from notifications
        setNotifications((prev) =>
          prev.filter((teacher) => teacher.id !== selectedTeacher.id)
        );

        setRejectionReason("");
        setSelectedTeacher(null);
        setIsModalOpen(false);
        setNotificationCount((prev) => (prev > 0 ? prev - 1 : 0));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error rejecting teacher", {
        style: {
          background: "#fff",
          color: "#000",
          border: "1px solid #e5e7eb",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        },
        iconTheme: {
          primary: "#ff0000", // bright red
          secondary: "#ffffff", // white
        },
      });
    }
  };

  const viewTeacherDetails = (teacher) => {
    setSelectedTeacher(teacher);
    setIsModalOpen(true);
  };
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };
  const downloadFile = (url) => {
    window.open(`http://localhost:3500/${url}`, "_blank");
  };
  const downloadCertificate = (certificateUrl) => {
    window.open(`http://localhost:3500/${certificateUrl}`, "_blank");
  };
  return (
    <div className="p-6">
      <div className="p-2  mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 pb-4 mb-8 border-b border-gray-200">
          Pending Teacher Approvals
        </h2>
        <div className="bg-white rounded-xl shadow-md max-w-full">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 text-lg">
                No pending teacher registrations
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((teacher) => (
                <div
                  key={teacher.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {teacher.profilePhoto ? (
                        <img
                          src={`http://localhost:3500/uploads/teachers/${teacher.profilePhoto}`}
                          alt="Profile"
                          className="w-16 h-16 object-cover rounded-full border-4 border-white shadow-lg transition-all duration-300 hover:scale-110"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-500 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110">
                          <FiUser className="text-white text-2xl" />
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-lg">
                            {teacher.name}
                          </h3>
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                            Pending
                          </span>
                        </div>

                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <FiMail className="mr-1" />
                          <span>{teacher.email}</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <FiBook className="mr-1" />
                          <span>{teacher.specialization}</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <FiClock className="mr-1" />
                          <span>
                            Applied on {formatDate(teacher.createdAt)}
                          </span>
                        </div>

                        <div className="mt-2 flex space-x-2">
                          <button
                            onClick={() => downloadFile(teacher.cv)}
                            className="text-xs flex items-center text-black bg-white p-2 rounded-full transition-all duration-300 transform group hover:bg-gray-100"
                          >
                            <FiFileText className="mr-1 text-black text-lg transition-colors duration-300" />
                            View CV
                            <FiDownload className="ml-2 mr-1 text-black transition-all duration-300 transform group-hover:scale-110" />
                          </button>

                          {teacher.certificates?.length > 0 && (
                            <div className="relative">
                              <button
                                onClick={toggleDropdown}
                                className="text-xs flex items-center text-black bg-white p-2 rounded-full transition-all duration-300 transform group hover:bg-gray-100"
                              >
                                <FiFileText className="mr-1 text-black text-lg transition-colors duration-300" />
                                View Certificates
                                <span className="ml-1 text-sm transition-all duration-300">
                                  ({teacher.certificates.length})
                                </span>
                                <FiChevronDown className="mr-1 text-black transition-all duration-300 transform group-hover:rotate-180 group-hover:scale-110" />
                              </button>

                              {isDropdownOpen &&
                                teacher.certificates.length > 0 && (
                                  <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md border border-gray-200 z-10">
                                    {teacher.certificates.map((cert, index) => (
                                      <button
                                        key={index}
                                        onClick={() =>
                                          downloadCertificate(cert)
                                        }
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
                                      >
                                        Certificate {index + 1}
                                      </button>
                                    ))}
                                  </div>
                                )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleApproval(teacher.id)}
                        className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-full transition-colors"
                        title="Approve"
                      >
                        <FiCheckCircle size={20} />
                      </button>
                      <button
                        onClick={() => viewTeacherDetails(teacher)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                        title="Reject"
                      >
                        <FiXCircle size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Rejection Modal */}
          {isModalOpen && selectedTeacher && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-medium mb-4">
                  Reject {selectedTeacher.name}'s Application
                </h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Rejection (Optional)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Provide reason for rejection..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setRejectionReason("");
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRejection}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
