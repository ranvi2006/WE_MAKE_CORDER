const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
 * 🔐 AUTO CREATE DEFAULT ADMIN (RUNS ON STARTUP)
 */
const seedDefaultAdmin = async () => {
  try {
    const email = "rajurk2002@gmail.com";
    const password = "Rajubhai1admin";
    const name = "Raju Kumar Mandal";

    if (!email || !password || !name) {
      console.log("⚠️ Default admin env variables not set");
      return;
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return; // admin already exists → do nothing
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    console.log("✅ Default admin created:", email);
  } catch (error) {
    console.error("❌ Failed to create default admin:", error.message);
  }
};

// 🚀 RUN ON FILE LOAD
seedDefaultAdmin();

/**
 * Register Admin
 */
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    res.status(201).json({
      message: "Admin registered successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
};

/**
 * Login Admin
 */
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};
