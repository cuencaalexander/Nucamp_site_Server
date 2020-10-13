//Defining the Mongoose schema and the model for all documents in our db's campsite collection
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

require('mongoose-currency').loadType(mongoose);//available currency for mongoose shcemas to use
const Currency = mongoose.Types.Currency;

const commentSchema = new Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

//schema instance, obj w props that pre-define fields of a doc
const campsiteSchema = new Schema({//1st arg is the obj definition, 2nd the optional configurations
    name: {
        type: String,
        required: true,
        unique: true //no 2 docs in this collection should have the same name field
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    elevation: {
        type: Currency,
        required: true,
        min: 0
    },
    cost: {
        type: Currency,
        required: true,
        min: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    comments: [commentSchema]//every campsite doc will be able to contain multiple comment docs storedwithin an arary
}, {//add 2 props, created at and updated at.
    timestamps: true
});

//creating a MODEL using the schema created above, (collection, schema we wanna use)
const Campsite = mongoose.model('Campsites', campsiteSchema)//returns a constructor function,
//we can think of it as a CLASS although it's not
//THis model will be used to instantiate new docs for mongodb

module.exports = Campsite;