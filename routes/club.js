import express from "express";
import imageUpload from "../middleware/imageUpload.js";
import { getClub, getClubs, patchClub, removeMember } from "../controllers/clubs.js";
import { postEvent } from "../controllers/events.js";
import { postApproval } from "../controllers/approvals.js";

const router = express.Router();

router.get('/', getClubs);

router.get("/:clubId", getClub);

router.patch("/:clubId", imageUpload.single("image"), patchClub);

router.post("/:clubId/event", imageUpload.single("image"), postEvent);

router.post("/:clubId/approval", postApproval);

router.post("/:clubId/remove/:studentId", removeMember);

export default router;