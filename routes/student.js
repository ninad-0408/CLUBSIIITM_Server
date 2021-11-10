import express from "express";
import { getStudent, patchStudent, delStudent } from "../controllers/students.js";

const router = express.Router();

router.get("/:studentId", getStudent);

router.patch("/:studentId", patchStudent);

router.delete("/:studentId", delStudent);

export default router;
