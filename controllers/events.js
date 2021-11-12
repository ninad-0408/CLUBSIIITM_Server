import mongoose from "mongoose";
import clubModel from "../models/clubs.js";
import eventModel from "../models/events.js";
import { notAuthorized, notFound, dataUnaccesable } from "../alerts/errors.js";

export const getEvent = async (req,res) => {

    const { eventId } = req.params;

    var eventt;
    
    try {
        eventt = await eventModel.findOne({ _id: eventId });
        
    } catch (error) {
        return dataUnaccesable(res);     
    }

    if(eventt === null)  
    return notFound(res,"Event");

    try {
        const event = await eventModel.findOne({ _id: eventId });
        return res.status(200).json({ event });
        
    } catch (error) {
        return dataUnaccesable(res);
    }

};

export const getUpcomingEvents = async (req,res) => {

    try {
        const comp = new Date();
        const events = await eventModel.find()
                                       .where("date").gt(comp)
                                       .sort("date")
                                       .limit(3)
                                       .select("name");
        
        return res.status(200).json({ upcomingEvents });
        
    } catch (error) {
        return dataUnaccesable(res);
    }

};

export const postEvent = async (req,res) => {

    const { clubId } = req.params;

    var club;

    try {
        club = await clubModel.findById(clubId);     
    } catch (error) {
        return dataUnaccesable(res);
    }

    req.body.date = new Date(req.body.date + " " + req.body.time);

    const newevent = new eventModel(req.body);

    if(club != null)
    {
        if(club.presidentid != req.session.passport.user)
        return notAuthorized(res);

        try {
            if(req.file != undefined)
            newevent.image = req.file.id;

            await newevent.save();
            
            try {
                await clubModel.findOneAndUpdate({ _id: clubId }, { $push: { eventids: newevent._id } });
                return res.status(200).json({ newEvent: newevent, message: "Event created successfully.", clubId });
            } catch (error) {
                return dataUnaccesable(res);          
            }
        
        } catch (error) {
            return dataUnaccesable(res);    
        }
    }
    else  
    return notFound(res,"Club");

};

export const patchEvent = async (req,res) => {

    const { eventId } = req.params;
    var body = req.body;

    var event;
    
    try {
        event = await eventModel.findOne({ _id: eventId });
        
    } catch (error) {
        return dataUnaccesable(res);  
    }
    
    if(event!=null)
    {
        const club = await clubModel.findOne({ eventids: { $elemMatch: { $eq: event._id } } })

        if(club.presidentid != req.session.passport.user)
        return notAuthorized(res);

        try {
            if(!(req.file === undefined))
            {
                if(!(event.image === undefined))
                {
                    var gfs;
                    const conn = mongoose.connection;
                    gfs = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: "Images" });

                    await gfs.delete(new mongoose.Types.ObjectId(event.image));
                }

                body.image = req.file.id;
            }
            
            await eventModel.updateOne({ _id: eventId }, body);
            event = await eventModel.findById(eventId);
            return res.status(200).json({ event, clubId: club._id, message: "Event updated successfully." })
        
        } catch (error) {
            return dataUnaccesable(res); 
        }
    }
    else  
    return notFound(res,"Event");
};

export const delEvent = async (req,res) => {

    const { eventId } = req.params;

    var event;

    try {
        event = await eventModel.findOne({ _id: eventId});
        
    } catch (error) {
        return dataUnaccesable(res);
    }
    
    if(event!=null)
    {
        const club = await clubModel.findOne({ eventids: { $elemMatch: { $eq: event._id } } })

        if(club.presidentid != req.session.passport.user)
        return notAuthorized(res);

        try {
            if(event.image != undefined)
            {
                var gfs;
                const conn = mongoose.connection;
                gfs = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: "Images" });

                await gfs.delete(new mongoose.Types.ObjectId(event.image));
            }

            await clubModel.findByIdAndUpdate(club._id,{ $pull: { eventids: event._id } });
            await eventModel.deleteOne({ _id: eventId });
            return res.status(200).json({ eventId, clubId: club._id, message: "Event deleted successfully." })
        
        } catch (error) {
            return dataUnaccesable(res);
        }
    }
    else  
    return notFound(res,"Event");
};