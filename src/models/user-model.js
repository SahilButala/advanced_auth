
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true

    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        unique: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    twofactorEnabled: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ["admin", "user"],
    },
    twofactorSecret: {
        type: Boolean,
        default: undefined
    },
    tokenVersion: {
        type: Number,
        default: 0
    },
    resetPasswordToken: {
        type: String,
        default: undefined
    },
    resetPasswordExpires: {
        type: Date,
        default: undefined
    }

}, {
    timestamps: true
})


const User = mongoose.model.User || mongoose.model('User', userSchema);

module.exports = User;