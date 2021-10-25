import express from "express";
import { getStudent, putStudent, delStudent } from "../controllers/students.js";
import { notAuthorized } from "../alerts/errors.js";

const router = express.Router();

router.get("/:studentId/profile", async function(req,res,next){

    const student = await getStudent(req,res);
    var isCurrStudent = false;


        if(student._id == req.session.passport.user)
        isCurrStudent = true;

        res.render('student',{ student, isCurrStudent, message: req.flash("message"), status: req.flash("status") });

});

router.get("/:studentId/edit", async function(req,res,next){

    const student = await getStudent(req,res);

        if(student._id != req.session.passport.user)
        return notAuthorized(res);
    
        res.render('editstudent',{ student });

});

router.post("/:studentId/", async function(req,res,next){

    const student = await putStudent(req,res);

        res.status(200)
        req.flash("message", "The student is updated successfully." );
        req.flash("status", 200);

    res.redirect(`/student/${req.params.studentId}/profile`);

});

router.post("/:studentId/delete", async function(req,res,next){

    const student = await delStudent(req,res);

        res.status(200)
        req.flash("message", "The student is deleted successfully." );
        req.flash("status", 200);

    res.redirect("/home");

});

export default router;
