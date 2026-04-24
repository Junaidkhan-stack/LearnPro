const Course = require("../models/Course");

/* =====================================
   GET COURSES + SEARCH
===================================== */
exports.getCourses = async (req, res) => {
  try {
    const { search } = req.query;

    // ✅ ONLY SHOW APPROVED COURSES
    let query = { isPublished: true, status: "approved" };

    if (search) {
      query.$and = [
        { status: "approved" },
        {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        },
      ];
    }

    const courses = await Course.find(query)
      .populate("teacher", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
