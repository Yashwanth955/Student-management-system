const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    feeType: {
        type: String,
        required: true,
        enum: ['Tuition', 'Registration', 'Laboratory', 'Library', 'Transportation', 'Hostel', 'Other']
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true,
        default: 'INR'
    },
    dueDate: {
        type: Date,
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
    semester: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Paid', 'Overdue', 'Partially Paid'],
        default: 'Pending'
    },
    payments: [{
        amount: {
            type: Number,
            required: true
        },
        paymentDate: {
            type: Date,
            default: Date.now
        },
        paymentMethod: {
            type: String,
            required: true,
            enum: ['Cash', 'Card', 'Bank Transfer', 'UPI', 'Check']
        },
        transactionId: {
            type: String
        },
        receiptNumber: {
            type: String
        }
    }],
    totalPaid: {
        type: Number,
        default: 0
    },
    balance: {
        type: Number,
        default: function() {
            return this.amount;
        }
    },
    notes: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save middleware to update balance and status
feeSchema.pre('save', function(next) {
    // Calculate total paid amount
    this.totalPaid = this.payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Calculate balance
    this.balance = this.amount - this.totalPaid;
    
    // Update status based on payments
    if (this.balance === 0) {
        this.status = 'Paid';
    } else if (this.balance === this.amount) {
        this.status = 'Pending';
    } else if (this.balance > 0) {
        this.status = 'Partially Paid';
    }
    
    // Check if overdue
    if (this.balance > 0 && new Date() > this.dueDate) {
        this.status = 'Overdue';
    }
    
    this.updatedAt = new Date();
    next();
});

// Generate receipt number
feeSchema.methods.generateReceiptNumber = function() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `RCP${year}${month}${random}`;
};

// Add payment method
feeSchema.methods.addPayment = async function(paymentData) {
    const receiptNumber = this.generateReceiptNumber();
    this.payments.push({
        ...paymentData,
        receiptNumber
    });
    await this.save();
    return receiptNumber;
};

// Get payment history
feeSchema.methods.getPaymentHistory = function() {
    return this.payments.sort((a, b) => b.paymentDate - a.paymentDate);
};

// Get outstanding balance
feeSchema.methods.getOutstandingBalance = function() {
    return this.balance;
};

const Fee = mongoose.model('Fee', feeSchema);

module.exports = Fee; 