import { PrismaClient, Prisma } from "@prisma/client";
const prisma = new PrismaClient();

// ✅ CREATE Tax Class
export const createTaxClass = async (req, res) => {
  try {
    const { company_id, tax_class, tax_value } = req.body;

    if (!tax_class || !tax_value) {
      return res.status(400).json({
        success: false,
        message: "tax_class and tax_value are required",
      });
    }

    const newTax = await prisma.tax_classes.create({
      data: {
        company_id: company_id ? parseInt(company_id) : null,
        tax_class,
        tax_value: new Prisma.Decimal(tax_value),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Tax class created successfully",
      data: newTax,
    });
  } catch (error) {
    console.error("Error creating tax class:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create tax class",
      error: error.message,
    });
  }
};

// ✅ READ All Tax Classes
export const getAllTaxClasses = async (req, res) => {
  try {
    const taxes = await prisma.tax_classes.findMany({
      orderBy: { id: "desc" },
    });

    return res.status(200).json({
      success: true,
      message: "Tax classes fetched successfully",
      count: taxes.length,
      data: taxes,
    });
  } catch (error) {
    console.error("Error fetching tax classes:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tax classes",
      error: error.message,
    });
  }
};

// ✅ READ Single Tax Class by ID
export const getTaxClassById = async (req, res) => {
  try {
    const { id } = req.params;
    const tax = await prisma.tax_classes.findUnique({
      where: { id: parseInt(id) },
    });

    if (!tax) {
      return res
        .status(404)
        .json({ success: false, message: "Tax class not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Tax class fetched successfully",
      data: tax,
    });
  } catch (error) {
    console.error("Error fetching tax class:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tax class",
      error: error.message,
    });
  }
};

// ✅ UPDATE Tax Class
export const updateTaxClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { tax_class, tax_value, company_id } = req.body;

    const existing = await prisma.tax_classes.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Tax class not found" });
    }

    const updated = await prisma.tax_classes.update({
      where: { id: parseInt(id) },
      data: {
        company_id: company_id ? parseInt(company_id) : existing.company_id,
        tax_class: tax_class || existing.tax_class,
        tax_value: tax_value
          ? new Prisma.Decimal(tax_value)
          : existing.tax_value,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Tax class updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating tax class:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update tax class",
      error: error.message,
    });
  }
};

// ✅ DELETE Tax Class
export const deleteTaxClass = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.tax_classes.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Tax class not found" });
    }

    await prisma.tax_classes.delete({ where: { id: parseInt(id) } });

    return res.status(200).json({
      success: true,
      message: "Tax class deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting tax class:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete tax class",
      error: error.message,
    });
  }
};

// ✅ GET Tax Classes by Company ID
export const getTaxClassByCompany = async (req, res) => {
  try {
    const { company_id } = req.params;
        console.log("➡️ Fetching tax classes for company:", company_id);

    if (!company_id) {
      return res
        .status(400)
        .json({ success: false, message: "Company ID is required" });
    }

    const entries = await prisma.tax_classes.findMany({
      where: { company_id: Number(company_id) },
      orderBy: { created_at: "desc" },
    });

    res.status(200).json({
      success: true,
      message: "Tax classes fetched successfully by company",
      count: entries.length,
      data: entries,
    });
  } catch (error) {
    console.error("Get Tax Entries Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tax entries",
      error: error.message,
    });
  }
};
