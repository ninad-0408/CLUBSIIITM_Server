import approvalModel from "../models/approvals.js";
import clubModel from "../models/clubs.js";
import { notAuthorized, notFound, dataUnaccesable } from "../alerts/errors.js";

export const approveApproval = async (req,res) => {

    const { approvalId } = req.params;

    var approval;

    try {
        approval = await approvalModel.findOne({ _id: approvalId, approved: false, declined: false })
                                      .populate("clubid", "presidentid");

    } catch (error) {
        return dataUnaccesable(res);
    }
    
    if(approval != null)
    {
        if(!req.user._id.equals(approval.clubid.presidentid))
        return notAuthorized(res);

        try {
            await approvalModel.updateOne({ _id: approvalId }, { approved: true });
            approval = await approvalModel.findById(approvalId)
                                          .populate("studentid", [ "name", "email" ])
                                          .populate("clubid", "name");
                                          
            await clubModel.findByIdAndUpdate(approval.clubid, { $push: { memberids: approval.studentid._id }});
                                          
            var mailOptions = {
                from: process.env.EMAIL,
                to: approval.studentid.email,
                subject: `WELCOME to ${approval.clubid.name} Club`,
                text: `Congratulations ${approval.studentid.name}, your approval for joining the ${approval.clubid.name} Club is approved.`
            };
                                                                      
            const check = await sendMessage(mailOptions);
                            
            if(!check)
            return res.status(200).json({ approvalId });
            else
            return check.json({ approvalId });
        
        } catch (error) {
            return dataUnaccesable(res);
        }
    }
    else  
    return notFound(res,"Approval");
};

export const declineApproval = async (req,res) => {

    const { approvalId } = req.params;

    var approval;

    try {
        approval = await approvalModel.findOne({ _id: approvalId, approved: false, declined: false })
                                      .populate("clubid", "presidentid");

    } catch (error) {
        return dataUnaccesable(res);
    }
    
    if(approval != null)
    {
        if(!req.user._id.equals(approval.clubid.presidentid))
        return notAuthorized(res);

        try {
            await approvalModel.updateOne({ _id: approvalId }, { declined: true });
            approval = await approvalModel.findById(approvalId)
                                          .populate("studentid", [ "name", "email" ])
                                          .populate("clubid", "name");

            var mailOptions = {
                from: process.env.EMAIL,
                to: approval.studentid.email,
                subject: `Approval Declined`,
                text: `Sorry ${approval.studentid.name}, you approval for joining the ${approval.clubid.name} Club was declined.`
            };
                                          
            const check = await sendMessage(mailOptions);

            if(!check)
            return res.status(200).json({ approvalId });
            else
            return check.json({ approvalId });
        
        } catch (error) {
            return dataUnaccesable(res);
        }
    }
    else  
    return notFound(res,"Approval");
};


export const postApproval = async (req,res) => {

    const { clubId } = req.params;

    var club;

    try {
        club = await clubModel.findOne({ _id: clubId });

    } catch (error) {
        return dataUnaccesable(res);

    }

    if(club == null)
    return notFound(res,"Club");

    if(club.memberids.find((member) => req.user._id.equals(member)))
    {
        var err = new Error();
        err.message = "You are already member of this club.";
        err.status = 400;
        return res.status(err.status).json({ err });
    }

    var checkapproval;

    try {
        checkapproval = await approvalModel.find({ studentid: req.user._id, clubid: clubId});
    } catch (error) {
        return dataUnaccesable(res);        
    }

    if(checkapproval.length != 0)
    {
        var err = new Error();
        err.message = "You have already submitted the approval for this club.";
        err.status = 400;
        return res.status(err.status).json({ err });
    }

    const approval = { studentid: req.user._id, clubid: clubId};
    const newapproval = new approvalModel(approval);
    try {
        await newapproval.save();
        return res.status(200).json({ message: "Approval is submitted successfully."});
            
    } catch (error) {
        return dataUnaccesable(res);           
    }
    
};

export const getClubApprovals = async (req,res) => {
    
    const { clubId } = req.params;

    var club;

    try {
        club = await clubModel.findOne({ _id: clubId });

    } catch (error) {
        return dataUnaccesable(res);

    }

    if(club == null)
    return notFound(res,"Club");

    try {
        if(!req.user._id.equals(club.presidentid))
        return notAuthorized(res);

        const approvals = await approvalModel.find({ clubid: clubId, approved: false, declined: false })
                                             .populate('studentid', ['name']);

        return res.status(200).json({ approvals });

    } catch (error) {
        return dataUnaccesable(res);
    }

};
