import express from "express";
import imageUpload from "../middleware/imageUpload.js";
import { getClub, getClubs, patchClub, removeMember, getEventsofClub } from "../controllers/clubs.js";
import { postEvent } from "../controllers/events.js";
import { postApproval } from "../controllers/approvals.js";
import { checkClub, checkStudent, isLoggedIn } from "../middleware/validityCheck.js";

const router = express.Router();

router.get('/', getClubs);

router.get("/:clubId", checkClub, getClub);

router.get('/:clubId/events', checkClub, getEventsofClub);

router.patch("/:clubId", checkClub, isLoggedIn, imageUpload.single("image"), patchClub);

router.post("/:clubId/event", checkClub, isLoggedIn, imageUpload.single("image"), postEvent);

router.post("/:clubId/approval", checkClub, isLoggedIn, postApproval);

router.post("/:clubId/remove/:studentId", checkClub, isLoggedIn, checkStudent, removeMember);

export default router;