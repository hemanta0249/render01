const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        requred: true
    },
    email: {
        type: String,
        requred: true,
        unique: true
    },
    password: {
        type: String,
        requred: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const users = mongoose.model('Users', userSchema);

module.exports = users;