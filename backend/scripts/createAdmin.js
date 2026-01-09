import bcrypt from "bcryptjs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const db = require("../models/index.cjs");

/**
 * Create admin user if it doesn't exist
 * Uses environment variables: ADMIN_EMAIL, ADMIN_PASSWORD
 * Falls back to default values if not provided (with warning)
 */
async function createAdmin() {
  try {
    const defaultEmail = "admin@company.com";
    const defaultPassword = "Admin123!ChangeME";

    const adminEmail = process.env.ADMIN_EMAIL || defaultEmail;
    const adminPassword = process.env.ADMIN_PASSWORD || defaultPassword;

    // Check if admin already exists
    const existingAdmin = await db.User.findOne({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log(`ℹ️  Admin user already exists: ${adminEmail}`);
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Create admin user
    await db.User.create({
      name: "Super",
      surname: "Admin",
      mobileNumber: "0000000000",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      id_manager: null,
    });

    console.log(`✅ Admin user created successfully: ${adminEmail}`);

    // Warning if using default credentials
    if (adminEmail === defaultEmail || adminPassword === defaultPassword) {
      console.warn("\n⚠️  WARNING: Default admin credentials are being used!");
      console.warn("⚠️  Please set ADMIN_EMAIL and ADMIN_PASSWORD environment variables");
      console.warn("⚠️  and change the admin password immediately after first login!\n");
      console.log(`   Default email: ${defaultEmail}`);
      console.log(`   Default password: ${defaultPassword}\n`);
    }
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
    throw error;
  }
}

export default createAdmin;
