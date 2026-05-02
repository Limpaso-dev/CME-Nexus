import Certificate from "../models/Certificate.js";
import Content from "../models/Content.js";
import Progress from "../models/Progress.js";
import User from "../models/User.js";

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const [completedSessions, certificates, recentProgress, user] = await Promise.all([
      Progress.countDocuments({ userId, completed: true }),
      Certificate.countDocuments({ userId }),
      Progress.find({ userId })
        .populate("contentId", "title discipline contentType credits eventDate")
        .sort({ updatedAt: -1 })
        .limit(5),
      User.findById(userId).select("-password")
    ]);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      user,
      totalCredits: user.totalCredits,
      completedSessions,
      certificates,
      recentProgress
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return res.status(500).json({ message: "Failed to load dashboard" });
  }
};

export const getAdminDashboard = async (req, res) => {
  try {
    const [totalUsers, totalContent, completedSessions, totalCertificates, recentUsers, recentContent] = await Promise.all([
      User.countDocuments(),
      Content.countDocuments(),
      Progress.countDocuments({ completed: true }),
      Certificate.countDocuments(),
      User.find().select("-password").sort({ createdAt: -1 }).limit(5),
      Content.find().populate("createdBy", "name email").sort({ createdAt: -1 }).limit(5)
    ]);

    return res.json({
      totalUsers,
      totalContent,
      completedSessions,
      totalCertificates,
      recentUsers,
      recentContent
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return res.status(500).json({ message: "Failed to load admin dashboard" });
  }
};
