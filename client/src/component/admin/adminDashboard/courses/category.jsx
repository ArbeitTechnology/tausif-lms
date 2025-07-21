import React, { useState } from "react";
import axios from "axios";

function Category() {
  const [categoryName, setCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      setErrorMessage("Category name cannot be empty");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    // build the multipart form data
    const formData = new FormData();
    formData.append("name", categoryName);
    // if you ever add a file input, e.g. <input type="file" onChange={...} />,
    // you would do: formData.append("image", selectedFile);

    try {
      // frontend
      await axios.post(
        "http://localhost:3500/api/auth/categories",
        { name: categoryName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setCategoryName("");
      setSuccessMessage("Category added successfully!");
    } catch (error) {
      console.error("Error adding category:", error);
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to add category";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-black">Add New Category</h2>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Category Name
          </label>
          <input
            type="text"
            id="category"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="Enter category name"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-4 bg-black text-white font-medium rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${
            isSubmitting ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? "Adding..." : "Add Category"}
        </button>
      </form>
    </div>
  );
}

export default Category;
