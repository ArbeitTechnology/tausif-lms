require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const Adminrouter = require("./routes/Adminrouter");
const Studnetauth = require("./routes/Studentauth");
const Teaceherrouter = require("./routes/Teacherrouter");
const Studentrouter = require("./routes/Studentrouter");

const app = express();
const PORT = process.env.PORT || 3500;

// CORS Configuration
const corsOptions = {
  origin: ["http://localhost:5173","http://localhost:5177"], // Allow only this origin
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Allow cookies/session to be sent
  optionsSuccessStatus: 204 // For legacy browser support
};

// Middleware
app.use(cors(corsOptions)); // Use the CORS configuration
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/auth/student", Studnetauth);
app.use("/api/student", Studentrouter);
app.use("/api/admin", Adminrouter);
app.use("/api/teacher", Teaceherrouter);
app.use(express.static("public"))
// DB Connection
connectDB();

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
