import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import mainAppRouters from "./app.js";
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
const swaggerFile = JSON.parse(
  fs.readFileSync(new URL('./swagger-output.json', import.meta.url), 'utf8')
);

dotenv.config();
const app = express();


// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

app.use(morgan('dev'));

// Root route
app.get("/", (req, res) => {
  res.send("🚀 Server is running successfully!");
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use("/api/v1", mainAppRouters);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
