// requiring packages

var exp  = require("express"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    cookieSession = require("cookie-session"),
    bp = require("body-parser"),
    passportSetup = require("./config/passport-setup"),
    attendance = require("./models/attendancemodel"),
    mark = require("./models/markmodel"),
    staff = require("./models/staffmodel"),
    app  = exp();

// connecting mongodb    
mongoose.connect("mongodb://localhost/sstudent_app",{useNewUrlParser : true , useUnifiedTopology: true },function(){
    console.log("connected");
});


// attendance and mark if not present in database
var dAttendance={
    "present":[],
    "absent":[]
}
var dMark={
    "tamil":{"score":null,"icon":"fas fa-gopuram"},
    "english":{"score":null,"icon":"fab fa-amilia"},
    "maths":{"score":null,"icon":"fas fa-calculator"},
    "science":{"score":null,"icon":"fas fa-atom"},
    "social":{"score":null,"icon":"fas fa-archway"}
}


// basic set-ups
app.use(exp.static("public"));
app.use(bp.urlencoded({extended: true}));
app.set("view engine","ejs");
app.use(cookieSession({
    keys:["iamabaaaadcop"]
}));


//passport setup
app.use(passport.initialize());
app.use(passport.session());


//current user for all routes
app.use(function(req,res,next){
    res.locals.currentUser=req.user;
    next();
})


//land route
app.get("/", (req,res)=>{
    res.render("land");
})


//routes that get to google consent page
app.get("/auth/google",passport.authenticate("google-student",{
    scope : ['profile']
}))
app.get("/auth/google-staff",passport.authenticate("google-staff",{
    scope : ['profile']
}))


//logout route
app.get("/auth/logout",function(req,res){
    req.logout();
    res.redirect("/");
})

// consent screen redirect routes 
app.get("/auth/profile",passport.authenticate("google-student"),function(req,res){
    if(req.user.profession === "student"){
        res.redirect("/auth/profile-info");
    }
    else if(req.user.profession === "staff"){
        res.redirect("/auth/profile-info-staff");
    }
    else if(req.user.profession === "admin"){
        res.redirect("/auth/profile-info-admin");
    }
})
app.get("/auth/profile-staff",passport.authenticate("google-staff"),function(req,res){
    if(req.user.profession === "staff"){
        res.redirect("/auth/profile-info-staff");
    }
    else if(req.user.profession === "admin"){
        res.redirect("/auth/profile-info-admin");
    }
})


//student info route
app.get("/auth/profile-info",function(req,res){
    res.render("student/info");
})

//student attendance route
app.get("/auth/profile-attendance",function(req,res){
    attendance.findOne({stud_id:req.user.googleId},function(err,fAttendance){
        if(fAttendance){
            res.render("student/attendance",{attendance:fAttendance});
        }
        else{
            res.render("student/attendance",{attendance:dAttendance});
        }
    })
})


//student present and absent days route
app.get("/auth/profile-attendance1",function(req,res){
    attendance.findOne({stud_id:req.user.googleId},function(err,fAttendance){
        if(fAttendance){
            console.log(fAttendance.present);
            console.log(fAttendance.absent);
            res.render("student/attendance1",{attendance:fAttendance});
        }
        else{
            res.render("student/attendance1",{attendance:dAttendance});
        }
        
    })
})

//student mark route
app.get("/auth/profile-mark",function(req,res){
    mark.findOne({stud_id:req.user.googleId},function(err,fMark){
        if(fMark){
            var Mark = fMark.toObject();
            res.render("student/mark",{mark:Mark});
        }
        else{
            res.render("student/mark",{mark:dMark});
        }  
    })
})

//student report route
app.get("/auth/profile-report",reportcalc,function(req,res){
    res.render("student/report");
})

//admin info route
app.get("/auth/profile-info-admin",function(req,res){
    res.render("admin/info");
})

//Registering staff through admin route
app.get("/auth/profile-add_staff-admin",function(req,res){
    res.render("admin/staff_registration");
})

//Removing a staff through admin route
app.get("/auth/profile-remove_staff-admin",function(req,res){
    res.render("admin/staff_remove");
})

//removing staff deleting from the database (post route)
app.post("/auth/profile-remove_staff-admin",function(req,res){
    staff.findOneAndDelete({googleId:req.body.staff_id},function(err){
        res.redirect("back");
    })
})

//staff info route
app.get("/auth/profile-info-staff",function(req,res){
    res.render("staff/info");
})

//attendance update get route 
app.get("/auth/profile-attendance-update",function(req,res){
    res.render("staff/attendance");
})

//attendance update storing in database (post route)
app.post("/auth/profile-attendance-update",async function(req,res){
    await attendance.findOne({stud_id:req.body.stud_id},function(err,fAttendance){
        if(fAttendance){
            if(fAttendance.present.includes(req.body.date) || fAttendance.absent.includes(req.body.date)){
                console.log("sss it inc");
                fAttendance.present = fAttendance.present.filter(item => item !== req.body.date);
                fAttendance.absent = fAttendance.absent.filter(item => item !== req.body.date);
            }
            if(req.body.action === "present"){
                fAttendance.present.push(req.body.date);
                fAttendance.save();
            }
            else if(req.body.action === "absent"){
                fAttendance.absent.push(req.body.date);
                fAttendance.save();
            }
        }
        else{
            console.log(req.body.stud_id);
            attendance.create({
                stud_id: req.body.stud_id
             },function(err1,cAttendance){
                if(req.body.action === "present"){
                    console.log("cAtt :   " + cAttendance);
                    cAttendance.present.push(req.body.date);
                    cAttendance.save();
                }
                else if(req.body.action === "absent"){
                    cAttendance.absent.push(req.body.date);
                    cAttendance.save();
                }
            })
        }
    })
    res.redirect("back");
})

//mark update entering student id (get route)
app.get("/auth/profile-mark-update",function(req,res){
    res.render("staff/mark");
})

//mark update entering marks (post route)
app.post("/auth/profile-mark-update1",function(req,res){
    mark.findOne({stud_id:req.body.stud_id},function(err,fMark){
        res.locals.stud_id=req.body.stud_id;
        if(fMark){
            res.render("staff/mark1",{mark:fMark});
        }
        else{
            res.render("staff/mark1",{mark:dMark});
        }  
    })
})

//mark update storing in database (post route)
app.post("/auth/:id/profile-mark-update",function(req,res){
    mark.findOne({stud_id:req.params.id},async function(err,fMark){
        var obj={
            "stud_id":req.params.id,
            "tamil":{"score":req.body.tamil},
            "english":{"score":req.body.english},
            "maths":{"score":req.body.maths},
            "science":{"score":req.body.science},
            "social":{"score":req.body.social}
        }
        if(fMark){
            await mark.findByIdAndUpdate(fMark._id,obj,function(err1,uMark){
                res.redirect("/auth/profile-mark-update");
            })
        }
        else{
            await mark.create(obj,function(err1,cMark){
                res.redirect("/auth/profile-mark-update");
            })
        }
    })
})


//middleware for calculating mark and aatendance percentage(used in report route)
function reportcalc(req,res,next){
    attendance.findOne({stud_id:req.user.googleId},function(err,fAttendance){
        if(fAttendance){
            res.locals.pAttendance=(fAttendance.present.length/(fAttendance.present.length + fAttendance.absent.length))* 100;
            mark.findOne({stud_id:req.user.googleId},function(err1,fMark){
                if(fMark && fMark.tamil.score && fMark.english.score && fMark.maths.score && fMark.science.score && fMark.social.score){
                    var pMark=((fMark.tamil.score + fMark.english.score + fMark.maths.score + fMark.science.score + fMark.social.score)/5)*2;
                    res.locals.pMark=pMark;
                    if(pMark >= 90){
                        res.locals.grade = "O";
                    }
                    else if(pMark >= 80){
                        res.locals.grade = "A";
                    }
                    else if(pMark >= 70){
                        res.locals.grade = "B";
                    }
                    else if(pMark >= 60){
                        res.locals.grade = "C";
                    }
                    else{
                        res.locals.grade = "D";
                    }
                    next();
                }
                else{
                    res.locals.pMark = null;
                    next();
                }
            })
        }
        else{
            res.locals.pAttendance=null;
            next();
        }
    })
}

app.listen(1000);