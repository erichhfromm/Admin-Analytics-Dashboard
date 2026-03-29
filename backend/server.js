const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const nodemailer = require('nodemailer');
const connectDB = require('./config/db');
const User = require('./models/User');
const Setting = require('./models/Setting');
const Message = require('./models/Message');
const Admin = require('./models/Admin');
const Activity = require('./models/Activity');
const Transaction = require('./models/Transaction');
const { auth, checkRole } = require('./middleware/auth');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static('uploads'));

// Logging Middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

const logActivity = async (adminId, action, target = '') => {
    try {
        const admin = await Admin.findById(adminId);
        const activity = new Activity({
            adminId: adminId,
            adminName: admin ? admin.name : 'Unknown Admin',
            action,
            target
        });
        await activity.save();
    } catch (err) {
        console.error('Logging Error:', err.message);
    }
};

app.get('/api/activities', auth, async (req, res) => {
    try {
        const activities = await Activity.find().sort({ createdAt: -1 }).limit(10);
        res.json(activities);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Connect Database
connectDB();

// Analytics Route
app.get('/api/analytics', auth, async (req, res) => {
    try {
        const year = new Date().getFullYear();
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31, 23, 59, 59);

        const users = await User.find({ createdAt: { $gte: startOfYear, $lte: endOfYear } });
        const txs = await Transaction.find({ createdAt: { $gte: startOfYear, $lte: endOfYear }, status: 'Completed' });

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const data = months.map((month, index) => {
            const tTotal = users.filter(u => new Date(u.createdAt).getMonth() === index).length;
            const tRevenue = txs.filter(t => new Date(t.createdAt).getMonth() === index)
                                 .reduce((acc, curr) => acc + (curr.amount || 0), 0);
            return {
                name: month,
                total: tTotal,
                revenue: tRevenue
            };
        });

        res.json(data);
    } catch (err) {
        console.error('Analytics error:', err);
        res.status(500).json({ error: 'Server Error' });
    }
});
// Upload Route
app.post('/api/upload', auth, upload.single('avatar'), (req, res) => {
    if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

// AUTH ROUTES
/* 
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        let admin = await Admin.findOne({ email });
        if (admin) return res.status(400).json({ msg: 'Admin already exists' });

        admin = new Admin({ name, email, password });
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(password, salt);
        await admin.save();

        const payload = { user: { id: admin.id } };
        jwt.sign(payload, process.env.JWT_SECRET || 'your_super_secret_key_123', { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { name: admin.name, email: admin.email } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
*/

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        let admin = await Admin.findOne({ email });
        if (!admin) return res.status(400).json({ msg: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        const payload = { 
            user: { 
                id: admin.id,
                role: admin.role
            } 
        };
        jwt.sign(payload, process.env.JWT_SECRET || 'your_super_secret_key_123', { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { name: admin.name, email: admin.email, role: admin.role } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(404).json({ msg: 'Admin with this email not found' });

        // Create one-time token based on current password
        const secret = (process.env.JWT_SECRET || 'your_super_secret_key_123') + admin.password;
        const payload = { email: admin.email, id: admin.id };
        const token = jwt.sign(payload, secret, { expiresIn: '15m' });

        const resetUrl = `http://localhost:5173/reset-password/${admin.id}/${token}`;

        // Create test ethereal account via nodemailer for dev
        let testAccount = await nodemailer.createTestAccount();
        let transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, 
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });

        let info = await transporter.sendMail({
            from: '"Admin Analytics" <no-reply@adminanalytics.com>',
            to: admin.email,
            subject: "Password Reset Request",
            text: `You requested a password reset. Please click this link to reset your password: ${resetUrl}`,
            html: `<p>You requested a password reset.</p><p>Please click <a href="${resetUrl}">here</a> to reset your password.</p><p>It will expire in 15 minutes.</p>`,
        });

        console.log("Mail sent! Ethereal Preview URL: %s", nodemailer.getTestMessageUrl(info));
        
        await logActivity(admin.id, 'Requested password reset');

        res.json({ msg: 'Password reset link sent to email! (Check backend console for Dev Preview)', previewUrl: nodemailer.getTestMessageUrl(info) });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.post('/api/auth/reset-password/:id/:token', async (req, res) => {
    const { id, token } = req.params;
    const { password } = req.body;

    try {
        const admin = await Admin.findById(id);
        if (!admin) return res.status(404).json({ msg: 'Invalid reset link' });

        const secret = (process.env.JWT_SECRET || 'your_super_secret_key_123') + admin.password;
        try {
            jwt.verify(token, secret);
        } catch (error) {
            return res.status(400).json({ msg: 'Reset link is invalid or has expired' });
        }

        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(password, salt);
        await admin.save();

        await logActivity(admin.id, 'Reset password via email link');

        res.json({ msg: 'Password has been reset successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET CURRENT USER DATA
app.get('/api/auth/me', auth, async (req, res) => {
    try {
        const admin = await Admin.findById(req.user.id).select('-password');
        res.json(admin);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// OTHER ROUTES (Protected where it should be)
app.get('/api/stats', auth, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ status: 'Active' });
        const pendingUsers = await User.countDocuments({ status: 'Pending' });
        
        const txs = await Transaction.find({ status: 'Completed' });
        const revenueValue = txs.reduce((sum, t) => sum + (t.amount || 0), 0);
        
        const formattedRevenue = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(revenueValue);

        res.json({
            totalUsers,
            activeUsers,
            pendingUsers,
            revenue: formattedRevenue,
            revenueGrowth: '+12.5%',
            activeSessions: Math.floor(activeUsers * 0.4) + 5
        });
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ error: 'Server Error' });
    }
});

app.post('/api/transactions/seed', async (req, res) => {
    try {
        const count = await Transaction.countDocuments();
        if (count > 0) return res.json({ msg: 'Transactions already seeded' });

        const seedData = [
            { customerName: 'John Doe', amount: 1500, status: 'Completed', createdAt: new Date(new Date().setMonth(new Date().getMonth() - 1)) },
            { customerName: 'Jane Smith', amount: 3200, status: 'Completed', createdAt: new Date() },
            { customerName: 'Bob Builder', amount: 450, status: 'Completed', createdAt: new Date(new Date().setMonth(new Date().getMonth() - 2)) },
            { customerName: 'Alice Wonderland', amount: 890, status: 'Completed', createdAt: new Date() }
        ];
        await Transaction.insertMany(seedData);
        res.json({ msg: 'Transactions Seeded successfully' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});
app.get('/api/messages', auth, async (req, res) => {
    try {
        let query = {};
        if (req.query.userId) {
            query = {
                $or: [
                    { senderId: req.user.id, receiverId: req.query.userId },
                    { senderId: req.query.userId, receiverId: req.user.id }
                ]
            };
        }
        const messages = await Message.find(query).sort({ timestamp: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

app.post('/api/messages', auth, async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user.id;
        
        if (!receiverId) {
            return res.status(400).json({ error: 'receiverId is required' });
        }
        if (!content || typeof content !== 'string' || content.trim() === '') {
            return res.status(400).json({ error: 'Message content is required' });
        }

        const newMessage = new Message({ senderId, receiverId, content });
        const savedMessage = await newMessage.save();
        
        let receiverName = receiverId;
        const tUser = await User.findById(receiverId);
        if (tUser) receiverName = tUser.name;
        
        await logActivity(req.user.id, 'Sent a new message', `To: ${receiverName}`);
        res.status(201).json(savedMessage);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/api/settings', auth, async (req, res) => {
    try {
        const admin = await Admin.findById(req.user.id).select('-password');
        if (!admin) return res.status(404).json({ error: 'Admin record not found' });

        let setting = await Setting.findOne({ userId: req.user.id });
        
        if (!setting) {
            setting = new Setting({ userId: req.user.id });
            await setting.save();
        }

        // Merge admin data with user settings
        res.json({
            ...setting._doc,
            name: admin.name,
            email: admin.email,
            avatarUrl: admin.avatarUrl,
            role: admin.role
        });
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

app.put('/api/settings', auth, async (req, res) => {
    try {
        const { name, email, avatarUrl, notifications, theme } = req.body;
        
        // 1. Update Admin Account
        const adminUpdate = {};
        if (name) adminUpdate.name = name;
        if (email) adminUpdate.email = email;
        if (avatarUrl) adminUpdate.avatarUrl = avatarUrl;
        
        if (Object.keys(adminUpdate).length > 0) {
            await Admin.findByIdAndUpdate(req.user.id, adminUpdate);
        }

        // 2. Update Settings (preferences)
        const setting = await Setting.findOneAndUpdate(
            { userId: req.user.id },
            { notifications, theme },
            { new: true, upsert: true }
        );

        await logActivity(req.user.id, 'Updated profile settings');
        res.json({ ...setting._doc, name, email, avatarUrl });
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

app.put('/api/settings/password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ msg: 'Please provide both current and new passwords' });
        }

        const admin = await Admin.findById(req.user.id);
        if (!admin) return res.status(404).json({ msg: 'Admin not found' });

        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) return res.status(400).json({ msg: 'Incorrect current password' });

        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(newPassword, salt);
        await admin.save();

        await logActivity(req.user.id, 'Changed password');
        
        res.json({ msg: 'Password updated successfully' });
    } catch (err) {
        console.error('Password update error:', err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

app.get('/api/users', auth, async (req, res) => {
    try {
        const { search, status, sortBy, order } = req.query;
        let query = {};
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (status && status !== 'All') {
            query.status = status;
        }

        const sortObj = {};
        if (sortBy) {
            sortObj[sortBy] = order === 'asc' ? 1 : -1;
        } else {
            sortObj.createdAt = -1;
        }

        // Pagination calculations
        const pageNum = parseInt(req.query.page) || 1;
        const limitNum = parseInt(req.query.limit) || 10;
        const skip = (pageNum - 1) * limitNum;

        const totalUsers = await User.countDocuments(query);
        const users = await User.find(query).sort(sortObj).skip(skip).limit(limitNum);

        res.json({
            users,
            currentPage: pageNum,
            totalPages: Math.ceil(totalUsers / limitNum),
            totalUsers
        });
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

app.post('/api/users', auth, checkRole(['Super Admin', 'Admin']), async (req, res) => {
    try {
        const { name, email, role, status } = req.body;
        
        if (!name || typeof name !== 'string' || name.trim() === '') return res.status(400).json({ error: 'Valid name is required' });
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Valid email is required' });
        
        if (role && !['Admin', 'Editor', 'User'].includes(role)) return res.status(400).json({ error: 'Invalid role provided' });
        if (status && !['Active', 'Inactive', 'Pending'].includes(status)) return res.status(400).json({ error: 'Invalid status provided' });

        const newUser = new User({ name, email, role, status });
        const savedUser = await newUser.save();
        await logActivity(req.user.id, 'Created a new user', savedUser.name);
        res.status(201).json(savedUser);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.put('/api/users/:id', auth, checkRole(['Super Admin', 'Admin']), async (req, res) => {
    try {
        const { name, email, role, status } = req.body;
        const updates = {};
        
        if (name !== undefined) {
             if (typeof name !== 'string' || name.trim() === '') return res.status(400).json({ error: 'Valid name is required' });
             updates.name = name;
        }
        if (email !== undefined) {
             if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Valid email is required' });
             updates.email = email;
        }
        if (role !== undefined) {
             if (!['Admin', 'Editor', 'User'].includes(role)) return res.status(400).json({ error: 'Invalid role provided' });
             updates.role = role;
        }
        if (status !== undefined) {
             if (!['Active', 'Inactive', 'Pending'].includes(status)) return res.status(400).json({ error: 'Invalid status provided' });
             updates.status = status;
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
        if(!updatedUser) return res.status(404).json({ error: 'User not found' });
        
        await logActivity(req.user.id, 'Updated user', updatedUser.name);
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ error: 'User not found or update failed' });
    }
});

app.delete('/api/users/:id', auth, checkRole(['Super Admin', 'Admin']), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await logActivity(req.user.id, 'Deleted user', user.name);
            await User.findByIdAndDelete(req.params.id);
        }
        res.json({ message: 'User removed' });
    } catch (err) {
        res.status(400).json({ error: 'User not found' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
