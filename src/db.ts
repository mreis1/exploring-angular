import mysql, { ConnectionOptions } from "mysql2/promise";
console.log("✅ Loading .env file...");
import dotenv from 'dotenv' 
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from "node:path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../../.env'); 
dotenv.config({ path: envPath });
console.log("✅ .env file loaded.");

console.log("🔹 Database Configuration:");
console.log("DB_HOST:", process.env["DB_HOST"] || "NOT SET");
console.log("DB_USER:", process.env["DB_USER"] || "NOT SET");

const access: ConnectionOptions = {
    host: process.env["DB_HOST"],
    port: Number(process.env["DB_PORT"]),
    database: process.env["DB_DATABASE"],
    user: process.env["DB_USER"],
    password: process.env["DB_PASSWORD"],
    namedPlaceholders: true,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
}

export const db = mysql.createPool(access);

console.log("Connected to database!");