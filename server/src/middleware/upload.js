import multer from "multer";
import { ApiError } from "../utils/ApiError.js";

const ALLOWED_TYPES = ["image/png", "image/jpeg"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 2 MB
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(new ApiError(400, "Only PNG or JPG images are allowed"));
    }
    cb(null, true);
  },
});

export const uploadScreenshot = upload.single("screenshot");