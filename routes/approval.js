import express from "express";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import { google } from "googleapis";
import approvalModel from "../models/approvals.js";
import { approveApproval, declineApproval } from "../controllers/approvals.js";
import { notValid, notAuthorized, notFound, emailNotSent, dataUnaccesable, notLoggedIn } from "../alerts/errors.js";
import dotenv from "dotenv";
dotenv.config();

const OAuth2 = google.auth.OAuth2;

const router = express.Router();

const createTransporter = async () => {
    const oauth2Client = new OAuth2(
        process.env.CLIENT_ID2,
        process.env.CLIENT_SECRET2,
        "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN2
    });

    const accessToken = await new Promise((resolve, reject) => {
        oauth2Client.getAccessToken((err, token) => {
          if (err) {
            console.log('Failed to create access token :(');
            reject("Failed to create access token :(");
          }
          resolve(token);
        });
      });


    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: process.env.EMAIL,
            accessToken: accessToken,
            clientId: process.env.CLIENT_ID2,
            clientSecret: process.env.CLIENT_SECRET2,
            refreshToken: process.env.REFRESH_TOKEN2
        }
    });

    return transporter;
};


router.get("/:approvalId/approve", async function (req, res, next) {

    const approve = await approveApproval(req, res);

        res.status(200)
        req.flash("message", "The Approval approved Successfully.");
        req.flash("status", 200);

        var mailOptions =
        {
            from: process.env.EMAIL,
            to: approve.studentid.email,
            subject: `WELCOME to ${approve.clubid.name} Club`,
            text: `Congratulations ${approve.studentid.name}, your approval for joining the ${approve.clubid.name} Club is approved.`
        };

        let approveMail = async (mailOptions) => {
            let transporter = await createTransporter();
            transporter.sendMail(mailOptions, (error, info) => { if(error) return emailNotSent(res); });
        }
        await approveMail(mailOptions);

    res.redirect(`/club/${approve.clubid._id}`);

});

router.get("/:approvalId/decline", async function (req, res, next) {

    const decline = await declineApproval(req, res);

        res.status(200)
        req.flash("message", "The Approval declined Successfully.");
        req.flash("status", 200);

        var mailOptions = {
            from: process.env.EMAIL,
            to: decline.studentid.email,
            subject: `Approval Declined`,
            text: `Sorry ${decline.studentid.name}, you approval for joining the ${decline.clubid.name} Club was declined.`
        };

        let declineMail = async (mailOptions) => {
            let transporter = await createTransporter();
            transporter.sendMail(mailOptions, (error, info) => { if(error) return emailNotSent(res); });
        }
        await declineMail(mailOptions);

    res.redirect(`/club/${decline.clubid._id}`);

});

router.get("/:approvalId/meet", async function (req, res, next) {

    if (req.session.passport === undefined)
    return notLoggedIn(res);

    const { approvalId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(approvalId))
    return notValid(res);

    var approval;

    try {
        approval = await approvalModel.findById(approvalId)
            .populate("clubid", "presidentid")
            .populate("studentid", "name");

    } catch (error) {
        return dataUnaccesable(res);
    }

    if (approval == null)
    return notFound(res,"Approval");

    if (req.session.passport.user != approval.clubid.presidentid)
    return notAuthorized(res);

    res.render('scheduleInterview',{ approval });

});

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

    let scheduleMail = async (mailOptions) => {
        let transporter = await createTransporter();
        transporter.sendMail(mailOptions, (error, info) => { if(error) return emailNotSent(res); });
    };
    await scheduleMail(mailOptions);

});

export default router;