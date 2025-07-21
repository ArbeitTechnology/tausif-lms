import React, { useState } from "react";
import Sidebar from "./sidebar";
import TeacherSettings from "./settings";

import Theader from "./common/Theader";

const TeacherDashboard = () => {
  const [activeView, setActiveView] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Add sidebar state
  // Toggle sidebar function
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderView = () => {
    switch (activeView) {
      case "settings":
        return <TeacherSettings />;

      default:
        return <h1 className="p-6 text-xl font-bold">Dashboard Overview</h1>;
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-300 min-h-screen flex items-center justify-center">
      <div className="flex w-full h-[100vh] bg-white overflow-hidden">
        {/* Sidebar Section */}
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar} // Pass toggle function
        />

        {/* Main Content Section */}
        <div className="flex-1 h-full overflow-auto ">
          <Theader
            toggleSidebar={toggleSidebar} // Pass toggle function
            isSidebarOpen={isSidebarOpen} // Pass sidebar state
          />
          {renderView()}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
