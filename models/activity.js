const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
        organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['sports', 'art', 'culture', 'culinary', 'science'],
        required: true
    },
    location: {
        type: String,
        required: true
    },
    targetAudience:{
        type: String,
        enum: ['adults', 'children', 'both'],
        required: true
    },
    participantsMin:{
        type: Number,
        required: true
    },
    participantsMax:{
        type: Number,
        required: true
    },
    activityDuration:{
        type: Number,
        required: true,
    },
    activityDurationUnit:{
        type: String,
         enum: ['minutes','hours', 'days'],
        required: true,
    },
    activityPricing:{
        type: Number,
        required: true,
    },
    activityPricingBase:{
        type: String,
        enum: ['perPerson', 'perReservation'],
        required: true,
    },
    coverImage:{
        type:String,
        required: true
    },
      additionalImages: {
    type: [String],
    validate: [arrayLimit, '{PATH} exceeds the limit of 5'],
    default: [],
  },
    videoLink:{
        type:String,
        required: false
    },
    description:{
        type:String,
        required: true
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    availableDates: [{
        type: Date,
        required: false
    }],
    status: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        required: false
    },
},
    { timestamps: true }
);
function arrayLimit(val) {
  return val.length <= 5;
}
module.exports = mongoose.model('Activity', activitySchema);