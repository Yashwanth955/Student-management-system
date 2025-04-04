const express = require('express');
const router = express.Router();
const Fee = require('../model/fee');
const Student = require('../model/student');
const authMiddleware = require('../middleware/authmiddle');

// Create new fee record
router.post('/create', authMiddleware, async (req, res) => {
    try {
        const {
            studentId,
            feeType,
            amount,
            currency,
            dueDate,
            academicYear,
            semester,
            notes
        } = req.body;

        // Check if student exists
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const fee = new Fee({
            student: studentId,
            feeType,
            amount,
            currency,
            dueDate,
            academicYear,
            semester,
            notes
        });

        await fee.save();

        res.status(201).json({
            message: 'Fee record created successfully',
            fee
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating fee record', error: error.message });
    }
});

// Get all fees for a student
router.get('/student/:studentId', authMiddleware, async (req, res) => {
    try {
        const fees = await Fee.find({ student: req.params.studentId })
            .sort({ dueDate: 1 });
        res.json(fees);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching fee records', error: error.message });
    }
});

// Get fee details
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const fee = await Fee.findById(req.params.id)
            .populate('student', 'personalInfo.fullName personalInfo.studentId');
        if (!fee) {
            return res.status(404).json({ message: 'Fee record not found' });
        }
        res.json(fee);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching fee details', error: error.message });
    }
});

// Add payment
router.post('/:id/payment', authMiddleware, async (req, res) => {
    try {
        const fee = await Fee.findById(req.params.id);
        if (!fee) {
            return res.status(404).json({ message: 'Fee record not found' });
        }

        const {
            amount,
            paymentMethod,
            transactionId
        } = req.body;

        const receiptNumber = await fee.addPayment({
            amount,
            paymentMethod,
            transactionId
        });

        res.json({
            message: 'Payment recorded successfully',
            receiptNumber,
            updatedFee: fee
        });
    } catch (error) {
        res.status(500).json({ message: 'Error recording payment', error: error.message });
    }
});

// Get payment history
router.get('/:id/payments', authMiddleware, async (req, res) => {
    try {
        const fee = await Fee.findById(req.params.id);
        if (!fee) {
            return res.status(404).json({ message: 'Fee record not found' });
        }

        const paymentHistory = fee.getPaymentHistory();
        res.json(paymentHistory);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payment history', error: error.message });
    }
});

// Get fee statistics
router.get('/stats/overview', authMiddleware, async (req, res) => {
    try {
        const stats = await Fee.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                    totalPaid: { $sum: '$totalPaid' },
                    totalBalance: { $sum: '$balance' }
                }
            }
        ]);

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching fee statistics', error: error.message });
    }
});

// Update fee record
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const allowedUpdates = ['dueDate', 'notes'];
        const updates = Object.keys(req.body)
            .filter(key => allowedUpdates.includes(key))
            .reduce((obj, key) => {
                obj[key] = req.body[key];
                return obj;
            }, {});

        const fee = await Fee.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true }
        );

        if (!fee) {
            return res.status(404).json({ message: 'Fee record not found' });
        }

        res.json({
            message: 'Fee record updated successfully',
            fee
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating fee record', error: error.message });
    }
});

// Get overdue fees
router.get('/status/overdue', authMiddleware, async (req, res) => {
    try {
        const overdueFees = await Fee.find({
            status: 'Overdue'
        }).populate('student', 'personalInfo.fullName personalInfo.studentId');

        res.json(overdueFees);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching overdue fees', error: error.message });
    }
});

module.exports = router; 