var exp  = require("express"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    cookieSession = require("cookie-session"),
    bp = require("body-parser"),
    passportSetup = require("./config/passport-setup"),
    app  = exp();
mongoose.connect("mongodb://localhost/sstudent_app",{useNewUrlParser : true , useUnifiedTopology: true },function(){
    console.log("connected");
});

app.use(exp.static("public"));
app.use(bp.urlencoded({extended: true}));
app.set("view engine","ejs");
app.use(cookieSession({
    keys:["iamabaaaadcop"]
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req,res,next){
    res.locals.currentUser=req.user;
    next();
})

app.get("/", (req,res)=>{
    res.render("land");
})
app.get("/auth/login",function(req,res){
    res.render("login");
})
app.get("/auth/google",passport.authenticate("google",{
    scope : ['profile']
}))
app.get("/auth/logout",function(req,res){
    req.logout();
    res.redirect("/");
})
app.get("/auth/profile",passport.authenticate("google"),function(req,res){
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
app.get("/auth/profile-info",function(req,res){
    res.render("student/info");
})
app.get("/auth/profile-attendance",function(req,res){
    res.render("student/attendance");
})
app.get("/auth/profile-mark",function(req,res){
    res.render("student/mark");
})
app.get("/auth/profile-info-admin",function(req,res){
    res.render("admin/info");
})
app.listen(5000);