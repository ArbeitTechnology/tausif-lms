// index.js
import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom"; // Import Router
import "./index.css";
import App from "./App.jsx";
import { AdminProvider } from "./context/AdminContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <AdminProvider>
          <App />
      </AdminProvider>
    </Router>
  </StrictMode>
);
