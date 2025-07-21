/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

const AdminContext = createContext(); // <-- Export here

export const AdminProvider = ({ children }) => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const admin_info = JSON.parse(localStorage.getItem("admin"));

  const fetchAdminProfile = async (id = admin_info?._id, authToken = token) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${base_url}/api/admin/admin-profile/${id}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      setAdminData(response.data.admin);
    } catch (err) {
      setError(err.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && admin_info?._id) {
      fetchAdminProfile();
    } else {
      setLoading(false); // Stop showing loading when not logged in
    }
  }, []);

  const clearAdminData = () => {
    setAdminData(null);
    setError(null);
    setLoading(false);
  };

  return (
    <AdminContext.Provider
      value={{
        adminData,
        loading,
        error,
        fetchAdminProfile,
        clearAdminData,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContext;
