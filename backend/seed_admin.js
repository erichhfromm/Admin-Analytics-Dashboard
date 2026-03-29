const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');

dotenv.config();

// Koneksi ke Database
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/admin_dashboard')
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => {
      console.error('Error connecting to MongoDB:', err.message);
      process.exit(1);
  });

const seedAdmin = async () => {
    try {
        const adminEmail = 'admin@example.com';
        const defaultPassword = 'password123';

        // Cek apakah admin sudah ada
        let admin = await Admin.findOne({ email: adminEmail });
        if (admin) {
            console.log(`Admin dengan email ${adminEmail} sudah ada di database.`);
            console.log('Proses seeding dibatalkan. Sistem sudah memiliki Admin.');
            process.exit(0);
        }

        // Jika belum ada, buat baru
        admin = new Admin({
            name: 'Super Admin',
            email: adminEmail,
            password: defaultPassword,
            role: 'Super Admin'
        });

        // Enkripsi password
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(defaultPassword, salt);
        
        await admin.save();

        console.log('✅ Berhasil membangun Super Admin Default!');
        console.log('--- Kredensial Login ---');
        console.log(`Email    : ${adminEmail}`);
        console.log(`Password : ${defaultPassword}`);
        console.log('------------------------');
        console.log('Silakan login di dashboard dan segera ganti password ini melalui menu Settings.');
        
        process.exit(0);
    } catch (err) {
        console.error('Terjadi kesalahan saat seeding:', err.message);
        process.exit(1);
    }
};

seedAdmin();
