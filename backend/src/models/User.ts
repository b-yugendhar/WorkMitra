import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    phone: string;
    email?: string;
    passwordHash: string;
    role: 'worker' | 'employer' | 'admin' | 'verifier';
    status: 'active' | 'suspended';
    preferredLanguage: 'en' | 'te';
    matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema: Schema = new Schema(
    {
        phone: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: false,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['worker', 'employer', 'admin', 'verifier'],
            default: 'worker',
        },
        status: {
            type: String,
            enum: ['active', 'suspended'],
            default: 'active',
        },
        preferredLanguage: {
            type: String,
            enum: ['en', 'te'],
            default: 'en',
        },
    },
    { timestamps: true }
);

// Method to verify passwords
userSchema.methods.matchPassword = async function (enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Pre-save hook to hash password before saving to DB
userSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('passwordHash')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;
