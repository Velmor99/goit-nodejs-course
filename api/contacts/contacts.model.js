const mongoose = require('mongoose');
const {Schema} = mongoose;

const contactSchema = new Schema({
    name: { type: String, required: true },
    email: {type: String, required: true},
    phone: {type: String, required: true},
    subscription: {type: String, required: true},
    password: {type: String, required: true},
    token: {type: String, required: false}
});

contactSchema.statics.findContactByIdAndUpdate = findContactByIdAndUpdate;

function findContactByIdAndUpdate(contactId, updateParams) {
    return this.findContactByIdAndUpdate(contactId, {
        $set: updateParams
    }, {
        new: true
    })
}

const contactsModel = mongoose.model('Contact', contactSchema);

module.exports = contactsModel