const mongoose = require('mongoose');

const { Schema } = mongoose;

let todoSchema = new Schema({
    fullname: {
        type: String,
    },

    email: {
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    terms:{
        type: Boolean,
        required: true
    }
});

module.exports = mongoose.model('User', todoSchema);

