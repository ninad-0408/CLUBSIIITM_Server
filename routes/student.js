import express from "express";
import { getStudent, putStudent, delStudent } from "../controllers/students.js";

const router = express.Router();

router.get("/:studentId/profile", async function(req,res,next){

    const student = await getStudent(req,res);
    var isCurrStudent = false;

    if(Object.prototype.toString.call(student) === "[object Error]")
    {
        res.status(student.status)
        req.flash("message", student.message );
        req.flash("status", student.status);
        res.redirect("/home");
        return ;
    }
    else
    {
        if(student._id == req.session.passport.user)
        {
            isCurrStudent = true;
        }

        res.render('student',{ student, isCurrStudent, message: req.flash("message"), status: req.flash("status") });
    }

});

router.get("/:studentId/edit", async function(req,res,next){

    const student = await getStudent(req,res);

    if(Object.prototype.toString.call(student) === "[object Error]")
    {
        res.status(student.status)
        req.flash("message", student.message );
        req.flash("status", student.status);
        res.redirect("/home");
        return ;
    }
    else
    {
        if(student._id != req.session.passport.user)
        {
            var err = new Error("You are not authorized to edit this student.");
            err.status = 400;
            res.status(err.status)
            req.flash("message", err.message );
            req.flash("status", err.status);
            res.redirect(`/student/${student._id}/profile`);
            return ;
        }
    
        res.render('editstudent',{ student });
    }

});

router.post("/:studentId/", async function(req,res,next){

    const student = await putStudent(req,res);

    if(Object.prototype.toString.call(student) === "[object Error]")
    {
        res.status(student.status)
        req.flash("message", student.message );
        req.flash("status", student.status);
        res.redirect("/home");
        return ;
    }
    else
    {
        res.status(200)
        req.flash("message", "The student is updated successfully." );
        req.flash("status", 200);
    }

    res.redirect(`/student/${req.params.studentId}/profile`);

});

router.post("/:studentId/delete", async function(req,res,next){

    const student = await delStudent(req,res);

    if(Object.prototype.toString.call(student) === "[object Error]")
    {
        res.status(student.status)
        req.flash("message", student.message );
        req.flash("status", student.status);
        res.redirect("/home");
        return ;
    }
    else
    {
        res.status(200)
        req.flash("message", "The student is deleted successfully." );
        req.flash("status", 200);
    }
    res.redirect("/home");

});

export default router;
