var mongoose = require('./../lib/mongoose'),
  Schema = mongoose.Schema;

var schema = new Schema({

    name:{
        type:String,
        required: true
    },
    data: Buffer    
});

exports.File = mongoose.model('File', schema);