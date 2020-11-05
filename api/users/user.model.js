const mongoose = require('mongoose')
const { Schema, Types: {ObjectId} } = require('mongoose')

const userSchema = new Schema({
        email: {type: String, unique: true, required: true},
        password: {type: String, required: true},
        status: {type: String, required: true, enum: ['created', 'verified'], default: 'created'},
        verificationToken: {type: String, default: '', required: false},
        subscription: {
          type: String,
          enum: ["free", "pro", "premium"],
          default: "free"
        },
        token: String
});

module.exports = mongoose.model('People', userSchema);