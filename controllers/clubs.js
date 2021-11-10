import mongoose from "mongoose";
import clubModel from "../models/clubs.js";
import studentModel from "../models/students.js";
import { notValid, notAuthorized, notFound, dataUnaccesable, notLoggedIn } from "../alerts/errors.js";

export const getClub = async (req, res) => {

    const { clubId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(clubId))
    return notValid(res);

    var club0;

    try {
        club0 = await clubModel.findOne({ _id: clubId });

    } catch (error) {
        return dataUnaccesable(res);
    }

    if(club0 != null)
    {
        try {
            const club = await clubModel.findOne({ _id: clubId })
                                        .populate("memberids", "name")
                                        .populate("presidentid", "name")
                                        .populate("eventids", ["name", "image"]);
                                        // add approvals according to auth.
            return res.status(200).json({ club });

        } catch (error) {
            return dataUnaccesable(res);
        }
    }
    else  
    return notFound(res,"Club");

};

export const getClubs = async (req, res) => {

    try {
        const clubs = await clubModel.find({ }, ["name", "image", "typeofclub"]);
        return res.status(200).json({ clubs });

    } catch (error) {
        return dataUnaccesable(res);
    }

};

export const patchClub = async (req, res) => {

    if(req.session.passport === undefined)
    return notLoggedIn(res);

    const { clubId } = req.params;

    if(!mongoose.Types.ObjectId.isValid(clubId))
    return notValid(res);

    var body = req.body;
    var club;

    try {
        club = await clubModel.findById(clubId);

    } catch (error) {
        return dataUnaccesable(res);
    }

    if (club != null) 
    {
        if(req.session.passport.user != club.presidentid )
        return notAuthorized(res);

        try {
            if(!(req.file === undefined))
            {
                if(!(club.image === undefined))
                {
                    var gfs;
                    const conn = mongoose.connection;
                    gfs = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: "Images" });

                    await gfs.delete(new mongoose.Types.ObjectId(club.image));
                }

                body.image = req.file.id;
            }

            await clubModel.updateOne({ _id: clubId }, body);
            club = await clubModel.findById(clubId);
            // add populate and add approvals
            return res.status(200).json({ club });

        } catch (error) {
            return dataUnaccesable(res);
        }
    }
    else  
    return notFound(res,"Club");
};

export const removeMember = async (req,res) => {

    if(req.session.passport === undefined)
    return notLoggedIn(res);

    const { clubId, studentId } = req.params;

    if(!mongoose.Types.ObjectId.isValid(clubId))
    return notValid(res);

    if(!mongoose.Types.ObjectId.isValid(studentId))
    return notValid(res);

    var student;

    try {
        student = await studentModel.findById(studentId);        
    } catch (error) {
        return dataUnaccesable(res);           
    }

    if(student === null)  
    return notFound(res,"Student");

    var club;

    try {
        club = await clubModel.findOne({ _id: clubId });

    } catch (error) {
        return dataUnaccesable(res);
    }

    if (club != null) 
    {
        if(req.session.passport.user != club.presidentid )
        return notAuthorized(res);

        if(club.memberids.indexOf(student._id) === -1)
        {
            var err = new Error()
            err.message = "The Student is not member of this club.";
            err.status = 403;
            return res.status(err.status).json({ err });
        }

        try {
            club = await clubModel.updateOne({ _id: clubId }, { $pull: { memberids: studentId }});
            // add populate and add approvals
            return res.status(200).json({ club });

        } catch (error) {
            return dataUnaccesable(res);
        }
    }
    else   
    return notFound(res,"Club");
};
