import express from "express";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import clubModel from "../models/clubs.js";
import imageUpload from "../middleware/imageUpload.js";
import { getClub, putClub, removeMember, getJoinButton, getVerifyPresident } from "../controllers/clubs.js";
import { postEvent } from "../controllers/events.js";
import { getClubApprovals, postApproval } from "../controllers/approvals.js";
import { google } from "googleapis";
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

    switch ("[object Error]") {
        case Object.prototype.toString.call(club):
            res.status(club.status)
            req.flash("message", club.message );
            req.flash("status", club.status);
            res.redirect("/home");
            break;

        case Object.prototype.toString.call(approvals):
            res.status(approvals.status)
            req.flash("message", approvals.message );
            req.flash("status", approvals.status);
            res.redirect("/home");
            break;

        case Object.prototype.toString.call(joinbutton):
            res.status(joinbutton.status)
            req.flash("message", joinbutton.message );
            req.flash("status", joinbutton.status);
            res.redirect("/home");
            break;
        
        case Object.prototype.toString.call(verifypresident):
            res.status(verifypresident.status)
            req.flash("message", verifypresident.message );
            req.flash("status", verifypresident.status);
            res.redirect("/home");
            break;

        default:
            res.render('club',{ club, approvals, joinbutton, verifypresident, message: req.flash("message"), status: req.flash("status") });
            break;
    }
});

router.get("/:clubId/edit", async function(req,res,next){

    const club = await getClub(req,res);

    if(req.session.passport === undefined)
    {
        var err = new Error("You are not logged in.");
        err.status = 400;
        res.status(err.status)
        req.flash("message", err.message );
        req.flash("status", err.status);
        res.redirect(`/club/${req.params.clubId}`);
        return;
    }

    if(Object.prototype.toString.call(club) === "[object Error]")
    {
        res.status(club.status)
        req.flash("message", club.message );
        req.flash("status", club.status);
        res.redirect(`/club/${req.params.clubId}`);
        return;
    }
    else
    {
        if(club.presidentid._id != req.session.passport.user)
        {
            var err = new Error("You are not president of club.");
            err.status = 400;
            res.status(err.status)
            req.flash("message", err.message );
            req.flash("status", err.status);
            res.redirect(`/club/${req.params.clubId}`);
            return;
        }
    
    }
    
    res.render('update_club.ejs',{ club: club });

});

router.post("/:clubId", imageUpload.single("image"), async function(req,res,next) {

    const club = await putClub(req,res);

    if(Object.prototype.toString.call(club) === "[object Error]")
    {
        res.status(club.status)
        req.flash("message", club.message );
        req.flash("status", club.status);
    }
    else
    {
        res.status(200)
        req.flash("message", "The club is updated successfully." );
        req.flash("status", 200);
    }

    res.redirect(`/club/${req.params.clubId}`);
});

router.get("/:clubId/event", async function (req, res, next) {

    if (req.session.passport === undefined) {
        var err = new Error("You are not logged in.");
        err.status = 400;
        res.status(err.status)
        req.flash("message", err.message );
        req.flash("status", err.status);
        res.redirect(`/club/${req.params.clubId}`);
        return;
    }

    const { clubId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(clubId)) {
        var err = new Error("The Club doesn't exsist.");
        err.status = 406;
        res.status(err.status)
        req.flash("message", err.message );
        req.flash("status", err.status);
        res.redirect(`/club/${req.params.clubId}`);
        return;
    }

    var club;

    try {
        club = await clubModel.findOne({ _id: clubId });

    } catch (error) {
        error.message = "Unable to connect with database.";
        res.status(error.status)
        req.flash("message", error.message );
        req.flash("status", error.status);
        res.redirect(`/club/${req.params.clubId}`);
        return;
    }

    if (club === null) {
        var err = new Error("The Club doesn't exsist.");
        err.status = 406;
        res.status(err.status)
        req.flash("message", err.message );
        req.flash("status", err.status);
        res.redirect(`/club/${req.params.clubId}`);
        return;
    }

    if (club.presidentid != req.session.passport.user) {
        var err = new Error("You are not president of club.");
        err.status = 400;
        res.status(err.status)
        req.flash("message", err.message );
        req.flash("status", err.status);
        res.redirect(`/club/${req.params.clubId}`);
        return;
    }

    res.status(200).render('addEvent', { club });
});

router.post("/:clubId/event", imageUpload.single("image"), async function (req, res, next) {

    const event = await postEvent(req, res);

    if(Object.prototype.toString.call(event) === "[object Error]")
    {
        res.status(event.status)
        req.flash("message", event.message );
        req.flash("status", event.status);
    }
    else
    {
        res.status(200)
        req.flash("message", "The Event is created Successfully." );
        req.flash("status", 200);
    }

    res.redirect(`/club/${req.params.clubId}`);

});

router.post("/:clubId/approval", async function(req,res,next) {

    const approval = await postApproval(req, res);

    if (Object.prototype.toString.call(approval) === "[object Error]") 
    {
        res.status(approval.status)
        req.flash("message", approval.message );
        req.flash("status", approval.status);
    }
    else 
    {
        res.status(200)
        req.flash("message", "Your approval has been submitted successfully." );
        req.flash("status", 200);
    }

    res.redirect(`/club/${req.params.clubId}`);

});

router.post("/:clubId/remove/:studentId", async function(req,res,next) {

    const member = await removeMember(req,res);

    if(Object.prototype.toString.call(member) === "[object Error]")
    {
        res.status(member.status)
        req.flash("message", member.message );
        req.flash("status", member.status);
    }
    else
    {
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
            transporter.sendMail(mailOptions, function (error, info) {
            error.message = "Unable to send mail right now.";
            console.log(error.message);
            error.status = 500;
            res.status(error.status)
            req.flash("message", error.message );
            req.flash("status", error.status);
        });
        }
        await removeStudent(mailOptions);
    }

    res.redirect(`/club/${req.params.clubId}`);

});

export default router;