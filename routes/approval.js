import express from "express";
import mongoose from "mongoose";
import approvalModel from "../models/approvals.js";
import { approveApproval, declineApproval } from "../controllers/approvals.js";
import { notValid, notAuthorized, notFound, dataUnaccesable, notLoggedIn } from "../alerts/errors.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

router.post("/:approvalId/approve", approveApproval);

router.post("/:approvalId/decline", declineApproval);

router.post("/:approvalId/meet", async function (req, res, next) {

    if (req.session.passport === undefined)
    return notLoggedIn(res);

    const { approvalId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(approvalId))
    return notValid(res);

    const body = req.body;

    function makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 10; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    const meet = `meet.google.com/lookup/${makeid()}`;

    var approval;

    try {
        approval = await approvalModel.findById(approvalId)
            .populate("studentid", ["name", "email"])
            .populate("clubid", ["name", "presidentid"]);

    } catch (error) {
        return dataUnaccesable(res);
    }

    if (approval == null)
    return notFound(res,"Approval");

    if (req.session.passport.user != approval.clubid.presidentid)
    return notAuthorized(res);

    var mailOptions = {
        from: process.env.EMAIL,
        to: approval.studentid.email,
        bcc: req.user.email,
        subject: "Invitation to interview",
        text: `Dear ${approval.studentid.name},\nThe president of ${approval.clubid.name} Club wants to interview you on ${body.date} at ${body.time}.\nThe meet link is ${meet}.`
    };

    const check = await sendMail(mailOptions);

    if(!check)
    return res.status(200).json({ message: 'The meeting is scheduled successfully details are mailed.' });
    else
    return check;

});

export default router;