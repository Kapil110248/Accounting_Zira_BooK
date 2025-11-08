// src/controllers/users.controller.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "cloudinary";
import fs from "fs";

const prisma = new PrismaClient();

// 🔐 Cloudinary Config
cloudinary.config({
  cloud_name: "dkqcqrrbp",
  api_key: "418838712271323",
  api_secret: "p12EKWICdyHWx8LcihuWYqIruWQ",
});

// Utility: Convert to number safely (for Decimal/BigInt)
const toNumber = (val) => {
  if (val == null) return 0;
  if (typeof val === "object" && typeof val.toNumber === "function") {
    return val.toNumber();
  }
  return Number(val);
};

//
// ✅ Create Admin User
//
export const createAdminUser = async (req, res) => {
  try {
    const { company_id, name, phone, email, role_id, status = "Active", password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: false, message: "Email and password are required" });
    }

    // 📸 Upload image (optional)
    let imageUrl = null;
    if (req.files?.image) {
      try {
        const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
          folder: "users",
        });
        imageUrl = result.secure_url;
        fs.unlinkSync(req.files.image.tempFilePath);
      } catch (uploadErr) {
        console.error("Cloudinary upload failed:", uploadErr);
        return res.status(500).json({
          status: false,
          message: "Image upload failed",
          error: uploadErr.message,
        });
      }
    }

    // 🔑 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 💾 Create user in DB
    const newUser = await prisma.users.create({
      data: {
        company_id: company_id ? parseInt(company_id) : null,
        name,
        phone,
        email,
        role_id: role_id ? parseInt(role_id) : null,
        status,
        password: hashedPassword,
        image: imageUrl,
      },
    });

    return res.status(201).json({
      status: true,
      message: "User created successfully",
      user: {
        id: toNumber(newUser.id),
        name: newUser.name,
        email: newUser.email,
        role_id: newUser.role_id ? toNumber(newUser.role_id) : null,
      },
    });
  } catch (error) {
    console.error("Create User Error:", error);
    if (error.code === "P2002") {
      return res.status(400).json({ status: false, message: "Email already exists" });
    }
    return res.status(500).json({ status: false, message: "Failed to create user", error: error.message });
  }
};

//
// ✅ Get All Users
//
export const getAllAdminUsers = async (req, res) => {
  try {
    const users = await prisma.users.findMany({
      include: {
        company: { select: { name: true } },
        role: { select: { role_name: true } },
      },
    });

    const formattedUsers = users.map((user) => ({
      ...user,
      id: toNumber(user.id),
      company_id: user.company_id ? toNumber(user.company_id) : null,
      role_id: user.role_id ? toNumber(user.role_id) : null,
      company_name: user.company?.name || null,
      role_name: user.role?.role_name || null,
    }));

    return res.status(200).json({
      status: true,
      message: "Users fetched successfully",
      users: formattedUsers,
    });
  } catch (error) {
    console.error("Fetch Users Error:", error);
    return res.status(500).json({ status: false, message: "Failed to fetch users", error: error.message });
  }
};

//
// ✅ Get User By ID
//
export const getAdminUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    if (!userId) {
      return res.status(400).json({ status: false, message: "Valid user ID is required" });
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        company: { select: { name: true } },
        role: { select: { role_name: true } },
      },
    });

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const formattedUser = {
      ...user,
      id: toNumber(user.id),
      company_id: user.company_id ? toNumber(user.company_id) : null,
      role_id: user.role_id ? toNumber(user.role_id) : null,
      company_name: user.company?.name || null,
      role_name: user.role?.role_name || null,
    };

    return res.status(200).json({
      status: true,
      message: "User fetched successfully",
      user: formattedUser,
    });
  } catch (error) {
    console.error("Fetch User Error:", error);
    return res.status(500).json({ status: false, message: "Failed to fetch user", error: error.message });
  }
};

//
// ✅ Update User
//
export const updateAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { company_id, name, phone, email, role_id, status, password } = req.body;
    const userId = parseInt(id);

    if (!userId) {
      return res.status(400).json({ status: false, message: "Valid user ID is required" });
    }

    // 📸 Upload new image (if provided)
    let imageUrl = null;
    if (req.files?.image) {
      try {
        const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
          folder: "users",
        });
        imageUrl = result.secure_url;
        fs.unlinkSync(req.files.image.tempFilePath);
      } catch (uploadErr) {
        console.error("Cloudinary upload failed:", uploadErr);
        return res.status(500).json({
          status: false,
          message: "Image upload failed",
          error: uploadErr.message,
        });
      }
    }

    // 🔑 Hash password (if provided)
    let hashedPassword = undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // 💾 Update user
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        ...(company_id !== undefined && { company_id: company_id ? parseInt(company_id) : null }),
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(role_id !== undefined && { role_id: role_id ? parseInt(role_id) : null }),
        ...(status !== undefined && { status }),
        ...(hashedPassword && { password: hashedPassword }),
        ...(imageUrl && { image: imageUrl }),
      },
    });

    return res.status(200).json({
      status: true,
      message: "User updated successfully",
      user: {
        id: toNumber(updatedUser.id),
        name: updatedUser.name,
        email: updatedUser.email,
        role_id: updatedUser.role_id ? toNumber(updatedUser.role_id) : null,
      },
    });
  } catch (error) {
    console.error("Update User Error:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ status: false, message: "User not found" });
    }
    return res.status(500).json({ status: false, message: "Failed to update user", error: error.message });
  }
};

//
// ✅ Delete User
//
export const deleteAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    if (!userId) {
      return res.status(400).json({ status: false, message: "Valid user ID is required" });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return res.status(200).json({
      status: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete User Error:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ status: false, message: "User not found" });
    }
    return res.status(500).json({ status: false, message: "Failed to delete user", error: error.message });
  }
};

//
// ✅ Unified Login (Superadmin or Company)
//
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    let user = null;
    let role = null;

    // 1️⃣ Check in User (Superadmin / Staff)
    user = await prisma.users.findUnique({ where: { email } });
    
    if (user) {
      role = "superadmin";
    } else {
      // 2️⃣ Check in Company
      user = await prisma.companies.findUnique({ where: { email } });
      if (user) {
        role = "company";
      }
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Verify password
    const isMatch =
      role === "superadmin"
        ? await bcrypt.compare(password, user.password)
        : await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Generate JWT
    const payload = {
      id: toNumber(user.id),
      email: user.email,
      name: user.name,
      role,
    };

    if (role === "company") {
      payload.company_id = toNumber(user.id);
      payload.plan_id = user.plan_id ? toNumber(user.plan_id) : null;
      payload.plan_type = user.plan_type || null;
    } else {
      payload.company_id = user.company_id ? toNumber(user.company_id) : null;
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7h" });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: toNumber(user.id),
        name: user.name,
        email: user.email,
        role,
        status: user.status,
        ...(role === "company" && {
          plan_id: user.plan_id ? toNumber(user.plan_id) : null,
          plan_type: user.plan_type || null,
        }),
      },
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Error logging in", error: error.message });
  }
};
