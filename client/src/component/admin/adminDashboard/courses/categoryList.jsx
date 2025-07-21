import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";

function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  // grab token once
  const token = localStorage.getItem("token");
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  // 1) Fetch all categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        "http://localhost:3500/api/auth/categories",
        { headers: authHeaders }
      );
      setCategories(data);
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to load categories"
      );
    } finally {
      setLoading(false);
    }
  };

  // run on-mount
  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) Delete
  const handleDelete = async (id) => {
    const toastId = toast.loading("Deleting category...");
    try {
      await axios.delete(`http://localhost:3500/api/auth/categories/${id}`, {
        headers: authHeaders,
      });
      toast.success("Category deleted", { id: toastId });
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || err.message || "Failed to delete",
        { id: toastId }
      );
    }
  };

  // 3) Start / cancel editing
  const startEditing = (cat) => {
    setEditingId(cat._id);
    setEditName(cat.name);
  };
  const cancelEditing = () => {
    setEditingId(null);
    setEditName("");
    toast("Edit cancelled");
  };

  // 4) Update
  const handleUpdate = async (id) => {
    if (!editName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    const toastId = toast.loading("Updating category...");
    try {
      await axios.put(
        `http://localhost:3500/api/auth/categories/${id}`,
        { name: editName },
        {
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
        }
      );
      toast.success("Category updated", { id: toastId });
      setEditingId(null);
      setEditName("");
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || err.message || "Failed to update",
        { id: toastId }
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-black">Category List</h2>
        <p className="text-gray-600 mt-1">Manage your categories</p>
      </div>

      {categories.length === 0 ? (
        <div className="px-6 py-8 text-center">
          <p className="text-gray-500">
            No categories found. Add one to get started!
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {categories.map((category) => (
            <div
              key={category._id}
              className="px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              {editingId === category._id ? (
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                  <button
                    onClick={() => handleUpdate(category._id)}
                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900">
                    {category.name}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEditing(category)}
                      className="px-3 py-1 text-sm bg-white border border-black text-black rounded-md hover:bg-gray-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category._id)}
                      className="px-3 py-1 text-sm bg-black text-white rounded-md hover:bg-gray-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryList;
