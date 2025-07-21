import React, { useState, useEffect } from "react";
import Sidebar from "./sidebar";
import Settings from "./settings";
import CourseList from "./courses/coursesList";
import Cart from "./courses/cart";
import MyCourses from "./courses/myCourses";

const StudentDashboard = () => {
  const [activeView, setActiveView] = useState("dashboard");
  const [cart, setCart] = useState([]);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("courseCart")) || [];
    setCart(savedCart);
  }, []);

  const renderView = () => {
    switch (activeView) {
      case "settings":
        return <Settings />;
      case "courseList":
        return (
          <CourseList
            setActiveView={setActiveView}
            cart={cart}
            setCart={setCart}
          />
        );
      case "cart":
        return (
          <Cart setActiveView={setActiveView} cart={cart} setCart={setCart} />
        );
      case "myCourses":
        return <MyCourses setActiveView={setActiveView} />;
      default:
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Dashboard Overview
            </h1>
            <p className="mt-2 text-gray-600">
              Welcome to your student dashboard. Use the sidebar to manage your
              courses and account settings.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-300 min-h-screen flex items-center justify-center p-4">
      <div className="flex w-full  h-[95vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
        {/* Sidebar Section */}
        <Sidebar activeView={activeView} setActiveView={setActiveView} />

        {/* Main Content Section */}
        <div className="flex-1 h-full overflow-auto p-6">{renderView()}</div>
      </div>
    </div>
  );
};

export default StudentDashboard;
