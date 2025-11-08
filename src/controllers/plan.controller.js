// // src/controllers/planController.js
// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();

// // Utility: Convert to number safely (for Decimal/BigInt)
// const toNumber = (val) => {
//   if (val == null) return 0;
//   if (typeof val === 'object' && typeof val.toNumber === 'function') {
//     return val.toNumber();
//   }
//   return Number(val);
// };

// // ✅ Create Plan
// export const createPlan = async (req, res) => {
//   try {
//     const {
//       name,
//       base_price = 0,
//       currency = "USD",
//       invoice_limit = 0,
//       additional_invoice_price = 0,
//       user_limit = 1,
//       storage_capacity_gb = 5,
//       billing_cycle = "Monthly",
//       status = "Active",
//       description = "",
//       modules = [],
//     } = req.body;

//     if (!name) {
//       return res.status(400).json({ success: false, message: "Plan name is required" });
//     }

//     const newPlan = await prisma.$transaction(async (tx) => {
//       const plan = await tx.plans.create({
//         data: {
//           name,
//           base_price: toNumber(base_price),
//           currency,
//           invoice_limit: toNumber(invoice_limit),
//           additional_invoice_price: toNumber(additional_invoice_price),
//           user_limit: toNumber(user_limit),
//           storage_capacity_gb: toNumber(storage_capacity_gb),
//           billing_cycle,
//           status,
//           description,
//         },
//       });

//       if (Array.isArray(modules) && modules.length > 0) {
//         const planModuleData = modules.map((m) => ({
//           module_id: parseInt(m.module_id),
//           module_price: toNumber(m.module_price) || 0,
//           plan_id: plan.id, // plan.id is Int
//         }));

//         await tx.plan_modules.createMany({
//           data: planModuleData,
//         });
//       }

//       return plan;
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Plan created successfully",
//       data: { id: newPlan.id },
//     });
//   } catch (error) {
//     console.error("Error creating plan:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to create plan",
//       error: error.message,
//     });
//   }
// };

// // ✅ Get All Plans (with subscriber count & modules)
// export const getPlans = async (req, res) => {
//   try {
//     const plansWithSubscribers = await prisma.$queryRaw`
//       SELECT p.id, p.name, p.base_price, p.currency, p.invoice_limit,
//              p.additional_invoice_price, p.user_limit, p.storage_capacity_gb,
//              p.billing_cycle, p.status, p.description,
//              COUNT(c.id) AS subscribers
//       FROM plans p
//       LEFT JOIN companies c ON p.id = c.plan_id
//       GROUP BY p.id
//       ORDER BY p.id DESC
//     `;

//     if (plansWithSubscribers.length === 0) {
//       return res.status(404).json({ success: false, message: "No plans found" });
//     }

//     const planIds = plansWithSubscribers.map(p => parseInt(p.id));

//     const planModules = await prisma.plan_modules.findMany({
//       where: {
//         plan_id: { in: planIds },
//       },
//       include: {
//         modules: { // relation name is "modules" (from your schema)
//           select: {
//             id: true,
//             key: true,
//             label: true,
//           },
//         },
//       },
//     });

//     const plansWithModules = plansWithSubscribers.map(plan => {
//       const modules = planModules
//         .filter(pm => pm.plan_id === parseInt(plan.id))
//         .map(pm => ({
//           id: toNumber(pm.modules.id),
//           key: pm.modules.key,
//           label: pm.modules.label,
//           price: toNumber(pm.module_price),
//         }));

//       return {
//         ...plan,
//         id: toNumber(plan.id),
//         base_price: toNumber(plan.base_price),
//         invoice_limit: toNumber(plan.invoice_limit),
//         additional_invoice_price: toNumber(plan.additional_invoice_price),
//         user_limit: toNumber(plan.user_limit),
//         storage_capacity_gb: toNumber(plan.storage_capacity_gb),
//         subscribers: toNumber(plan.subscribers),
//         modules,
//       };
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Plans fetched successfully",
//       data: plansWithModules,
//     });
//   } catch (error) {
//     console.error("Error fetching plans:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch plans",
//       error: error.message,
//     });
//   }
// };

