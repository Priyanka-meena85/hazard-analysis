const mongoose = require('mongoose');

const hazardSchema = new mongoose.Schema({
    hazardTitle: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    severity: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        required: true
    },
    probability: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        required: true
    },
    riskLevel: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        required: true
    },
    description: {
        type: String
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed', 'Assigned'],
        default: 'Pending'
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedTo: {
        type: String
    },
    dueDate: {
        type: Date
    },
    correctiveAction: {
        type: String
    }
}, {
    timestamps: true
});

const Hazard = mongoose.model('Hazard', hazardSchema);
module.exports = Hazard;
