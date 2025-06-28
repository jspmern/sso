// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const verifyToken = require("./msalAuth"); // ✅ No destructuring here

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.get("/api/protected", verifyToken, (req, res) => {
  console.log("debug11", req.user);
  res.json({ msg: "Authenticated", user: req.user });
});

app.listen(5000, () => console.log("API running on http://localhost:5000"));
