// src/controllers/customers.controller.js
import { PrismaClient } from "@prisma/client";
import cloudinary from "cloudinary";
import fs from "fs";

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: 'dkqcqrrbp',
  api_key: '418838712271323',
  api_secret: 'p12EKWICdyHWx8LcihuWYqIruWQ'
});

const uploadToCloudinary = async (tempFilePath, folder = "customers") => {
  try {
    const result = await cloudinary.uploader.upload(tempFilePath, { folder });
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    return result.secure_url;
  } catch (error) {
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

// CREATE Customer
export const createCustomer = async (req, res) => {
  try {
    const {
      company_id,
      name_english,
      name_arabic,
      company_name,
      google_location,
      account_type = "Sundry Debtors",
      balance_type = "Debit",
      account_name,
      account_balance = 0.0,
      creation_date,
      bank_account_number,
      bank_ifsc,
      bank_name_branch,
      country,
      state,
      pincode,
      address,
      state_code,
      shipping_address,
      phone,
      email,
      credit_period = 0,
      gstin,
      enable_gst = false
    } = req.body;

    if (!name_english) {
      return res.status(400).json({ status: false, message: "name_english is required" });
    }

    let id_card_image = null;
    let image = null;

    if (req.files?.id_card_image) {
      id_card_image = await uploadToCloudinary(req.files.id_card_image.tempFilePath);
    }
    if (req.files?.image) {
      image = await uploadToCloudinary(req.files.image.tempFilePath);
    }

    const customer = await prisma.customers.create({
      data: {
        company_id: company_id ? parseInt(company_id) : null,
        name_english,
        name_arabic,
        company_name,
        google_location,
        id_card_image,
        image,
        account_type,
        balance_type,
        account_name,
        account_balance: parseFloat(account_balance),
 
        creation_date: creation_date || null,
        bank_account_number,
        bank_ifsc,
        bank_name_branch,
        country,
        state,
        pincode,
        address,
        state_code,
        shipping_address,
        phone,
        email,
        credit_period: parseInt(credit_period),
        gstin,
        enable_gst: Boolean(enable_gst)
      }
    });

    res.status(201).json({
      status: true,
      message: "Customer created successfully",
      customerId: customer.id
    });
  } catch (error) {
    console.error("Create Customer Error:", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

// GET All Customers
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await prisma.customers.findMany({
      orderBy: { id: 'desc' }
    });
    res.json({ status: true, message: "Customers fetched successfully", data: customers });
  } catch (error) {
    console.error("Get All Customers Error:", error);
    res.status(500).json({ status: false, message: "Failed to fetch customers" });
  }
};

// GET Customer By ID
export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = parseInt(id);
    if (isNaN(customerId)) {
      return res.status(400).json({ status: false, message: "Valid customer ID required" });
    }

    const customer = await prisma.customers.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      return res.status(404).json({ status: false, message: "Customer not found" });
    }

    res.json({ status: true, message: "Customer fetched successfully", data: customer });
  } catch (error) {
    console.error("Get Customer By ID Error:", error);
    res.status(500).json({ status: false, message: "Failed to fetch customer" });
  }
};

// UPDATE Customer
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = parseInt(id);
    if (isNaN(customerId)) {
      return res.status(400).json({ status: false, message: "Valid customer ID required" });
    }

    const data = { ...req.body };

    // Handle file uploads
    if (req.files?.id_card_image) {
      data.id_card_image = await uploadToCloudinary(req.files.id_card_image.tempFilePath);
    }
    if (req.files?.image) {
      data.image = await uploadToCloudinary(req.files.image.tempFilePath);
    }

    // Convert types — but NOT creation_date
    if (data.company_id) data.company_id = parseInt(data.company_id);
    if (data.account_balance) data.account_balance = parseFloat(data.account_balance);
    if (data.credit_period) data.credit_period = parseInt(data.credit_period);
    if (data.enable_gst !== undefined) data.enable_gst = Boolean(data.enable_gst);

    // ✅ DO NOT convert creation_date to Date — keep as string!
    // if (data.creation_date) data.creation_date = new Date(data.creation_date); ← REMOVE THIS

    const customer = await prisma.customers.update({
      where: { id: customerId },
      data
    });

    res.json({ status: true, message: "Customer updated successfully" });
  } catch (error) {
    console.error("Update Customer Error:", error);
    res.status(500).json({ status: false, message: "Failed to update customer" });
  }
};
// DELETE Customer
export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = parseInt(id);
    if (isNaN(customerId)) {
      return res.status(400).json({ status: false, message: "Valid customer ID required" });
    }

    await prisma.customers.delete({
      where: { id: customerId }
    });

    res.json({ status: true, message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Delete Customer Error:", error);
    res.status(500).json({ status: false, message: "Failed to delete customer" });
  }
};

// GET Customers by Company ID
export const getCustomersByCompany = async (req, res) => {
  try {
    const { company_id } = req.params;
    const companyId = parseInt(company_id);
    if (isNaN(companyId)) {
      return res.status(400).json({ status: false, message: "Valid company_id is required" });
    }

    const customers = await prisma.customers.findMany({
      where: { company_id: companyId },
      orderBy: { name_english: 'asc' }
    });

    if (customers.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No customers found for this company"
      });
    }

    res.json({
      status: true,
      message: "Customers fetched successfully",
      data: customers
    });
  } catch (error) {
    console.error("Get Customers by Company Error:", error);
    res.status(500).json({
      status: false,
      message: "Failed to fetch customers for this company"
    });
  }
};