var passport = require("passport"),
    googleStrategy = require("passport-google-oauth20"),
    User = require("../models/usermodel"),
    staff = require("../models/staffmodel"),
    admin = require("../models/adminmodel"),
    key = require("./keys");

passport.serializeUser(function(user,done){
    done(null,user._id);
});

passport.deserializeUser(function(id,done){
    User.findById(id,function(err,fUser){
        if(fUser){
            done(null, fUser);
        }
        else {
            staff.findById(id,function(err,fStaff){
                if(fStaff){
                    done(null, fStaff);
                } 
                else {
                    admin.findById(id,function(err,fAdmin){
                        if(fAdmin){
                            done(null, fAdmin);
                        }
                    })
                }
            })  
        }
        
    })
})

//Normal sign in from land page    
passport.use("google-student",new googleStrategy({
    callbackURL : "/auth/profile",
    clientID : key.google.clientID,
    clientSecret : key.google.clientSecret
},function(accessToken, refreshToken, profile, done){
    console.log(profile);
    User.findOne({googleId:profile.id},function(err,currentUser){
        if(currentUser){
            console.log(currentUser);
            done(null, currentUser);
        }
        else {
            staff.findOne({googleId:profile.id},function(err1,currentUser1){
                if(currentUser1){
                    done(null, currentUser1);
                }
                else{
                    admin.findOne({googleId:profile.id},function(err2,currentUser2){
                        if(currentUser2){
                            console.log("current user2 : " + currentUser2);
                            done(null, currentUser2);
                        }
                        else{
                            User.create({
                                username : profile.displayName,
                                googleId : profile.id,
                                image : profile.photos[0].value
                            },function(err,cUser){
                                console.log("Created new user");
                                console.log(cUser);
                                done(null, cUser);
                            })
                        }
                    })
                }
            })
        }
    })
}))

//Registering staff from admin account
passport.use("google-staff",new googleStrategy({
    callbackURL : "/auth/profile-staff",
    clientID : key.google.clientID,
    clientSecret : key.google.clientSecret
},function(accessToken, refreshToken, profile, done){
    console.log(profile);
    User.findOne({googleId:profile.id},function(err,currentUser){
        if(currentUser){
            User.deleteOne({googleId:profile.id},function(derr){
                staff.create({
                    username : profile.displayName,
                    googleId : profile.id,
                    image : profile.photos[0].value
                },function(err,cStaff){
                    console.log("Created new user");
                    console.log(cStaff);
                    done(null, cStaff);
                }) 
            })
        }
        else {
            staff.findOne({googleId:profile.id},function(err1,currentUser1){
                if(currentUser1){
                    done(null, currentUser1);
                }
                else{
                    admin.findOne({googleId:profile.id},function(err2,currentUser2){
                        if(currentUser2){
                            console.log("current user2 : " + currentUser2);
                            done(null, currentUser2);
                        }
                        else{
                            staff.create({
                                username : profile.displayName,
                                googleId : profile.id,
                                image : profile.photos[0].value
                            },function(err,cStaff){
                                console.log("Created new user");
                                console.log(cStaff);
                                done(null, cStaff);
                            })
                        }
                    })
                }
            })
        }
    })
}))
