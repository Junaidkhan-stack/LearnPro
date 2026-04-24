const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary"); // your Cloudinary config

/* ============================
   LESSON VIDEO UPLOAD
============================ */
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "lessons",
    resource_type: "video", // important for video upload
    allowed_formats: ["mp4", "mov", "avi", "mkv"], // optional: limit formats
  },
});

const videoParser = multer({ storage: videoStorage });

/* ============================
   ASSIGNMENT PDF UPLOAD
============================ */
const pdfStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "assignments",
      resource_type: "image", // ✅ FORCE PUBLIC ACCESS
      format: "pdf",          // ✅ ensure it's PDF

      public_id: `assignment-${Date.now()}`,

    };
  },
});

const pdfParser = multer({
  storage: pdfStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // ✅ 10MB limit
  },
});
/* ============================
   EXPORT BOTH PARSERS
============================ */
module.exports = {
  videoParser, // for lesson uploads
  pdfParser, // for assignment uploads
};
