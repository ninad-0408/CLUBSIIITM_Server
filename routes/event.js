import express from "express";
import { getEvent, putEvent, delEvent } from "../controllers/events.js";
import imageUpload from "../middleware/imageUpload.js";
import clubModel from "../models/clubs.js";

const router = express.Router();

router.get("/:eventId", async function(req,res,next) {

    const event = await getEvent(req,res);

    if(Object.prototype.toString.call(event) === "[object Error]")
    {
        res.status(event.status)
        req.flash("message", event.message );
        req.flash("status", event.status);
        res.redirect("/home");
        return ;
    }
    else
    {
        var ispresident = false;
        var club;
        try {
            club = await clubModel.findOne({ eventids: { $elemMatch: { $eq: event._id } } });
            
        } catch (error) {
            error.message = "Unable to connect to database."
            res.status(error.status)
            req.flash("message", error.message );
            req.flash("status", error.status);
            res.redirect(`/event/${event._id}`);
            return ;         
        }

        if(club.presidentid == req.session.passport.user)
        {
            ispresident = true;
        }

        res.status(200).render('events', { event, ispresident, message: req.flash("message"), status: req.flash("status") });
    }
});

router.get("/:eventId/edit", async function(req,res,next){

    if (req.session.passport === undefined) {
        var err = new Error("You are not logged in.");
        err.status = 400;
        res.status(err.status)
        req.flash("message", err.message );
        req.flash("status", err.status);
        res.redirect("/home");
        return ;
    }

    const event = await getEvent(req,res);

    if(Object.prototype.toString.call(event) === "[object Error]")
    {
        res.status(event.status)
        req.flash("message", event.message );
        req.flash("status", event.status);
        res.redirect("/home");
        return ;
    }
    else
    {
        var club;
        try {
            club = await clubModel.findOne({ eventids: { $elemMatch: { $eq: event._id } } });
            
        } catch (error) {
            error.message = "Unable to connect to database."
            res.status(error.status)
            req.flash("message", error.message );
            req.flash("status", error.status);
            res.redirect(`/event/${event._id}`);
            return ;           
        }

        if(club.presidentid != req.session.passport.user)
        {
            var err = new Error("You are not president of club.");
            err.status = 400;
            res.status(err.status)
            req.flash("message", err.message );
            req.flash("status", err.status);
            res.redirect(`/event/${event._id}`);
            return ;
        }

        res.status(200).render('edit_events',{ event: event });
    }

});

router.post("/:eventId", imageUpload.single("image"), async function(req,res,next) {

    const event = await putEvent(req,res);

    if(Object.prototype.toString.call(event) === "[object Error]")
    {
        res.status(event.status)
        req.flash("message", event.message );
        req.flash("status", event.status);
        res.redirect("/home");
        return ;
    }
    else
    {
        res.status(200)
        req.flash("message", "The event is updated successfully." );
        req.flash("status", 200);
    }

    res.redirect(`/event/${event._id}`);
});

router.post("/:eventId/delete", async function(req,res,next) {

    const event = await delEvent(req,res);

    if(Object.prototype.toString.call(event) === "[object Error]")
    {
        res.status(event.status)
        req.flash("message", event.message );
        req.flash("status", event.status);
        res.redirect("/home");
        return ;
    }
    else
    {
        res.status(200)
        req.flash("message", "The event is deleted successfully." );
        req.flash("status", 200);
    }

    res.redirect("/home");
});

export default router;