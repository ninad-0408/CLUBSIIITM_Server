import express from "express";
import { getEvent, patchEvent, delEvent } from "../controllers/events.js";
import imageUpload from "../middleware/imageUpload.js";

const router = express.Router();

router.get("/:eventId", getEvent);
// get event of clubs remaining.
router.patch("/:eventId", imageUpload.single("image"), patchEvent);

router.delete("/:eventId", delEvent);

export default router;