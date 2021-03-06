import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import dotenv from "dotenv";
dotenv.config();

import clubRoute from "./routes/club.js";
import eventRoute from "./routes/event.js";
import approvalRoute from "./routes/approval.js";
import studentRoute from "./routes/student.js";
import authRoute from "./routes/auth.js";
import auth from './middleware/auth.js';

const app = express();

app.use(express.json({ limit: "30mb", extended: true }))
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

app.use("/club",auth, clubRoute);
app.use("/event",auth, eventRoute);
app.use("/approval",auth, approvalRoute);
app.use("/student",auth, studentRoute);
app.use("/auth", authRoute);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => app.listen(PORT, () => console.log(`The server is running on port: ${PORT}`)))
	.catch((error) => console.log(error.message));


var gfs;
const conn = mongoose.connection;

conn.once("open", () => {
	gfs = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: "Images" });
});

app.get("/image/:imageId", async (req, res) => {
	try {
		const readStream = await gfs.openDownloadStream(new mongoose.Types.ObjectId(req.params.imageId));
		readStream.pipe(res);
	} catch (error) {
		res.send(' ');
	}
});


