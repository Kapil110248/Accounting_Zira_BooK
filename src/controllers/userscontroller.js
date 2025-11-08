import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Utility: Convert to number safely (for Decimal/BigInt) - Not strictly needed for platform_users, but kept for consistency.
const toNumber = (val) => {
  if (val == null) return 0;
  if (typeof val === 'object' && typeof val.toNumber === 'function') {
    return val.toNumber();
  }
  return Number(val);
};

// ✅ CREATE user
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role = "ADMIN", status = "ACTIVE" } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password required" });
    }

    const hash = await bcrypt.hash(password, 10);

    const newUser = await prisma.platform_users.create({
      data: {
        name,
        email,
        password_hash: hash,
        role,
        status,
      },
    });

    res.status(201).json({ message: "User created", id: newUser.id });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Error creating user" });
  }
};

// ✅ READ all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.platform_users.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        created_at: true,
      },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

// ✅ READ single user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await prisma.platform_users.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        created_at: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user" });
  }
};

// ✅ UPDATE user
export const updateUser = async (req, res) => {
  try {
    const { name, email, password, role, status } = req.body;

    // Find the existing user
    const existingUser = await prisma.platform_users.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    let password_hash = existingUser.password_hash;
    if (password) {
      password_hash = await bcrypt.hash(password, 10);
    }

    // Update the user
    const updatedUser = await prisma.platform_users.update({
      where: { id: parseInt(req.params.id) },
      data: {
        name: name || existingUser.name,
        email: email || existingUser.email,
        password_hash: password_hash,
        role: role || existingUser.role,
        status: status || existingUser.status,
      },
    });

    res.json({ message: "User updated" });
  } catch (err) {
    res.status(500).json({ message: "Error updating user" });
  }
};

// ✅ DELETE user
export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await prisma.platform_users.delete({
      where: { id: parseInt(req.params.id) },
    });

    res.json({ message: "User deleted" });
  } catch (err) {
    // Check if the error is because the user doesn't exist (Prisma will throw an error)
    if (err.code === 'P2025') { // Record to delete does not exist
      return res.status(404).json({ message: "User not found" });
    }
    res.status(500).json({ message: "Error deleting user" });
  }
};