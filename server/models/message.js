var mongoose = require('./../lib/mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({

    message: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    chatID: {
        type: String,
        default: null
    },
    from: {
        type: String,
        required: true
    }

});

exports.Message = mongoose.model('Message', schema);