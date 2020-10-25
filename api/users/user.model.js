const mongoose = require('mongoose')
const { Schema, Types: {ObjectId} } = require('mongoose')

const userSchema = new Schema({
        email: {type: String, unique: true, required: true},
        password: {type: String, required: true},
        subscription: {
          type: String,
          enum: ["free", "pro", "premium"],
          default: "free"
        },
        token: String
});

module.exports = mongoose.model('People', userSchema);