import express from "express";
import { getEvent, patchEvent, delEvent, getUpcomingEvents } from "../controllers/events.js";
import imageUpload from "../middleware/imageUpload.js";
import { checkEvent, isLoggedIn } from "../middleware/validityCheck.js";

const router = express.Router();

router.get('/', getUpcomingEvents);

router.get("/:eventId", checkEvent, isLoggedIn, getEvent);

router.patch("/:eventId", checkEvent, isLoggedIn, imageUpload.single("image"), patchEvent);

router.delete("/:eventId", checkEvent, isLoggedIn, delEvent);

export default router;