import express from "express";
import { getEvent, putEvent, delEvent } from "../controllers/events.js";
import clubModel from "../models/clubs.js";
import imageUpload from "../middleware/imageUpload.js";
import { notAuthorized, dataUnaccesable, notLoggedIn } from "../alerts/errors.js";

const router = express.Router();

router.get("/:eventId", async function(req,res,next) {

    const event = await getEvent(req,res);

        var ispresident = false;
        var club;
        try {
            club = await clubModel.findOne({ eventids: { $elemMatch: { $eq: event._id } } });
            
        } catch (error) {
            return dataUnaccesable(res);        
        }

        if(club.presidentid == req.session.passport.user)
        ispresident = true;

        res.status(200).render('events', { event, ispresident, message: req.flash("message"), status: req.flash("status") });

});

router.get("/:eventId/edit", async function(req,res,next){

    if (req.session.passport === undefined)
    return notLoggedIn(res);

    const event = await getEvent(req,res);

        var club;
        try {
            club = await clubModel.findOne({ eventids: { $elemMatch: { $eq: event._id } } });
            
        } catch (error) {
            return dataUnaccesable(res);          
        }

        if(club.presidentid != req.session.passport.user)
        return notAuthorized(res);

        res.status(200).render('edit_events',{ event: event });

});

router.post("/:eventId", imageUpload.single("image"), async function(req,res,next) {

    const event = await putEvent(req,res);

        res.status(200)
        req.flash("message", "The event is updated successfully." );
        req.flash("status", 200);

    res.redirect(`/event/${event._id}`);
});

router.post("/:eventId/delete", async function(req,res,next) {

    const event = await delEvent(req,res);

        res.status(200)
        req.flash("message", "The event is deleted successfully." );
        req.flash("status", 200);

    res.redirect("/home");
});

export default router;