// // ✅ Update Plan
// export const updatePlan = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       name,
//       base_price = 0,
//       currency = "USD",
//       invoice_limit = 0,
//       additional_invoice_price = 0,
//       user_limit = 1,
//       storage_capacity_gb = 5,
//       billing_cycle = "Monthly",
//       status = "Active",
//       description = "",
//       modules = [],
//     } = req.body;

//     if (!id) {
//       return res.status(400).json({ success: false, message: "Plan ID is required" });
//     }

//     const planId = parseInt(id);

//     const existingPlan = await prisma.plans.findUnique({ where: { id: planId } });
//     if (!existingPlan) {
//       return res.status(404).json({ success: false, message: "Plan not found" });
//     }

//     await prisma.$transaction(async (tx) => {
//       await tx.plans.update({
//         where: { id: planId },
//         data: {
//           name,
//           base_price: toNumber(base_price),
//           currency,
//           invoice_limit: toNumber(invoice_limit),
//           additional_invoice_price: toNumber(additional_invoice_price),
//           user_limit: toNumber(user_limit),
//           storage_capacity_gb: toNumber(storage_capacity_gb),
//           billing_cycle,
//           status,
//           description,
//         },
//       });

//       await tx.plan_modules.deleteMany({
//         where: { plan_id: planId },
//       });

//       if (Array.isArray(modules) && modules.length > 0) {
//         const planModuleData = modules.map((m) => ({
//           plan_id: planId,
//           module_id: parseInt(m.module_id),
//           module_price: toNumber(m.module_price) || 0,
//         }));

//         await tx.plan_modules.createMany({
//           data: planModuleData,
//         });
//       }
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Plan updated successfully",
//     });
//   } catch (error) {
//     console.error("Error updating plan:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to update plan",
//       error: error.message,
//     });
//   }
// };

// // ✅ Get Plan By ID (basic)
// export const getPlanById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!id) {
//       return res.status(400).json({ success: false, message: "Plan ID is required" });
//     }

//     const planId = parseInt(id);

//     const plan = await prisma.plans.findUnique({
//       where: { id: planId },
//     });

//     if (!plan) {
//       return res.status(404).json({ success: false, message: "Plan not found" });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Plan fetched successfully",
//       data: {
//         ...plan,
//         id: toNumber(plan.id),
//         base_price: toNumber(plan.base_price),
//         invoice_limit: toNumber(plan.invoice_limit),
//         additional_invoice_price: toNumber(plan.additional_invoice_price),
//         user_limit: toNumber(plan.user_limit),
//         storage_capacity_gb: toNumber(plan.storage_capacity_gb),
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching plan by ID:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch plan",
//       error: error.message,
//     });
//   }
// };

// // ✅ Get Plan With Modules
// export const getPlanWithModules = async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!id) {
//       return res.status(400).json({ success: false, message: "Plan ID is required" });
//     }

//     const planId = parseInt(id);

//     const plan = await prisma.plans.findUnique({
//       where: { id: planId },
//     });

//     if (!plan) {
//       return res.status(404).json({ success: false, message: "Plan not found" });
//     }

//     const modules = await prisma.plan_modules.findMany({
//       where: { plan_id: planId },
//       include: {
//         modules: {
//           select: {
//             id: true,
//             key: true,
//             label: true,
//           },
//         },
//       },
//     });

//     const formattedModules = modules.map(pm => ({
//       id: toNumber(pm.modules.id),
//       key: pm.modules.key,
//       label: pm.modules.label,
//       price: toNumber(pm.module_price),
//     }));

//     return res.status(200).json({
//       success: true,
//       message: "Plan fetched successfully",
//       data: {
//         ...plan,
//         id: toNumber(plan.id),
//         base_price: toNumber(plan.base_price),
//         modules: formattedModules,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching plan with modules:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch plan",
//       error: error.message,
//     });
//   }
// };

// // ✅ Delete Plan
// export const deletePlan = async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!id) {
//       return res.status(400).json({ success: false, message: "Plan ID is required" });
//     }

//     const planId = parseInt(id);

//     const plan = await prisma.plans.findUnique({ where: { id: planId } });
//     if (!plan) {
//       return res.status(404).json({ success: false, message: "Plan not found" });
//     }

