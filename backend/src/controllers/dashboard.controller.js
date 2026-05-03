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
    const [
      totalUsers,
      totalContent,
      completedSessions,
      totalCertificates,
      recentUsers,
      recentContent,
      totalAdmins,
      totalCourses,
      totalLiveEvents,
      contentByType,
      contentByDiscipline
    ] = await Promise.all([
      User.countDocuments(),
      Content.countDocuments(),
      Progress.countDocuments({ completed: true }),
      Certificate.countDocuments(),
      User.find().select("-password").sort({ createdAt: -1 }).limit(5),
      Content.find().populate("createdBy", "name email").sort({ createdAt: -1 }).limit(5),
      User.countDocuments({ role: "admin" }),
      Content.countDocuments({ learningMode: "course" }),
      Content.countDocuments({ isLiveEvent: true }),
      Content.aggregate([
        {
          $group: {
            _id: "$contentType",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),
      Content.aggregate([
        {
          $match: {
            discipline: { $nin: [null, ""] }
          }
        },
        {
          $group: {
            _id: "$discipline",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 6 }
      ])
    ]);

    return res.json({
      totalUsers,
      totalLearners: totalUsers - totalAdmins,
      totalAdmins,
      totalContent,
      totalCourses,
      totalSessions: totalContent - totalCourses,
      totalLiveEvents,
      completedSessions,
      totalCertificates,
      recentUsers,
      recentContent,
      contentByType,
      contentByDiscipline
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return res.status(500).json({ message: "Failed to load admin dashboard" });
  }
};
