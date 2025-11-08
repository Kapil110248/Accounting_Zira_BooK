// src/controllers/planRequestController.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Utility: Safe number conversion
const toNumber = (val) => {
  if (val == null) return 0;
  return Number(val);
};



// 📌 1. Company Requests a Plan
export const requestPlan = async (req, res) => {
  try {
    const { company_id, plan_id, billing_cycle = "Monthly" ,  request_date ,status } = req.body;

    if (!company_id || !plan_id) {
      return res.status(400).json({ message: "company_id and plan_id are required" });
    }

    const newRequest = await prisma.plan_requests.create({
      data: {
        company_id: toNumber(company_id),
        plan_id: toNumber(plan_id),
        billing_cycle,
        request_date ,
        status
        // request_date will be auto-set by DB
        // status defaults to "Pending"
      },
    });

    return res.status(201).json({ message: "Plan request submitted successfully", data: { id: newRequest.id } });
  } catch (error) {
    console.error("Error requesting plan:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// 📌 2. Get All Requested Plans (with company & plan names)
export const getRequestedPlans = async (req, res) => {
  try {
    // Step 1: Fetch all plan requests
    const requests = await prisma.plan_requests.findMany({
      orderBy: { id: 'desc' },
    });

    if (requests.length === 0) {
      return res.status(404).json({ message: "No requested plans found" });
    }

    // Step 2: Extract unique IDs
    const companyIds = [...new Set(requests.map(r => r.company_id))];
    const planIds = [...new Set(requests.map(r => r.plan_id))];

    // Step 3: Fetch companies and plans in parallel
    const [companies, plans] = await Promise.all([
      prisma.companies.findMany({
        where: { id: { in: companyIds } },
        select: { id: true, name: true, email: true }
      }),
      prisma.plans.findMany({
        where: { id: { in: planIds } },
        select: { id: true, name: true }
      })
    ]);

    // Step 4: Create lookup maps
    const companyMap = new Map(companies.map(c => [c.id, c]));
    const planMap = new Map(plans.map(p => [p.id, p]));

    // Step 5: Format response
    const data = requests.map(r => ({
      id: r.id,
      company: companyMap.get(r.company_id)?.name || 'Unknown Company',
      email: companyMap.get(r.company_id)?.email || 'no-email@domain.com',
      plan: planMap.get(r.plan_id)?.name || 'Unknown Plan',
      billing_cycle: r.billing_cycle || 'Monthly',
      request_date: r.request_date,
      status: r.status || 'Pending',
    }));

    return res.status(200).json({
      message: "Requested plans fetched successfully",
      data,
    });
  } catch (error) {
    console.error("Error fetching plan requests:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// 📌 3. Approve / Reject Plan Request
export const updatePlanRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be either 'Approved' or 'Rejected'" });
    }

    const requestId = toNumber(id);
    const existing = await prisma.plan_requests.findUnique({
      where: { id: requestId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Plan request not found" });
    }

    const updated = await prisma.plan_requests.update({
      where: { id: requestId },
      data: { status },
    });

    return res.status(200).json({ message: `Plan request ${status.toLowerCase()} successfully` });
  } catch (error) {
    console.error("Error updating plan request:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// 📌 4. Delete Plan Request
export const deletePlanRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const requestId = toNumber(id);

    const existing = await prisma.plan_requests.findUnique({
      where: { id: requestId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Plan request not found" });
    }

    await prisma.plan_requests.delete({
      where: { id: requestId },
    });

    return res.status(200).json({ message: "Plan request deleted successfully" });
  } catch (error) {
    console.error("Error deleting plan request:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};