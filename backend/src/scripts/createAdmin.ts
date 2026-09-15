import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const createAdminAccount = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/workmitra';
        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);

        const adminPhone = process.env.ADMIN_PHONE || '9999999999';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
        const adminFullName = process.env.ADMIN_NAME || 'System Admin';

        let adminUser = await User.findOne({ phone: adminPhone });

        if (adminUser) {
            console.log(`User with phone ${adminPhone} already exists. Updating role to admin...`);
            adminUser.role = 'admin';
            adminUser.status = 'active';
            adminUser.passwordHash = adminPassword; // Will be hashed in pre-save hook
            await adminUser.save();
            console.log('Admin user updated successfully.');
        } else {
            console.log(`Creating new Admin user with phone ${adminPhone}...`);
            adminUser = await User.create({
                fullName: adminFullName,
                phone: adminPhone,
                passwordHash: adminPassword,
                role: 'admin',
                status: 'active',
                preferredLanguage: 'en',
            });
            console.log('Admin user created successfully.');
        }

        console.log('--- ADMIN CREDENTIALS ---');
        console.log(`Phone:    ${adminPhone}`);
        console.log(`Password: ${adminPassword}`);
        console.log(`Role:     ${adminUser.role}`);
        console.log('-------------------------');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin account:', error);
        process.exit(1);
    }
};

createAdminAccount();
