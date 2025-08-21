import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minLength: 6,
        maxLength: 20
    },
    password: {
        type: String,
        required: true,
        minLength: 8,
        maxLength: 20
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,

    }
})

// Middleware to hash password before saving
userSchema.pre('save', async function (next) {
    // Check if the password is modified
    if (this.isModified('pasword')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();

})

const User = mongoose.model('User', userSchema);
export default User; 