// src/controllers/companyUser.controller.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

// Utility: Safe number conversion (for BigInt/Decimal)
const toNumber = (val) => {
  if (val == null) return 0;
  if (typeof val === "object" && typeof val.toNumber === "function") {
    return val.toNumber();
  }
  return Number(val);
};

// ✅ 1. Create Company User
export const createCompanyUser = async (req, res) => {
  try {
    const {
      company_id,
      name,
      email,
      password,
      role = "COMPANY_USERS",
      status = "Active",
    } = req.body;

    if (!company_id || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "company_id, email, and password are required" });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    const newUser = await prisma.company_users.create({
      data: {
        company_id: Number(company_id),
        name,
        email,
        password_hash,
        role,
        status,
      },
    });

    res.status(201).json({
      success: true,
      message: "✅ Company user created successfully",
      data: newUser,
    });
  } catch (error) {
    console.error("❌ createCompanyUser error:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// ✅ 2. Get All Company Users
export const getAllCompanyUsers = async (req, res) => {
  try {
    const users = await prisma.company_users.findMany({
      select: {
        id: true,
        company_id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        created_at: true,
      },
      orderBy: { id: "desc" },
    });

    res.status(200).json({
      success: true,
      message: "✅ All company users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.error("❌ getAllCompanyUsers error:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// ✅ 3. Get Users by Company ID
export const getCompanyUsersByCompanyId = async (req, res) => {
  try {
    const { company_id } = req.params;

    if (!company_id) {
      return res.status(400).json({ success: false, message: "company_id is required" });
    }

    const users = await prisma.company_users.findMany({
      where: { company_id: Number(company_id) },
      orderBy: { id: "desc" },
      select: {
        id: true,
        company_id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        created_at: true,
      },
    });

    if (!users.length) {
      return res.status(404).json({ success: false, message: "No users found for this company" });
    }

    res.status(200).json({
      success: true,
      message: "✅ Users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.error("❌ getCompanyUsersByCompanyId error:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// ✅ 4. Get User by ID
export const getCompanyUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.company_users.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        company_id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        created_at: true,
      },
    });

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({
      success: true,
      message: "✅ User fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error("❌ getCompanyUserById error:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// ✅ 5. Update Company User
export const updateCompanyUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, status } = req.body;

    const existingUser = await prisma.company_users.findUnique({ where: { id: Number(id) } });
    if (!existingUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let password_hash = existingUser.password_hash;
    if (password) {
      password_hash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.company_users.update({
      where: { id: Number(id) },
      data: {
        name: name || existingUser.name,
        email: email || existingUser.email,
        role: role || existingUser.role,
        status: status || existingUser.status,
        password_hash,
      },
    });

    res.status(200).json({
      success: true,
      message: "✅ Company user updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("❌ updateCompanyUser error:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// ✅ 6. Delete Company User
export const deleteCompanyUser = async (req, res) => {
  try {
    const { id } = req.params;

    const existingUser = await prisma.company_users.findUnique({ where: { id: Number(id) } });
    if (!existingUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await prisma.company_users.delete({ where: { id: Number(id) } });

    res.status(200).json({
      success: true,
      message: "✅ Company user deleted successfully",
    });
  } catch (error) {
    console.error("❌ deleteCompanyUser error:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};
