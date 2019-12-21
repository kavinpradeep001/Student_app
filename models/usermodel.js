var mang    = require("mongoose");
var UserSch = new mang.Schema({
    username :String,
    googleId :String,
    image:String,
    profession: {
        type : String,
        default : "student"
    }
});
var User = mang.model("User",UserSch);
module.exports = User;
