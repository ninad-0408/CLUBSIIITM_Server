import express from "express";
import { getTechClubs, getCultClubs } from "../controllers/clubs.js";
import { getUpcomingEvents } from "../controllers/events.js";

const router = express.Router();

router.get('/', async function(req,res,next) {

    const techClubs = await getTechClubs(req,res);
    const cultClubs = await getCultClubs(req,res);
    const recentevents = await getUpcomingEvents(req,res);
    var isLoggedIn;
    if(req.user===undefined)
    isLoggedIn=false;
    else{
        isLoggedIn=true;
        var studentName=req.user.name;
        var studentId=req.session.passport.user;
    }

    switch ("[object Error]") {
        case Object.prototype.toString.call(techClubs):
            if((techClubs.status) < 500)
            res.status(techClubs.status).send(techClubs.message);
            else
            next(techClubs.message);
            break;
        
        case Object.prototype.toString.call(cultClubs):
            if((cultClubs.status) < 500)
            res.status(cultClubs.status).send(cultClubs.message);
            else
            next(cultClubs.message);
            break;
        
        case Object.prototype.toString.call(recentevents):
            if((recentevents.status) < 500)
            res.status(recentevents.status).send(recentevents.message);
            else
            next(recentevents.message);
            break;
    
        default:
            if(isLoggedIn)
            res.status(200).render('home', {techClubs, cultClubs, recentevents, isLoggedIn, studentName, studentId,  message: req.flash("message"), status: req.flash("status")});
            else
            res.status(200).render('home', {techClubs, cultClubs, recentevents, isLoggedIn, message: req.flash("message"), status: req.flash("status") });
            break;
    }
    
});

export default router;