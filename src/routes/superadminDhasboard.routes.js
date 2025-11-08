// src/routes/dashboard.routes.js
import express from "express";
import { getDashboardStats } from "../controllers/superadmindhasboard.controller.js";

const router = express.Router();

// GET /api/dashboard → returns all stats
router.get("/", getDashboardStats);

export default router;