// step 2 >> building model drivers

var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require("bcryptjs"); // this is step four

var UserSchema = new Schema ({
    name : {
        type : String,
        required : true,
    },
    email : {
        type : String,
        required : true,
    },
    password : {
        type : String,
        required : true,
    },
    favoriteB:[
        {
            blogger: {
                type: Schema.Types.ObjectId,
                ref : "Users",
            },
        },
    ], // this is step 33 for follow and unfollow features
}) ;

UserSchema.pre("save", function (next){
    this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(8), null);
    next();

});

UserSchema.statics.compare = function (cleartext,encrypted){
    return bcrypt.compareSync(cleartext,encrypted);
};


module.exports = mongoose.model("Users",UserSchema); // >>  Users is just naming the model <<