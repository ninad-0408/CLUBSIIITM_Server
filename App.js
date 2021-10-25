import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import Googlepassport from "passport-google-oauth20";
import studentModel from "./models/students.js";
import connectflash from "connect-flash";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


import dotenv from "dotenv";
dotenv.config();


import homeRoute from "./routes/home.js";
import clubRoute from "./routes/club.js";
import eventRoute from "./routes/event.js";
import approvalRoute from "./routes/approval.js";
import studentRoute from "./routes/student.js";

const GoogleStrategy = Googlepassport.Strategy;
const app = express();

app.set('view engine', 'ejs');

app.use(cors());
app.use(express.json({ limit: "30mb", extended: true }))
app.use(express.urlencoded({ limit: "30mb", extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.secret,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(connectflash());
app.use("/home", homeRoute);
app.use("/club", clubRoute);
app.use("/event", eventRoute);
app.use("/approval",approvalRoute);
app.use("/student", studentRoute);
app.use("/", homeRoute);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(PORT, () => console.log(`The server is running on port: ${PORT}`)))
  .catch((error) => console.log(error.message));


var gfs;
const conn = mongoose.connection;

conn.once("open", () => {
    gfs = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: "Images" });
});

app.get("/", (req,res) => {
  res.redirect("/home");
});

app.get("/image/:imageId", async (req,res) => {
    try {
      const readStream = await gfs.openDownloadStream(new mongoose.Types.ObjectId(req.params.imageId));
      readStream.pipe(res);
    } catch (error) {
      console.log(error)
      res.send(' ');
    }
});


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
      // console.log(profile.emails[0].value.substring(11, 23));
      if (!student && profile.emails[0].value.substring(11, 23)=="@iiitm.ac.in") {
        var branch=profile.emails[0].value.substring(0, 3).toUpperCase() ;
        var rollno=profile.emails[0].value.substring(4, 8)+branch+profile.emails[0].value.substring(8, 11);
        var batch=profile.emails[0].value.substring(4, 8);
        var student = new studentModel({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          branch:branch,
          rollNo:rollno,
          batch:batch
        });
        student.save(function (err, studentModel) {
          if (err) return err;
        });
      }
      return cb(err, student);
    });
  }
));

app.get("/auth/google",
  passport.authenticate('google', {
    scope: ["profile", "email"]
  }));

app.get("/auth/google/club",
  passport.authenticate('google', { failureRedirect: '/home' }),
  function (req, res) {
    req.flash("status", 200);
    req.flash("message", "You have logged in successfully.")
    res.redirect('/home');
  });

  app.get('/logout', function (req, res){
    req.flash("status", 200);
    req.flash("message", "You have logged out successfully.")
    req.logout();
    res.redirect('/home');
  });