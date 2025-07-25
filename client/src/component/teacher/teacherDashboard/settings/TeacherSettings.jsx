import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Sidebar from "../sidebar";
import Theader from "../common/Theader";
import { toast } from "react-toastify";

const TeacherSettings = () => {
  const [activeView, setActiveView] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  
  // Get teacher ID from localStorage
  const teacherData2 = JSON.parse(localStorage.getItem("teacherData"));
  const teacherId = teacherData2?._id;
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    specialization: "",
    qualifications: "",
    linkedin_url: "",
    hourly_rate: 0,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [documents, setDocuments] = useState([]);
  const [newDocument, setNewDocument] = useState({
    name: "",
    file: null
  });
  const [activeTab, setActiveTab] = useState("profile");
  const { id } = useParams();

  // Fetch teacher data
  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const response = await axios.get(`${base_url}/api/teacher/teacher-profile/${teacherId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("teacherToken")}`,
          }
        });
        setTeacherData(response.data.data);
        setFormData({
          full_name: response.data.data.full_name,
          phone: response.data.data.phone,
          specialization: response.data.data.specialization,
          qualifications: response.data.data.qualifications,
          linkedin_url: response.data.data.linkedin_url,
          hourly_rate: response.data.data.hourly_rate,
        });
        
        // Fetch documents if they exist
        if (response.data.data.documents) {
          setDocuments(response.data.data.documents);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching teacher data:", error);
        toast.error("Failed to load teacher profile");
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [id]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  const handleDocumentInputChange = (e) => {
    const { name, value } = e.target;
    setNewDocument({
      ...newDocument,
      [name]: value
    });
  };

  const handleDocumentFileChange = (e) => {
    setNewDocument({
      ...newDocument,
      file: e.target.files[0]
    });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${base_url}/api/teacher/update-profile/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("teacherToken")}`,
          }
        }
      );
      setTeacherData(response.data.data);
      setEditMode(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    try {
      await axios.put(
        `${base_url}/api/teacher/update-password/${id}`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("teacherToken")}`,
          }
        }
      );
      toast.success("Password updated successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error(
        error.response?.data?.message || "Failed to update password"
      );
    }
  };

  const handleProfilePhotoUpdate = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profile_photo", file);

    try {
      const response = await axios.put(
        `${base_url}/api/teacher/update-profile-photo/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("teacherToken")}`,
          }
        }
      );
      setTeacherData({
        ...teacherData,
        profile_photo: response.data.data.profile_photo,
      });
      toast.success("Profile photo updated successfully");
    } catch (error) {
      console.error("Error updating profile photo:", error);
      toast.error("Failed to update profile photo");
    }
  };

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    if (!newDocument.name || !newDocument.file) {
      toast.error("Please provide both document name and file");
      return;
    }

    const formData = new FormData();
    formData.append("name", newDocument.name);
    formData.append("document", newDocument.file);

    try {
      const response = await axios.post(
        `${base_url}/api/teacher/upload-document/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("teacherToken")}`,
          }
        }
      );
      
      setDocuments([...documents, response.data.document]);
      setNewDocument({
        name: "",
        file: null
      });
      toast.success("Document uploaded successfully");
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error(error.response?.data?.message || "Failed to upload document");
    }
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      await axios.delete(
        `${base_url}/api/teacher/delete-document/${id}/${documentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("teacherToken")}`,
          }
        }
      );
      
      setDocuments(documents.filter(doc => doc._id !== documentId));
      toast.success("Document deleted successfully");
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error(error.response?.data?.message || "Failed to delete document");
    }
  };

  return (
    <div className="bg-gray-50 p-[20px] flex items-center justify-center">
      <div className="flex w-full h-[94vh] rounded-[10px] border-[1px] border-gray-200 shadow-xl bg-white overflow-hidden">
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
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === "profile" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                  >
                    Profile Information
                  </button>
                  <button
                    onClick={() => setActiveTab("password")}
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === "password" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                  >
                    Password
                  </button>
                  <button
                    onClick={() => setActiveTab("documents")}
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === "documents" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                  >
                    Documents
                  </button>
                </nav>
              </div>
              
              <div className="p-6">
                {activeTab === "profile" ? (
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="relative mr-4">
                        <img
                          src={teacherData?.profile_photo || "/default-profile.png"}
                          alt="Profile"
                          className="w-20 h-20 rounded-full object-cover"
                        />
                        <label className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleProfilePhotoUpdate}
                          />
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                          </svg>
                        </label>
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">{teacherData?.full_name}</h2>
                        <p className="text-gray-600">{teacherData?.specialization} Teacher</p>
                      </div>
                    </div>

                    {editMode ? (
                      <form onSubmit={handleProfileUpdate}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                              type="text"
                              name="full_name"
                              value={formData.full_name}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input
                              type="text"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="+[country code][number]"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                            <input
                              type="text"
                              name="specialization"
                              value={formData.specialization}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
                            <input
                              type="number"
                              name="hourly_rate"
                              value={formData.hourly_rate}
                              onChange={handleInputChange}
                              min="10"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                          </div>
                        </div>
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Qualifications</label>
                          <textarea
                            name="qualifications"
                            value={formData.qualifications}
                            onChange={handleInputChange}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile</label>
                          <input
                            type="url"
                            name="linkedin_url"
                            value={formData.linkedin_url}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="https://www.linkedin.com/in/yourprofile"
                          />
                        </div>
                        <div className="flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={() => setEditMode(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Save Changes
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                            <p className="mt-1 text-sm text-gray-900">{teacherData?.full_name}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                            <p className="mt-1 text-sm text-gray-900">{teacherData?.phone}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Specialization</h3>
                            <p className="mt-1 text-sm text-gray-900">{teacherData?.specialization}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Hourly Rate</h3>
                            <p className="mt-1 text-sm text-gray-900">${teacherData?.hourly_rate}/hr</p>
                          </div>
                        </div>
                        <div className="mb-6">
                          <h3 className="text-sm font-medium text-gray-500">Qualifications</h3>
                          <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">{teacherData?.qualifications}</p>
                        </div>
                        {teacherData?.linkedin_url && (
                          <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-500">LinkedIn Profile</h3>
                            <a
                              href={teacherData.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                            >
                              {teacherData.linkedin_url}
                            </a>
                          </div>
                        )}
                        <div className="flex justify-end">
                          <button
                            onClick={() => setEditMode(true)}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Edit Profile
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : activeTab === "password" ? (
                  <form onSubmit={handlePasswordUpdate}>
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                          Current Password
                        </label>
                        <input
                          type="password"
                          id="currentPassword"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                          New Password
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                        <p className="mt-2 text-sm text-gray-500">
                          Password must be at least 8 characters and contain a number and special character.
                        </p>
                      </div>
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Update Password
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div>
                    <h2 className="text-lg font-medium mb-4">Your Documents</h2>
                    
                    <div className="mb-8">
                      <form onSubmit={handleDocumentUpload} className="space-y-4">
                        <div>
                          <label htmlFor="documentName" className="block text-sm font-medium text-gray-700">
                            Document Name
                          </label>
                          <input
                            type="text"
                            id="documentName"
                            name="name"
                            value={newDocument.name}
                            onChange={handleDocumentInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="documentFile" className="block text-sm font-medium text-gray-700">
                            Document File
                          </label>
                          <input
                            type="file"
                            id="documentFile"
                            name="file"
                            onChange={handleDocumentFileChange}
                            className="mt-1 block w-full text-sm text-gray-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-md file:border-0
                              file:text-sm file:font-semibold
                              file:bg-blue-50 file:text-blue-700
                              hover:file:bg-blue-100"
                            required
                          />
                          <p className="mt-1 text-sm text-gray-500">
                            Upload your certificates, diplomas, or other relevant documents (PDF, DOC, JPG, PNG)
                          </p>
                        </div>
                        
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Upload Document
                          </button>
                        </div>
                      </form>
                    </div>
                    
                    {documents.length > 0 ? (
                      <div className="space-y-4">
                        <h3 className="text-md font-medium">Uploaded Documents</h3>
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                          <table className="min-w-full divide-y divide-gray-300">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                  Document Name
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                  Type
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                  Upload Date
                                </th>
                                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                  <span className="sr-only">Actions</span>
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                              {documents.map((document) => (
                                <tr key={document._id}>
                                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                    {document.name}
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    {document.fileType}
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    {new Date(document.uploadDate).toLocaleDateString()}
                                  </td>
                                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                    <a
                                      href={`${base_url}/${document.filePath}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-900 mr-4"
                                    >
                                      View
                                    </a>
                                    <button
                                      onClick={() => handleDeleteDocument(document._id)}
                                      className="text-red-600 hover:text-red-900"
                                    >
                                      Delete
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            vectorEffect="non-scaling-stroke"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                          />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Upload your certificates, diplomas, or other relevant documents.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherSettings;