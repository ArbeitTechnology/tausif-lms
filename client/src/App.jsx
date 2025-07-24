import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import AdminLogin from "./component/admin/adminLogin";
import ForgotPassword from "./component/admin/ForgotPassword";
import ResetPassword from "./component/admin/ResetPassword";
import AdminDashboard from "./component/admin/adminDashboard/adminDashboard";
import TeacherAuth from "./component/teacher/teacherAuth";
import StudentAuth from "./component/student/studentAuth";
import ResetPasswordTeacher from "./component/teacher/ResetPassword";
import ForgotPasswordTeacher from "./component/teacher/ForgotPassword";
import ForgotPasswordStudent from "./component/student/ForgotPassword";
import ResetPasswordStudent from "./component/student/ResetPassword";
import StudentDashboard from "./component/student/studentDashboard/studentDashboard";
import TeacherDashboard from "./component/teacher/teacherDashboard/teacherDashboard";
import Createmcq from "./component/teacher/teacherDashboard/mcq/Createmcq";
import Createquestion from "./component/teacher/teacherDashboard/question/Createquestion";
// import CreateCourse from "./component/teacher/teacherDashboard/courses/CreateCourse";
// import CourseList from "./component/teacher/teacherDashboard/courses/CourseList";
import Mcqlist from "./component/teacher/teacherDashboard/mcq/Mcqlist";
import CQlist from "./component/teacher/teacherDashboard/question/CQlist";
import CourseList from "./component/teacher/teacherDashboard/course/CourseList";
import CreateCourse from "./component/teacher/teacherDashboard/course/CreateCourse";
import Notification from "./component/teacher/teacherDashboard/notification/Notification";
import TeacherSettings from "./component/teacher/teacherDashboard/settings/TeacherSettings";
import CourseLearningPage from "./component/student/studentDashboard/courses/CourseLearningPage";
import CourseOverview from "./component/student/studentDashboard/courses/courseView/CourseOverview";
import CoursePlayer from "./component/student/studentDashboard/courses/courseView/CoursePlayer";

const isAuthenticated = () => {
  const token = localStorage.getItem("studentToken");
  return !!token;
};

const getUserRole = () => {
  return localStorage.getItem("role"); // "admin" or "subadmin"
};

const App = () => {
  // eslint-disable-next-line no-unused-vars
  const role = getUserRole();

  const [authMode, setAuthMode] = useState("register");
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/admin" element={<AdminLogin />} />

        <Route path="/admin/forgotPassword" element={<ForgotPassword />} />
        <Route path="/admin/reset-password" element={<ResetPassword />} />

        <Route
          path="/admin/dashboard"
          element={
            isAuthenticated() ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/admin" replace />
            )
          }
        />

        {/* Teacher route */}
        <Route
          path="/teacher"
          element={
            <TeacherAuth authMode={authMode} setAuthMode={setAuthMode} />
          }
        />
        <Route
          path="/teacher/forgotPassword"
          element={<ForgotPasswordTeacher setAuthMode={setAuthMode} />}
        />
        <Route
          path="/teacher/reset-password"
          element={<ResetPasswordTeacher />}
        />
        <Route
          path="/teacher/dashboard"
          element={
            isAuthenticated() ? (
              <TeacherDashboard />
            ) : (
              <Navigate to="/teacher" replace />
            )
          }
        />
        {/* Student route */}
        <Route
          path="/student"
          element={
            <StudentAuth authMode={authMode} setAuthMode={setAuthMode} />
          }
        />
        <Route
          path="/student/forgotPassword"
          element={<ForgotPasswordStudent setAuthMode={setAuthMode} />}
        />
        <Route
          path="/student/reset-password"
          element={<ResetPasswordStudent />}
        />
        <Route
          path="/student/dashboard"
          element={
            isAuthenticated() ? (
              <StudentDashboard />
            ) : (
              <Navigate to="/student" replace />
            )
          }
        />

        {/* ------------------------------teacher-all-route---------------------------------------- */}
        <Route path="/teacher/courses/create" element={<CreateCourse />} />
        <Route path="/teacher/course-list" element={<CourseList />} />
        <Route path="/teacher/create-mcq" element={<Createmcq />} />
        <Route path="/teacher/mcq-list" element={<Mcqlist />} />
        <Route path="/teacher/create-question" element={<Createquestion />} />
        <Route path="/teacher/question-list" element={<CQlist />} />
        <Route path="/teacher/notifications" element={<Notification />} />
        <Route path="/teacher/settings" element={<TeacherSettings />} />

        {/* <Route path="/teacher/course-list" element={<CourseList />} /> */}

        {/* ------------------------------teacher-all-route---------------------------------------- */}

        {/* ----------------------------------student-all-route---------------------------------- */}
        <Route path="/studnet/course-overview/:id" element={<CourseOverview />} />
      </Routes>
    </>
  );
};

export default App;
