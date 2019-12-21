var mang    = require("mongoose");
var markSch = new mang.Schema({
    tamil : {
        type : Number,
        default : 0
    },
    english : {
        type : Number,
        default : 0
    },
    maths : {
        type : Number,
        default : 0
    },
    science : {
        type : Number,
        default : 0
    },
    social : {
        type : Number,
        default : 0
    },
    stud_id : {
        type : mang.Schema.Types.ObjectId,
        ref : "User"
    }
});
var mark = mang.model("mark",markSch);
module.exports = mark;
