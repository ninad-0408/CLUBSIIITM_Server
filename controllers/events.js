import mongoose from "mongoose";
import clubModel from "../models/clubs.js";
import eventModel from "../models/events.js";

export const getEvent = async (req,res) => {

    if(req.session.passport === undefined)
    {
        var err = new Error("You are not logged in.");
        err.status = 400;
        return err;
    }

    const { eventId } = req.params;

    if(!mongoose.Types.ObjectId.isValid(eventId))
    {
        var err = new Error("The Event doesn't exsist.");
        err.status = 406;
        return err;
    }

    var eventt;
    
    try {
        eventt = await eventModel.findOne({ _id: eventId });
        
    } catch (error) {
        error.message = "Unable to connect with database.";
        return error;     
    }

    if(eventt === null)
    {
        var err = new Error("The Event doesn't exsist.");
        err.status = 406;
        return err;
    }

    try {
        const event = await eventModel.findOne({ _id: eventId });
        return event;
        
    } catch (error) {
        error.message = "Unable to connect with database.";
        return error;
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
        error.message = "Unable to connect with database.";
        return error;
    }

};

export const postEvent = async (req,res) => {

    if(req.session.passport === undefined)
    {
        var err = new Error("You are not logged in.");
        err.status = 400;
        return err;
    }

    const { clubId } = req.params;
    
    if(!mongoose.Types.ObjectId.isValid(clubId))
    {
        var err = new Error("The Club doesn't exsist.");
        err.status = 406;
        return err; 
    }

    var club;

    try {
        club = await clubModel.findById(clubId);     
    } catch (error) {
        error.message("Unable to connect to database.");
        return error;
    }

    req.body.date = new Date(req.body.date + " " + req.body.time);

    const newevent = new eventModel(req.body);

    if(club != null)
    {
        if(club.presidentid != req.session.passport.user)
        {
            var err = new Error("You are not president of club.");
            err.status = 400;
            return err;
        }
        try {
            if(req.file != undefined)
            newevent.image = req.file.id;

            await newevent.save();
            
            try {
                await clubModel.findOneAndUpdate({ _id: clubId }, { $push: { eventids: newevent._id } });
                return newevent;
            } catch (error) {
                error.status = 400;
                error.message = "The club doesn't exsist.";
                return error;            
            }
        
        } catch (error) {
            error.message = "Meetlink or Event name already exsists or Date entered is invalid.";
            return error;     
        }
    }
    else
    {
        var err = new Error("The Club doesn't exsist.");
        err.status = 406;
        return err;
    }

};

export const putEvent = async (req,res) => {

    if(req.session.passport === undefined)
    {
        var err = new Error("You are not logged in.");
        err.status = 400;
        return err;
    }
    
    const { eventId } = req.params;
    var body = req.body;

    if(!mongoose.Types.ObjectId.isValid(eventId))
    {
        var err = new Error("The Event doesn't exsist.");
        err.status = 406;
        return err;
    }

    var event;
    
    try {
        event = await eventModel.findOne({ _id: eventId });
        
    } catch (error) {
        error.message = "Unable to connect with database.";
        return error;   
        
    }
    
    if(event!=null)
    {
        const club = await clubModel.findOne({ eventids: { $elemMatch: { $eq: event._id } } })

        if(club.presidentid != req.session.passport.user)
        {
            var err = new Error("You are not president of club.");
            err.status = 400;
            return err;
        }
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
    {
        var err = new Error("The Event doesn't exsist.");
        err.status = 406;
        return err;
    }
};

export const delEvent = async (req,res) => {

    if(req.session.passport === undefined)
    {
        var err = new Error("You are not logged in.");
        err.status = 400;
        return err;
    }

    const { eventId } = req.params;

    if(!mongoose.Types.ObjectId.isValid(eventId))
    {
        var err = new Error("The Event doesn't exsist.");
        err.status = 406;
        return err;
    }

    var event;

    try {
        event = await eventModel.findOne({ _id: eventId});
        
    } catch (error) {
        return error;  

    }
    
    if(event!=null)
    {
        const club = await clubModel.findOne({ eventids: { $elemMatch: { $eq: event._id } } })

        if(club.presidentid != req.session.passport.user)
        {
            var err = new Error("You are not president of club.");
            err.status = 400;
            return err;
        }
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
            return error;
        }
    }
    else
    {
        var err = new Error("The Event doesn't exsist.");
        err.status = 406;
        return err;
    }
};