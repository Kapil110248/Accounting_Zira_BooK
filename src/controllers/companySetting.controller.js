// src/Controllers/companySettingsController.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// ✅ Create Company Settings
export const createCompanySettings = async (req, res) => {
  try {
    const data = req.body;

    const companySetting = await prisma.company_settings.create({
      data,
    });

    // Convert BigInt fields to string
    const safeResponse = {
      ...companySetting,
      id: companySetting.id.toString(), // convert BigInt to string
    };

    res.status(201).json(safeResponse);
  } catch (error) {
    console.error("Error creating company settings:", error);
    res.status(500).json({ error: "Failed to create company settings" });
  }
};


// ✅ Get all Company Settings
export const getAllCompanySettings = async (req, res) => {
  try {
    const settings = await prisma.company_settings.findMany();

    const safeData = settings.map(s => ({
      ...s,
      id: s.id?.toString(),
      created_at:
        s.created_at instanceof Date && !isNaN(s.created_at)
          ? s.created_at
          : new Date(), // replace invalid date with current date
    }));

    res.json(safeData);
  } catch (error) {
    console.error("❌ Error fetching company settings:", error);
    res.status(500).json({ error: "Failed to fetch company settings" });
  }
};


// ✅ Get a single Company Setting by ID
export const getCompanySettingsById = async (req, res) => {
  try {
    const id = BigInt(req.params.id); // keep as BigInt for Prisma query

    const setting = await prisma.company_settings.findUnique({
      where: { id },
    });

    if (!setting) {
      return res.status(404).json({ error: "Company setting not found" });
    }

    // Convert BigInt fields to string before sending JSON
    const safeResponse = {
      ...setting,
      id: setting.id.toString(),
    };

    res.json(safeResponse);
  } catch (error) {
    console.error("Error fetching company setting:", error);
    res.status(500).json({ error: "Failed to fetch company setting" });
  }
};


// ✅ Update Company Settings by ID
export const updateCompanySettings = async (req, res) => {
  try {
    const id = BigInt(req.params.id);
    const data = req.body;

    const updatedSetting = await prisma.company_settings.update({
      where: { id },
      data,
    });

    // Convert BigInt fields to string for JSON serialization
    const safeResponse = {
      ...updatedSetting,
      id: updatedSetting.id.toString(),
    };

    res.json(safeResponse);
  } catch (error) {
    console.error("Error updating company setting:", error);
    res.status(500).json({ error: "Failed to update company setting" });
  }
};

// ✅ Delete Company Settings by ID
export const deleteCompanySettings = async (req, res) => {
  try {
    const id = BigInt(req.params.id);

    await prisma.company_settings.delete({
      where: { id },
    });

    res.json({ message: "Company setting deleted successfully" });
  } catch (error) {
    console.error("Error deleting company setting:", error);
    res.status(500).json({ error: "Failed to delete company setting" });
  }
};
