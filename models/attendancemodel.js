var mang    = require("mongoose");
var adminSch = new mang.Schema({
    present : {
        type : Number,
        default : 0
    },
    absent : {
        type : Number,
        default : 0
    },
    stud_id : {
        type : mang.Schema.Types.ObjectId,
        ref : "User"
    }
});
var admin = mang.model("admin",adminSch);
module.exports = admin;
