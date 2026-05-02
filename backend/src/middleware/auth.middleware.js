import jwt from "jsonwebtoken";

/**
 * PROTECT ROUTES (AUTHENTICATION)
 */
export const protect = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // { id, role, name }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};


/**
 * ADMIN ONLY (AUTHORIZATION)
 */
export const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }

  next();
};