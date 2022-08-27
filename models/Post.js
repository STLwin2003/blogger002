var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var PostSchema = new Schema({
    title: {
        type : String,
        required : true,
    },
    content: {
        type : String,
        required : true,
    },
    image: {
        type : String,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "Users",
    },
    // this is step 29 // 
    like : [
        {
            user : {
                type : Schema.Types.ObjectId,
                ref : "Users",
            },
        },
    ], 

    created:{
        type: Date,
        default: Date.now(),
    },posted:{
        type: Date,
        default: Date.now(),
    },
});
module.exports = mongoose.model("Posts",PostSchema);
