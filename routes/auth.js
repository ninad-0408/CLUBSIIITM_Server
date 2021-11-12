import express from "express";
import passport from "passport";
import Googlepassport from "passport-google-oauth20";
import studentModel from "../models/students.js";

import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

const GoogleStrategy = Googlepassport.Strategy;
passport.serializeUser(function (studentModel, done) {
    done(null, studentModel.id);
});

passport.deserializeUser(function (id, done) {
    studentModel.findById(id, function (err, studentModel) {
        done(err, studentModel);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
    function (accessToken, refreshToken, profile, cb) {

        studentModel.findOne({
            googleId: profile.id
        }, function (err, student) {
            if (!student && profile.emails[0].value.substring(11, 23) == "@iiitm.ac.in") {
                var branch = profile.emails[0].value.substring(0, 3).toUpperCase();
                var rollno = profile.emails[0].value.substring(4, 8) + branch + profile.emails[0].value.substring(8, 11);
                var batch = profile.emails[0].value.substring(4, 8);
                var student = new studentModel({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    googleId: profile.id,
                    branch: branch,
                    rollNo: rollno,
                    batch: batch
                });
                student.save(function (err, studentModel) {
                    if (err) return err;
                });
            }
            return cb(err, student);
        });
    }
));

router.get("/google",
    passport.authenticate('google', {
        scope: ["profile", "email"]
    }));

router.get("/google/club",
    passport.authenticate('google', { failureRedirect: '/home' }),
    function (req, res) {
        console.log(req.user);
        res.status(200).json({ message: 'You are logged in successfully.' });
    });

router.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
        if (!err)
            res.status(200).json({ message: 'You have logged out successfully.' });
        else {
            err.message = 'Unable to logout right now try again later.';
            err.status = 500;
            res.status(err.status).json({ err });
        }
    })
});


export default router;