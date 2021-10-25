import mongoose from "mongoose";
import clubModel from "../models/clubs.js";
import eventModel from "../models/events.js";
import { notValid, notAuthorized, notFound, dataUnaccesable, notLoggedIn } from "../alerts/errors.js";

export const getEvent = async (req,res) => {

    if(req.session.passport === undefined)
    return notLoggedIn(res);

    const { eventId } = req.params;

    if(!mongoose.Types.ObjectId.isValid(eventId))
    return notValid(res);

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
        return event;
        
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
        
        return events;
        
    } catch (error) {
        return dataUnaccesable(res);
    }

};

export const postEvent = async (req,res) => {

    if(req.session.passport === undefined)
    return notLoggedIn(res);

    const { clubId } = req.params;
    
    if(!mongoose.Types.ObjectId.isValid(clubId))
    return notValid(res);

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
                return newevent;
            } catch (error) {
                return dataUnaccesable(res);          
            }
        
        } catch (error) {
            error.message = "Meetlink or Event name already exsists or Date entered is invalid.";
            return error;     
        }
    }
    else  
    return notFound(res,"Club");

};

export const putEvent = async (req,res) => {

    if(req.session.passport === undefined)
    return notLoggedIn(res);
    
    const { eventId } = req.params;
    var body = req.body;

    if(!mongoose.Types.ObjectId.isValid(eventId))
    return notValid(res);

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
            return await eventModel.findOne(body);
        
        } catch (error) {
            error.message = "Meetlink or Event name already exsists or date entered is invalid.";
            return error;
        }
    }
    else  
    return notFound(res,"Event");
};

export const delEvent = async (req,res) => {

    if(req.session.passport === undefined)
    return notLoggedIn(res);

    const { eventId } = req.params;

    if(!mongoose.Types.ObjectId.isValid(eventId))
    return notValid(res);

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
            return event;
        
        } catch (error) {
            return dataUnaccesable(res);
        }
    }
    else  
    return notFound(res,"Event");
};