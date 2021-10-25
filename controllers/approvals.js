import mongoose from "mongoose";
import approvalModel from "../models/approvals.js";
import clubModel from "../models/clubs.js";

export const approveApproval = async (req,res) => {

    if(req.session.passport === undefined)
    {
        var err = new Error("You are not logged in.");
        err.status = 400;
        return err;
    }

    const { approvalId } = req.params;

    if(!mongoose.Types.ObjectId.isValid(approvalId))
    {
        var err = new Error("The Approval doesn't exsist.");
        err.status = 406;
        return err;
    }

    var approval;

    try {
        approval = await approvalModel.findOne({ _id: approvalId, approved: false, declined: false })
                                      .populate("clubid", "presidentid");

    } catch (error) {
        error.message = "Unable to connect to database.";
        return error;
    }
    
    if(approval != null)
    {
        if(req.session.passport.user != approval.clubid.presidentid )
        {
            var err = new Error("You are not president of club.");
            err.status = 400;
            return err;
        }

        try {
            await approvalModel.updateOne({ _id: approvalId }, { approved: true });
            approval = await approvalModel.findById(approvalId)
                                          .populate("studentid", [ "name", "email" ])
                                          .populate("clubid", "name");

            await clubModel.findByIdAndUpdate(approval.clubid, { $push: { memberids: approval.studentid._id }});
            return approval;
        
        } catch (error) {
            error.message = "Unable to connect with database.";
            return error;
        }
    }
    else
    {
        var err = new Error("The Approval doesn't exsist.");
        err.status = 400;
        return err;
    }
};

export const declineApproval = async (req,res) => {

    if(req.session.passport === undefined)
    {
        var err = new Error("You are not logged in.");
        err.status = 400;
        return err;
    }

    const { approvalId } = req.params;

    if(!mongoose.Types.ObjectId.isValid(approvalId))
    {
        var err = new Error("The Approval doesn't exsist.");
        err.status = 406;
        return err;
    }

    var approval;

    try {
        approval = await approvalModel.findOne({ _id: approvalId, approved: false, declined: false })
                                      .populate("clubid", "presidentid");

    } catch (error) {
        error.message = "Unable to connect to database.";
        return error;
    }
    
    if(approval != null)
    {
        if(req.session.passport.user != approval.clubid.presidentid )
        {
            var err = new Error("You are not president of club.");
            err.status = 400;
            return err;
        }

        try {
            await approvalModel.updateOne({ _id: approvalId }, { declined: true });
            approval = await approvalModel.findById(approvalId)
                                          .populate("studentid", [ "name", "email" ])
                                          .populate("clubid", "name");
            return approval;
        
        } catch (error) {
            error.message = "Unable to connect with database.";
            return error;
        }
    }
    else
    {
        var err = new Error("The Approval doesn't exsist.");
        err.status = 400;
        return err;
    }
};


export const postApproval = async (req,res) => {

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
        club = await clubModel.findOne({ _id: clubId });

    } catch (error) {
        error.message = "Unable to connect with database.";
        return error;

    }

    if(club.memberids.find((member) => member == req._passport.session.user))
    {
        var err = new Error("You are already member of this club.");
        err.status = 400;
        return err;
    }

    var checkapproval;

    try {
        checkapproval = await approvalModel.find({ studentid: req._passport.session.user, clubid: clubId});
    } catch (error) {
        error.message = "Unable to access database";
        return error;
        
    }

    if(checkapproval.length != 0)
    {
        var err = new Error("You have already submitted the approval.");
        err.status = 400;
        return err;
    }

    if(club != null)
    {
        const approval = { studentid: req._passport.session.user, clubid: clubId};
        const newapproval = new approvalModel(approval);
        try {
            await newapproval.save();
            return null;
            
        } catch (error) {
            error.message = "Unable to access database.";
            return error;            
        }
    }
    else {
        var err = new Error("The Club doesn't exsist.");
        err.status = 406;
        return err;
    }
};

export const getClubApprovals = async (req,res) => {

    if(req.session.passport === undefined)
    {
        return [];
    }

    const { clubId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(clubId)) {
        var err = new Error("Club not found.");
        err.status = 406;
        return err;
    }
    
    var club;

    try {
        club = await clubModel.findOne({ _id: clubId }, "presidentid");

    } catch (error) {
        error.message = "Unable to connect with database.";
        return error;

    }
    
    if(club != null)
    {
        if(req.session.passport.user != club.presidentid )
        {
            return [];
        }

        try {
            const clubapprovals = await approvalModel.find({ clubid: clubId, approved: false, declined: false }, "studentid")
                                                     .populate("studentid", "name");
            return clubapprovals;
        
        } catch (error) {
            error.message = "Unable to connect with database.";
            return error;
        }
    }
    else
    {
        var err = new Error("The Club doesn't exsist.")
        err.status = 400;
        return err;
    }
};