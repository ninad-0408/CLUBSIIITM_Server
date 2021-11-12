import express from "express";
import { getStudent, patchStudent, delStudent } from "../controllers/students.js";
import { checkStudent, isLoggedIn } from "../middleware/validityCheck.js";

const router = express.Router();

router.get("/:studentId", checkStudent, isLoggedIn, getStudent);

router.patch("/:studentId", checkStudent, isLoggedIn, patchStudent);

router.delete("/:studentId", checkStudent, isLoggedIn, delStudent);

export default router;
