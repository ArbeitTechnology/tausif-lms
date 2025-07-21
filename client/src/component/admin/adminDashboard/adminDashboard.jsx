import React, { useState } from "react";
import Sidebar from "./sidebar";
import SubadminCreate from "../adminDashboard/subadmins/SubadminCreate";
import SubadminList from "../adminDashboard/subadmins/SubadminList";
import TeacherRegistration from "./teacher/teacherRegister";
import TeacherList from "./teacher/teacherList";
import Notifications from "./notifications";
import Settings from "./settings";
import StudentAuth from "./student/studentCreate";
import StudentList from "./student/studentList";
import CourseCreator from "./courses/courseCreate";
import CourseList from "./courses/courseList";
import Category from "./courses/category";
import CategoryList from "./courses/categoryList";

const AdminDashboard = () => {
  const [activeView, setActiveView] = useState("dashboard");
  const [notificationCount, setNotificationCount] = useState(0);
  const renderView = () => {
    switch (activeView) {
      case "subadminCreate":
        return <SubadminCreate />;
      case "subadminList":
        return <SubadminList />;
      case "TeacherRegistration":
        return <TeacherRegistration />;
      case "teacherList":
        return <TeacherList />;
      case "StudentRegistration":
        return <StudentAuth />;
      case "studentList":
        return <StudentList />;
      case "createCourse":
        return <CourseCreator />;
      case "courseList":
        return <CourseList />;
      case "createCategory":
        return <Category />;
      case "modifyCategory":
        return <CategoryList />;
      case "notifications":
        return <Notifications setNotificationCount={setNotificationCount} />;
      case "settings":
        return <Settings />;
      default:
        return <h1 className="p-6 text-xl font-bold">Dashboard Overview</h1>;
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-300 min-h-screen flex items-center justify-center p-4">
      <div className="flex w-full max-w-8xl h-[95vh] bg-white rounded-3xl shadow-md overflow-hidden border border-gray-300">
        {/* Sidebar Section */}
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          notificationCount={notificationCount}
          setNotificationCount={setNotificationCount}
        />

        {/* Main Content Section */}
        <div className="flex-1 h-full overflow-auto ">{renderView()}</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
