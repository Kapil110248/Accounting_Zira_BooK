import prisma from "../config/db.js";


// Utility: Convert to number safely
const toNumber = (val) => {
  if (val == null) return null;
  if (typeof val === 'object' && typeof val.toNumber === 'function') {
    return val.toNumber();
  }
  return Number(val);
};

// ✅ Create Item Category
export const createItemCategory = async (req, res) => {
  try {
    const { company_id, item_category_name } = req.body;

    if (!item_category_name) {
      return res.status(400).json({
        success: false,
        message: "Item category name is required",
      });
    }

    const newItemCategory = await prisma.item_category.create({
      data: {
        company_id: company_id ? toNumber(company_id) : null,
        item_category_name,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Item category created successfully",
      data: {
        id: toNumber(newItemCategory.id),
        company_id: newItemCategory.company_id ? toNumber(newItemCategory.company_id) : null,
        item_category_name: newItemCategory.item_category_name,
        created_at: newItemCategory.created_at,
      },
    });
  } catch (error) {
    console.error("Error creating item category:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create item category",
      error: error.message,
    });
  }
};

// ✅ Get All Item Categories (with company name)
export const getAllCategoryItem = async (req, res) => {
  try {
    const itemCategories = await prisma.item_category.findMany({
      orderBy: { id: 'desc' },
    });

    const companyIds = [...new Set(itemCategories.map(ic => ic.company_id).filter(id => id !== null))];

    let companiesMap = new Map();
    if (companyIds.length > 0) {
      const companies = await prisma.uses.findMany({
        where: { id: { in: companyIds } },
        select: { id: true, name: true }
      });
      companies.forEach(c => companiesMap.set(c.id, c.name));
    }

    const formattedData = itemCategories.map(ic => ({
      id: toNumber(ic.id),
      company_id: ic.company_id ? toNumber(ic.company_id) : null,
      item_category_name: ic.item_category_name,
      created_at: ic.created_at,
      company_name: ic.company_id ? companiesMap.get(ic.company_id) || null : null,
    }));

    return res.status(200).json({
      success: true,
      message: "All item categories retrieved successfully",
      data: formattedData,
    });
  } catch (error) {
    console.error("Error fetching item categories:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch item categories",
      error: error.message,
    });
  }
};

// ✅ Get Item Categories by company_id
export const getItemCategoriesByCompanyId = async (req, res) => {
  try {
    const { company_id } = req.params;

    const companyIdNum = toNumber(company_id);
    if (isNaN(companyIdNum)) {
      return res.status(400).json({
        success: false,
        message: "Invalid company_id. Must be a number.",
      });
    }

    // Fetch categories for this company
    const itemCategories = await prisma.item_category.findMany({
      where: { company_id: companyIdNum },
      orderBy: { id: 'desc' },
    });

    // Early return if none found
    if (itemCategories.length === 0) {
      return res.status(200).json({
        success: true,
        message: `No item categories found for company ID ${companyIdNum}`,
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: `Item categories for company ID ${companyIdNum} retrieved successfully`,
      data: itemCategories,
    });
  } catch (error) {
    console.error("Error fetching item categories by company_id:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch item categories by company",
      error: error.message,
    });
  }
};