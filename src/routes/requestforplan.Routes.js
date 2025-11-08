// src/routes/planRequest.routes.js
import express from "express";
import {
  requestPlan,
  getRequestedPlans,
  updatePlanRequestStatus,
  deletePlanRequest
} from "../controllers/requestforplan.controller.js"; // 👈 Updated import path

const router = express.Router();

// POST /api/plan-requests → Company requests a plan
router.post("/", requestPlan);

// GET /api/plan-requests → Admin fetches all requests
router.get("/", getRequestedPlans);

// PUT /api/plan-requests/:id → Approve or Reject request
router.put("/:id", updatePlanRequestStatus);

// DELETE /api/plan-requests/:id → Delete a plan request
router.delete("/:id", deletePlanRequest);

export default router;