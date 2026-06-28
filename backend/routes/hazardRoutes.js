const express = require('express');
const router = express.Router();
const Hazard = require('../models/Hazard');
const { protect } = require('../middleware/authMiddleware');

const calculateRisk = (severity, probability) => {
    if (severity === 'High' || probability === 'High') return 'High';
    if (severity === 'Medium' || probability === 'Medium') return 'Medium';
    return 'Low';
};

// @route   POST /api/hazards
// @desc    Create a new hazard
router.post('/', protect, async (req, res) => {
    try {
        const { hazardTitle, location, severity, probability, description, status, assignedTo, dueDate, correctiveAction } = req.body;
        
        const riskLevel = calculateRisk(severity, probability);

        const hazard = await Hazard.create({
            hazardTitle,
            location,
            severity,
            probability,
            riskLevel,
            description,
            status: status || 'Pending',
            reportedBy: req.user._id,
            assignedTo,
            dueDate,
            correctiveAction
        });

        res.status(201).json(hazard);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   GET /api/hazards
// @desc    Get hazards
router.get('/', protect, async (req, res) => {
    try {
        let hazards;
        if (req.user.role === 'System Administrator' || req.user.role === 'Manager') {
            hazards = await Hazard.find().populate('reportedBy', 'fullName email');
        } else {
            hazards = await Hazard.find({ reportedBy: req.user._id }).populate('reportedBy', 'fullName email');
        }
        res.json(hazards);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/hazards/:id
// @desc    Update a hazard
router.put('/:id', protect, async (req, res) => {
    try {
        const hazard = await Hazard.findById(req.params.id);

        if (!hazard) {
            return res.status(404).json({ message: 'Hazard not found' });
        }

        // Optional: you can restrict operators from updating other people's hazards
        if (req.user.role === 'Operator' && hazard.reportedBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to update this hazard' });
        }

        const { severity, probability } = req.body;
        let riskLevel = hazard.riskLevel;
        
        if (severity || probability) {
            const newSeverity = severity || hazard.severity;
            const newProbability = probability || hazard.probability;
            riskLevel = calculateRisk(newSeverity, newProbability);
        }

        const updatedData = { ...req.body, riskLevel };
        
        const updatedHazard = await Hazard.findByIdAndUpdate(req.params.id, updatedData, {
            new: true,
            runValidators: true
        });

        res.json(updatedHazard);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   DELETE /api/hazards/:id
// @desc    Delete a hazard
router.delete('/:id', protect, async (req, res) => {
    try {
        if (req.user.role !== 'System Administrator' && req.user.role !== 'Manager') {
            return res.status(403).json({ message: 'Not authorized to delete hazards' });
        }

        const hazard = await Hazard.findById(req.params.id);

        if (!hazard) {
            return res.status(404).json({ message: 'Hazard not found' });
        }

        await hazard.deleteOne();
        res.json({ message: 'Hazard removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
