import express from "express";
import approvalModel from "../models/approvals.js";
import { approveApproval, declineApproval } from "../controllers/approvals.js";
import { notAuthorized, notFound, dataUnaccesable } from "../alerts/errors.js";
import { checkApproval, isLoggedIn } from "../middleware/validityCheck.js";
import sendMessage from "../mails/mail.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

router.post("/:approvalId/approve", checkApproval, isLoggedIn, approveApproval);

router.post("/:approvalId/decline", checkApproval, isLoggedIn, declineApproval);

router.post("/:approvalId/meet", checkApproval, isLoggedIn, async function (req, res) {

    const { approvalId } = req.params;

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

    const check = await sendMessage(mailOptions);

    if(!check)
    return res.status(200).json({ message: 'The meeting is scheduled successfully details are mailed.' });
    else
    return check;

});

export default router;