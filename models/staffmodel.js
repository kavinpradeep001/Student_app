var mang    = require("mongoose");
var staffSch = new mang.Schema({
    username :String,
    googleId :String,
    image:String,
    profession : {
        type : String,
        default : "staff"
    }
});
var staff = mang.model("staff",staffSch);
module.exports = staff;
