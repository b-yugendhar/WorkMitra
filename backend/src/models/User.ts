import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    fullName?: string;
    phone: string;
    email?: string;
    passwordHash: string;
    role: 'worker' | 'employer' | 'admin' | 'verifier';
    status: 'active' | 'suspended';
    preferredLanguage: 'en' | 'te' | 'hi' | 'ta' | 'kn' | 'ml' | 'mr' | 'bn' | 'ur';
    profileImage?: string;
    createdAt?: Date;
    updatedAt?: Date;
    matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
    {
        fullName: {
            type: String,
            required: false,
            trim: true,
        },

        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        email: {
            type: String,
            required: false,
            trim: true,
            lowercase: true,
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
            enum: ['en', 'te', 'hi', 'ta', 'kn', 'ml', 'mr', 'bn', 'ur'],
            default: 'en',
        },

        profileImage: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

userSchema.methods.matchPassword = async function (
    enteredPassword: string
): Promise<boolean> {
    return bcrypt.compare(enteredPassword, this.passwordHash);
};

userSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('passwordHash')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);

    next();
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;