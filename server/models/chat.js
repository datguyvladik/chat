var mongoose = require('./../lib/mongoose'),
  Schema = mongoose.Schema;

var schema = new Schema({

    name:{
        type:String,
        required: true
    },
    members:{
        type: [String]
    }
    
});

exports.Chat = mongoose.model('Chat', schema);