//     await prisma.$transaction(async (tx) => {
//       await tx.plan_modules.deleteMany({
//         where: { plan_id: planId },
//       });

//       await tx.companies.deleteMany({
//         where: { plan_id: planId },
//       });

//       await tx.plans.delete({
//         where: { id: planId },
//       });
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Plan deleted successfully",
//     });
//   } catch (error) {
//     console.error("Error deleting plan:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to delete plan",
//       error: error.message,
//     });
//   }
// };




import prisma from "../config/db.js";

// ✅ Create a new plan with modules
export const createPlan = async (req, res) => {
  try {
    const {
      plan_name,
      base_price,
      currency,
      invoice_limit,
      additional_invoice_price,
      user_limit,
      storage_capacity,
      billing_cycle,
      status,
      description,
      plan_modules,
    } = req.body;

    const plan = await prisma.plans.create({
      data: {
        plan_name,
        base_price,
        currency,
        invoice_limit,
        additional_invoice_price,
        user_limit,
        storage_capacity,
        billing_cycle,
        status,
        description,
        plan_modules: {
          create: plan_modules || [],
        },
      },
      include: { plan_modules: true },
    });

    res.status(201).json({ success: true, message: "Plan created", data: plan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ✅ Get all plans
export const getAllPlans = async (req, res) => {
  try {
    const plans = await prisma.plans.findMany({
      include: { plan_modules: true },
      orderBy: { id: "desc" },
    });
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ✅ Get plan by ID
export const getPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await prisma.plans.findUnique({
      where: { id: Number(id) },
      include: { plan_modules: true },
    });

    if (!plan)
      return res.status(404).json({ success: false, message: "Plan not found" });

    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ✅ Update plan and modules
// export const updatePlan = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       plan_name,
//       base_price,
//       currency,
//       invoice_limit,
//       additional_invoice_price,
//       user_limit,
//       storage_capacity,
//       billing_cycle,
//       status,
//       description,
//       plan_modules,
//     } = req.body;

//     // Update plan
//     const updatedPlan = await prisma.plans.update({
//       where: { id: Number(id) },
//       data: {
//         plan_name,
//         base_price,
//         currency,
//         invoice_limit,
//         additional_invoice_price,
//         user_limit,
//         storage_capacity,
//         billing_cycle,
//         status,
//         description,
//         // Optional: Update or replace modules
//         plan_modules: plan_modules
//           ? {
//               deleteMany: {}, // delete all old modules
//               create: plan_modules, // create new ones
//             }
//           : undefined,
//       },
//       include: { plan_modules: true },
//     });

//     res.status(200).json({ success: true, message: "Plan updated", data: updatedPlan });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Server error", error });
//   }
// };

export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      plan_name,
      base_price,
      currency,
      invoice_limit,
      additional_invoice_price,
      user_limit,
      storage_capacity,
      billing_cycle,
      status,
      description,
      plan_modules,
    } = req.body;

    console.log("Update Plan Request Body:", req.body);

    // 1️⃣ Update basic plan fields
    await prisma.plans.update({
      where: { id: Number(id) },
      data: {
        plan_name,
        base_price,
        currency,
        invoice_limit,
        additional_invoice_price,
        user_limit,
        storage_capacity,
        billing_cycle,
        status,
        description,
      },
    });

    // 2️⃣ Replace old modules (delete + insert)
    if (Array.isArray(plan_modules)) {
      await prisma.plan_modules.deleteMany({
        where: { plan_id: Number(id) },
      });

      await prisma.plan_modules.createMany({
        data: plan_modules.map((mod) => ({
          plan_id: Number(id),
          module_name: mod.module_name,
          module_price: parseFloat(mod.module_price) || 0,
        })),
      });
    }

    // 3️⃣ Return updated plan
    const updatedPlan = await prisma.plans.findUnique({
      where: { id: Number(id) },
      include: { plan_modules: true },
    });

    res.status(200).json({
      success: true,
      message: "Plan and modules updated successfully",
      data: updatedPlan,
    });
  } catch (error) {
    console.error("Update plan error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ Delete plan (cascade deletes modules)
export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.plans.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ success: true, message: "Plan deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
