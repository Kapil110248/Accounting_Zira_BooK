import { uploadToCloudinary } from "../config/cloudinary.js";
import prisma from "../config/db.js";


const toNumber = (val) => (val == null ? null : Number(val));

export const createProduct = async (req, res) => {
  try {
    const {
      company_id,
      warehouse_id,
      item_category_id,
      item_name,
      unit_id,
      hsn,
      barcode,
      sku,
      description,
      initial_qty,
      min_order_qty,
      as_of_date,
      initial_cost,
      sale_price,
      purchase_price,
      discount,
      tax_account,
      remarks,
    } = req.body;

    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, "products");
    }

    const product = await prisma.products.create({
      data: {
        company_id: toNumber(company_id),
        warehouse_id: toNumber(warehouse_id),
        item_category_id: toNumber(item_category_id),
        item_name,
        hsn,
        barcode,
        sku,
        description,
        initial_qty: toNumber(initial_qty),
        min_order_qty: toNumber(min_order_qty),
        as_of_date,
        initial_cost: toNumber(initial_cost),
        sale_price: toNumber(sale_price),
        purchase_price: toNumber(purchase_price),
        discount: toNumber(discount),
        tax_account,
        remarks,
        image: imageUrl,
      },
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.products.findMany({
      include: {
        warehouse: { select: { id: true, warehouse_name: true, location: true } },
        item_category: { select: { id: true, item_category_name: true } },
      },
      orderBy: { created_at: "desc" },
    });

    res.json({ success: true, data: products });
  } catch (error) {
    console.error("Get all products error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductsByCompany = async (req, res) => {
  try {
    const { company_id } = req.params;

    const products = await prisma.products.findMany({
      where: { company_id: toNumber(company_id) },
      include: {
        warehouse: { select: { id: true, warehouse_name: true, location: true } },
        item_category: { select: { id: true, item_category_name: true } },
      },
      orderBy: { created_at: "desc" },
    });

    res.json({ success: true, data: products });
  } catch (error) {
    console.error("Get products by company error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getProductsByCompanyAndWarehouse = async (req, res) => {
  try {
    const { company_id, warehouse_id } = req.params;

    const products = await prisma.products.findMany({
      where: {
        company_id: toNumber(company_id),
        warehouse_id: toNumber(warehouse_id),
      },
      include: {
        warehouse: { select: { id: true, warehouse_name: true, location: true } },
        item_category: { select: { id: true, item_category_name: true } },
      },
      orderBy: { created_at: "desc" },
    });

    res.json({ success: true, data: products });
  } catch (error) {
    console.error("Get by company and warehouse error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


/**
 * 🟢 GET PRODUCT BY ID
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.products.findUnique({
      where: { id: toNumber(id) },
      include: {
        warehouse: { select: { id: true, warehouse_name: true, location: true } },
        item_category: { select: { id: true, item_category_name: true } },
      },
    });

    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    res.json({ success: true, data: product });
  } catch (error) {
    console.error("Get product by ID error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 🟠 UPDATE PRODUCT
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    // ✅ Safely parse numeric fields
    const numericData = {
      company_id: data.company_id ? parseInt(data.company_id) : null,
      warehouse_id: data.warehouse_id ? parseInt(data.warehouse_id) : null,
      item_category_id: data.item_category_id ? parseInt(data.item_category_id) : null,
      initial_qty: data.initial_qty ? parseInt(data.initial_qty) : null,
      min_order_qty: data.min_order_qty ? parseInt(data.min_order_qty) : null,
      initial_cost: data.initial_cost ? parseFloat(data.initial_cost) : null,
      sale_price: data.sale_price ? parseFloat(data.sale_price) : null,
      purchase_price: data.purchase_price ? parseFloat(data.purchase_price) : null,
      discount: data.discount ? parseFloat(data.discount) : null,
    };

    // ✅ If image uploaded, replace old image
    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file.buffer, "products");
      data.image = imageUrl;
    }

    // ✅ Merge converted data and update
    const updated = await prisma.products.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        ...numericData,
      },
    });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


/**
 * 🔴 DELETE PRODUCT
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.products.findUnique({ where: { id: toNumber(id) } });
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    await prisma.products.delete({ where: { id: toNumber(id) } });

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};