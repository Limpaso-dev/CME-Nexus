import Progress from "../models/Progress.js";
import User from "../models/User.js";

export const getDashboard = async (req, res) => {
  const userId = req.user.id;

  const completed = await Progress.countDocuments({
    userId,
    completed: true
  });

  const user = await User.findById(userId);

  res.json({
    totalCredits: user.totalCredits,
    completedSessions: completed,
    certificates: completed // placeholder (1:1 for now)
  });
};