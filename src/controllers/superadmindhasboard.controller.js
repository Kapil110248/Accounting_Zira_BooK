// src/controllers/dashboardController.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Utility function to safely convert Decimal/BigInt to Number
const toNumber = (val) => {
  if (val == null) return 0;
  if (typeof val === 'object' && typeof val.toNumber === 'function') {
    return val.toNumber();
  }
  return Number(val);
};

export const getDashboardStats = async (req, res) => {
  try {
    // 1. Total companies
    const totalCompaniesResult = await prisma.$queryRaw`
      SELECT COUNT(*) AS total_companies FROM companies
    `;
    const total_companies = toNumber(totalCompaniesResult[0].total_companies);

    // 2. Total plan requests
    const totalRequestsResult = await prisma.$queryRaw`
      SELECT COUNT(*) AS total_requests FROM plan_requests
    `;
    const total_requests = toNumber(totalRequestsResult[0].total_requests);

    // 3. Total revenue
    const totalRevenueResult = await prisma.$queryRaw`
      SELECT IFNULL(SUM(p.base_price), 0) AS total_revenue
      FROM companies c
      JOIN plans p ON c.plan_id = p.id
    `;
    const total_revenue = toNumber(totalRevenueResult[0].total_revenue);

    // 4. New signups (this month)
    const newSignupsResult = await prisma.$queryRaw`
      SELECT COUNT(*) AS new_signups 
      FROM companies 
      WHERE MONTH(start_date) = MONTH(CURDATE())
        AND YEAR(start_date) = YEAR(CURDATE())
    `;
    const new_signups = toNumber(newSignupsResult[0].new_signups);

    // 5. Growth chart (monthly signups this year)
    const growth = await prisma.$queryRaw`
      SELECT MONTH(start_date) AS month, COUNT(*) AS count
      FROM companies
      WHERE YEAR(start_date) = YEAR(CURDATE())
      GROUP BY MONTH(start_date)
      ORDER BY month
    `;

    // 6. Signup Companies (same as growth — reuse)
    const signupCompanies = growth;

    // 7. Revenue Trends (monthly revenue this year)
    const revenueTrends = await prisma.$queryRaw`
      SELECT MONTH(c.start_date) AS month, SUM(p.base_price) AS revenue
      FROM companies c
      JOIN plans p ON c.plan_id = p.id
      WHERE YEAR(c.start_date) = YEAR(CURDATE())
      GROUP BY MONTH(c.start_date)
      ORDER BY month
    `;

    // Format results to plain numbers
    const formattedGrowth = growth.map(item => ({
      month: toNumber(item.month),
      count: toNumber(item.count),
    }));

    const formattedRevenueTrends = revenueTrends.map(item => ({
      month: toNumber(item.month),
      revenue: toNumber(item.revenue) || 0,
    }));

    return res.status(200).json({
      success: true,
      message: "Dashboard stats fetched successfully",
      data: {
        total_companies,
        total_requests,
        total_revenue,
        new_signups,
        growth: formattedGrowth,
        signupCompanies: formattedGrowth,
        revenueTrends: formattedRevenueTrends,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  } finally {
    await prisma.$disconnect(); // Optional: good practice in long-running apps
  }
};