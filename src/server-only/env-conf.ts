import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from "node:path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../../../.env');
console.log(envPath)
dotenv.config({ path: envPath });

console.log('----------------------')
console.log("✅ .env file loaded.");

console.log("🔹 Database Configuration:");
console.log("DB_HOST:", process.env["DB_HOST"] || "NOT SET");
console.log("DB_USER:", process.env["DB_USER"] || "NOT SET");
console.log('----------------------')

