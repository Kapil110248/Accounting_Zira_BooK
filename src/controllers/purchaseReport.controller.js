// src/controllers/purchaseReport.controller.js

import prisma from "../config/db.js";

// Utility: Convert to number safely
const toNumber = (val) => {
  if (val == null) return 0;
  if (typeof val === "object" && typeof val.toNumber === "function") {
    return val.toNumber();
  }
  return Number(val);
};

// ✅ Get Purchase Report Summary Metrics
export const getPurchaseReportSummary = async (req, res) => {
  try {
    const { company_id, start_date, end_date } = req.query;

    // Build where clause
    const where = {};
    if (company_id) {
      where.company_id = parseInt(company_id);
    }
    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) {
        where.created_at.gte = new Date(start_date);
      }
      if (end_date) {
        where.created_at.lte = new Date(end_date);
      }
    }

    // Get all purchase orders with items
    const purchaseOrders = await prisma.purchaseorder.findMany({
      where,
      include: {
        purchaseorderitems: true,
      },
    });

    // Calculate metrics
    let totalPurchase = 0;
    let totalPaid = 0;
    let totalPending = 0;
    let overdue = 0;

    purchaseOrders.forEach((order) => {
      const orderTotal = toNumber(order.total_amount || order.total || 0);
      const amountPaid = toNumber(order.amount_paid || 0);
      const balance = toNumber(order.balance || 0);
      const paymentStatus = order.payment_status || "Pending";

      totalPurchase += orderTotal;

      if (paymentStatus === "Paid" || paymentStatus === "paid") {
        totalPaid += amountPaid;
      } else {
        totalPending += balance || orderTotal - amountPaid;
      }

      // Check if overdue (balance > 0 and status is not paid)
      if (balance > 0 && paymentStatus !== "Paid" && paymentStatus !== "paid") {
        // Check if due date has passed (if due_date exists)
        if (order.due_date) {
          const dueDate = new Date(order.due_date);
          const today = new Date();
          if (dueDate < today) {
            overdue += balance;
          }
        } else {
          // If no due_date, consider unpaid as overdue
          overdue += balance;
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: "Purchase report summary fetched successfully",
      data: {
        total_purchase: totalPurchase.toFixed(2),
        paid_amount: totalPaid.toFixed(2),
        pending_payment: totalPending.toFixed(2),
        overdue: overdue.toFixed(2),
      },
    });
  } catch (error) {
    console.error("Error fetching purchase report summary:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ✅ Get Detailed Purchase Report with Filtering
export const getPurchaseReport = async (req, res) => {
  try {
    const {
      company_id,
      start_date,
      end_date,
      category,
      vendor_name,
      product_name,
      page = 1,
      limit = 10,
    } = req.query;

    // Build where clause for purchase orders
    const where = {};
    if (company_id) {
      where.company_id = parseInt(company_id);
    }
    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) {
        where.created_at.gte = new Date(start_date);
      }
      if (end_date) {
        where.created_at.lte = new Date(end_date);
      }
    }

    // Filter by vendor name if provided
    if (vendor_name) {
      where.OR = [
        { quotation_from_vendor_name: { contains: vendor_name } },
        { bill_to_vendor_name: { contains: vendor_name } },
      ];
    }

    // Get purchase orders with items
    const purchaseOrders = await prisma.purchaseorder.findMany({
      where,
      include: {
        purchaseorderitems: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // Process and flatten the data
    let reportData = [];

    for (const order of purchaseOrders) {
      for (const item of order.purchaseorderitems) {
        // Get product details if product exists
        let product = null;
        let categoryName = null;

        // Try to find product by item_name
        if (item.item_name) {
          product = await prisma.products.findFirst({
            where: {
              item_name: { contains: item.item_name },
              ...(company_id ? { company_id: parseInt(company_id) } : {}),
            },
            include: {
              item_category: true,
            },
          });

          if (product) {
            categoryName = product.item_category?.item_category_name || null;
          }
        }

        // Apply filters
        if (
          category &&
          categoryName &&
          !categoryName.toLowerCase().includes(category.toLowerCase())
        ) {
          continue;
        }
        if (
          product_name &&
          item.item_name &&
          !item.item_name.toLowerCase().includes(product_name.toLowerCase())
        ) {
          continue;
        }

        // Get vendor name
        const vendorName =
          order.quotation_from_vendor_name ||
          order.bill_to_vendor_name ||
          "N/A";

        // Get PO number
        const poNumber = order.PO_no || order.Manual_PO_ref || `PO-${order.id}`;

        reportData.push({
          po: poNumber,
          vendor: vendorName,
          product: item.item_name || "N/A",
          category: categoryName || "N/A",
          qty_ordered: toNumber(item.qty || 0),
          unit_price: toNumber(item.rate || 0),
          total_amount: toNumber(item.amount || 0),
          status: order.payment_status || "Pending",
          order_date: order.created_at,
          order_id: order.id,
        });
      }
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedData = reportData.slice(startIndex, endIndex);

    return res.status(200).json({
      success: true,
      message: "Purchase report fetched successfully",
      data: paginatedData,
      pagination: {
        current_page: pageNum,
        per_page: limitNum,
        total_records: reportData.length,
        total_pages: Math.ceil(reportData.length / limitNum),
        showing_from: reportData.length > 0 ? startIndex + 1 : 0,
        showing_to: Math.min(endIndex, reportData.length),
      },
    });
  } catch (error) {
    console.error("Error fetching purchase report:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ✅ Get Purchase Report (Optimized Version - Single Query)
export const getPurchaseReportOptimized = async (req, res) => {
  try {
    const {
      company_id,
      start_date,
      end_date,
      category,
      vendor_name,
      product_name,
      page = 1,
      limit = 10,
    } = req.query;

    // Build where clause
    const where = {};
    if (company_id) {
      where.company_id = parseInt(company_id);
    }
    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) {
        where.created_at.gte = new Date(start_date);
      }
      if (end_date) {
        where.created_at.lte = new Date(end_date);
      }
    }

    if (vendor_name) {
      where.OR = [
        { quotation_from_vendor_name: { contains: vendor_name } },
        { bill_to_vendor_name: { contains: vendor_name } },
      ];
    }

    // Get all purchase orders first
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const purchaseOrders = await prisma.purchaseorder.findMany({
      where,
      include: {
        purchaseorderitems: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // Get all unique product names for batch lookup
    const productNames = [
      ...new Set(
        purchaseOrders.flatMap((order) =>
          order.purchaseorderitems.map((item) => item.item_name).filter(Boolean)
        )
      ),
    ];

    // Batch fetch products
    const products = await prisma.products.findMany({
      where: {
        item_name: { in: productNames },
        ...(company_id ? { company_id: parseInt(company_id) } : {}),
      },
      include: {
        item_category: true,
      },
    });

    // Create lookup map
    const productMap = new Map();
    products.forEach((product) => {
      if (product.item_name) {
        productMap.set(product.item_name.toLowerCase(), {
          category: product.item_category?.item_category_name || null,
        });
      }
    });

    // Process and flatten the data
    let reportData = [];

    for (const order of purchaseOrders) {
      for (const item of order.purchaseorderitems) {
        const itemName = item.item_name || "";
        const productInfo = productMap.get(itemName.toLowerCase()) || {
          category: null,
        };

        // Apply filters
        if (
          category &&
          productInfo.category &&
          !productInfo.category.toLowerCase().includes(category.toLowerCase())
        ) {
          continue;
        }
        if (
          product_name &&
          itemName &&
          !itemName.toLowerCase().includes(product_name.toLowerCase())
        ) {
          continue;
        }

        // Get vendor name
        const vendorName =
          order.quotation_from_vendor_name ||
          order.bill_to_vendor_name ||
          "N/A";

        // Get PO number
        const poNumber = order.PO_no || order.Manual_PO_ref || `PO-${order.id}`;

        reportData.push({
          po: poNumber,
          vendor: vendorName,
          product: itemName || "N/A",
          category: productInfo.category || "N/A",
          qty_ordered: toNumber(item.qty || 0),
          unit_price: toNumber(item.rate || 0),
          total_amount: toNumber(item.amount || 0),
          status: order.payment_status || "Pending",
          order_date: order.created_at,
          order_id: order.id,
        });
      }
    }

    // Apply pagination after filtering
    const totalRecords = reportData.length;
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedData = reportData.slice(startIndex, endIndex);

    return res.status(200).json({
      success: true,
      message: "Purchase report fetched successfully",
      data: paginatedData,
      pagination: {
        current_page: pageNum,
        per_page: limitNum,
        total_records: totalRecords,
        total_pages: Math.ceil(totalRecords / limitNum),
        showing_from: totalRecords > 0 ? startIndex + 1 : 0,
        showing_to: Math.min(endIndex, totalRecords),
      },
    });
  } catch (error) {
    console.error("Error fetching purchase report:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
