import express from "express";

import { getAuth } from '../controllers/auths.js';

const router = express.Router();

router.post('/', getAuth());

export default router;