import mongoose from "mongoose";
import approvalModel from "../models/approvals.js";
import clubModel from "../models/clubs.js";
import { notValid, notAuthorized, notFound, dataUnaccesable, notLoggedIn } from "../alerts/errors.js";

export const approveApproval = async (req,res) => {

    if(req.session.passport === undefined)
    return notLoggedIn(res);

    const { approvalId } = req.params;

    if(!mongoose.Types.ObjectId.isValid(approvalId))
    return notValid(res);

    var approval;

    try {
        approval = await approvalModel.findOne({ _id: approvalId, approved: false, declined: false })
                                      .populate("clubid", "presidentid");

    } catch (error) {
        return dataUnaccesable(res);
    }
    
    if(approval != null)
    {
        if(req.session.passport.user != approval.clubid.presidentid )
        return notAuthorized(res);

        try {
            await approvalModel.updateOne({ _id: approvalId }, { approved: true });
            approval = await approvalModel.findById(approvalId)
                                          .populate("studentid", [ "name", "email" ])
                                          .populate("clubid", "name");

            await clubModel.findByIdAndUpdate(approval.clubid, { $push: { memberids: approval.studentid._id }});
            return res.status(200).json({ approval });
        
        } catch (error) {
            return dataUnaccesable(res);
        }
    }
    else  
    return notFound(res,"Approval");
};

export const declineApproval = async (req,res) => {

    if(req.session.passport === undefined)
    return notLoggedIn(res);

    const { approvalId } = req.params;

    if(!mongoose.Types.ObjectId.isValid(approvalId))
    return notValid(res);

    var approval;

    try {
        approval = await approvalModel.findOne({ _id: approvalId, approved: false, declined: false })
                                      .populate("clubid", "presidentid");

    } catch (error) {
        return dataUnaccesable(res);
    }
    
    if(approval != null)
    {
        if(req.session.passport.user != approval.clubid.presidentid )
        return notAuthorized(res);

        try {
            await approvalModel.updateOne({ _id: approvalId }, { declined: true });
            approval = await approvalModel.findById(approvalId)
                                          .populate("studentid", [ "name", "email" ])
                                          .populate("clubid", "name");
            return res.status(200).json({ approvalId });
        
        } catch (error) {
            return dataUnaccesable(res);
        }
    }
    else  
    return notFound(res,"Approval");
};


export const postApproval = async (req,res) => {

    if(req.session.passport === undefined)
    return notLoggedIn(res);

    const { clubId } = req.params;
    
    if(!mongoose.Types.ObjectId.isValid(clubId))
    return notValid(res);

    var club;

    try {
        club = await clubModel.findOne({ _id: clubId });

    } catch (error) {
        return dataUnaccesable(res);

    }

    if(club == null)
    return notFound(res,"Club");

    if(club.memberids.find((member) => member == req._passport.session.user))
    {
        var err = new Error("You are already member of this club.");
        err.status = 400;
        return res.status(err.status).json({ err });
    }

    var checkapproval;

    try {
        checkapproval = await approvalModel.find({ studentid: req._passport.session.user, clubid: clubId});
    } catch (error) {
        return dataUnaccesable(res);        
    }

    if(checkapproval.length != 0)
    {
        var err = new Error("You have already submitted the approval for this club.");
        err.status = 400;
        return res.status(err.status).json({ err });
    }

    const approval = { studentid: req._passport.session.user, clubid: clubId};
    const newapproval = new approvalModel(approval);
    try {
        await newapproval.save();
        return res.status(200).json({ message: "Approval is submitted successfully."});
            
    } catch (error) {
        return dataUnaccesable(res);           
    }
    
};

export const getClubApprovals = async (req,res) => {

    if(req.session.passport === undefined)
    return [];

    const { clubId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(clubId))
    return notValid(res);
    
    var club;

    try {
        club = await clubModel.findOne({ _id: clubId }, "presidentid");
    } catch (error) {
        return dataUnaccesable(res);
    }
    
    if(club != null)
    {
        if(req.session.passport.user != club.presidentid )
        return [];

        try {
            const clubapprovals = await approvalModel.find({ clubid: clubId, approved: false, declined: false }, "studentid")
                                                     .populate("studentid", "name");
            return res.status(200).json({ clubapprovals, clubId });
        
        } catch (error) {
            return dataUnaccesable(res);
        }
    }
    else  
    return notFound(res,"Club");
};