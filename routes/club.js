import express from "express";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import { google } from "googleapis";
import clubModel from "../models/clubs.js";
import imageUpload from "../middleware/imageUpload.js";
import { getClub, putClub, removeMember, getJoinButton, getVerifyPresident } from "../controllers/clubs.js";
import { postEvent } from "../controllers/events.js";
import { getClubApprovals, postApproval } from "../controllers/approvals.js";
import { notValid, notAuthorized, notFound, emailNotSent, dataUnaccesable, notLoggedIn } from "../alerts/errors.js";

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
        accessToken,
        clientId: process.env.CLIENT_ID2,
        clientSecret: process.env.CLIENT_SECRET2,
        refreshToken: process.env.REFRESH_TOKEN2
      }
    });

    return transporter;
};


router.get("/:clubId", async function (req,res, next) {

    const club = await getClub(req, res);
    const approvals = await getClubApprovals(req, res);
    const joinbutton = await getJoinButton(req,res);
    const verifypresident = await getVerifyPresident(req,res);

});

router.get("/:clubId/edit", async function(req,res,next){

    const club = await getClub(req,res);

    if(req.session.passport === undefined)
    return notLoggedIn(res);

    if(club.presidentid._id != req.session.passport.user)
    return notAuthorized(res);    
    
    res.render('update_club.ejs',{ club: club });

});

router.post("/:clubId", imageUpload.single("image"), async function(req,res,next) {

    const club = await putClub(req,res);

        res.status(200)
        req.flash("message", "The club is updated successfully." );
        req.flash("status", 200);
});

router.get("/:clubId/event", async function (req, res, next) {

    if (req.session.passport === undefined)
    return notLoggedIn(res);

    const { clubId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(clubId))
    return notValid(res);

    var club;

    try {
        club = await clubModel.findOne({ _id: clubId });

    } catch (error) {
        return dataUnaccesable(res);
    }

    if (club === null)
    return notFound(res,"Club");

    if (club.presidentid != req.session.passport.user)
    return notAuthorized(res);

    res.status(200).render('addEvent', { club });
});

router.post("/:clubId/event", imageUpload.single("image"), async function (req, res, next) {

    const event = await postEvent(req, res);


        res.status(200)
        req.flash("message", "The Event is created Successfully." );
        req.flash("status", 200);

});

router.post("/:clubId/approval", async function(req,res,next) {

    const approval = await postApproval(req, res);

        res.status(200)
        req.flash("message", "Your approval has been submitted successfully." );
        req.flash("status", 200);

});

router.post("/:clubId/remove/:studentId", async function(req,res,next) {

    const member = await removeMember(req,res);

        res.status(200)
        req.flash("message", "The member has been removed successfully." );
        req.flash("status", 200);

        var mailOptions = {
            from: process.env.EMAIL,
            to: member.student.email,
            subject: `Fired from ${member.club.name}`,
            text: `Thank you for being with us. Sorry ${member.student.name}, you got fired from ${member.club.name} Club.`
        };

        let removeStudent = async (mailOptions) =>{
            let transporter = await createTransporter();
            transporter.sendMail(mailOptions, (error, info) => { if(error) return emailNotSent(res); });
        }
        await removeStudent(mailOptions);

});

export default router;