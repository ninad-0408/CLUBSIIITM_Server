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
    
});

export default router;