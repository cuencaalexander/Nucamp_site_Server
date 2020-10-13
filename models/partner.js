const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const partnerSchema = new Schema({
    name: {
        type: String,
        required: false,
        unique: true,
        min: 1
    },
    image: {
        type: String,
        required: true,
    },
    featured: {
        type: Boolean
    },
    description: {
        type: String,
        required: true
    }
},{
    timestamps: true
});

const Partner = mongoose.model('Partners', partnerSchema);

module.exports = Partner;