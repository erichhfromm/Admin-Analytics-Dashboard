# 🚀 Apex Analytics - Premium Administrative Dashboard

<p align="center">
  <img src="./dashboard_preview1.png" width="32%" />
  <img src="./dashboard_preview1.png" width="32%" />
  <img src="./dashboard_preview1.png" width="32%" />
</p>

*Comprehensive view of the Dashboard, User Management, and Analytics modules.*

## ✨ Overview
**Apex Analytics** is a high-performance, production-ready administrative dashboard designed for modern SaaS and business intelligence applications. Built with a focus on **security, elegance, and extreme performance**, it transforms raw data into a sophisticated, interactive experience.

Unlike generic templates, this dashboard features a custom-built **Slate & Indigo** design system with glassmorphism touches and optimized data-fetching architectures. It provides a robust foundation for businesses needing real-time user management, secure internal messaging, and deep-dive financial analytics.

---

## 🛠️ Main Features
- 🛡️ **Enterprise-Grade Security**: JWT authentication with Role-Based Access Control (RBAC), multi-layered request validation, and secure password hashing via Bcrypt.
- 📉 **Dynamic Financial Analytics**: Real-time revenue tracking and user acquisition metrics powered by server-side aggregations.
- 💬 **Private Internal Messenger**: Integrated messaging system between Admins and Users with a sleek, conversational UI and auto-syncing history.
- ⚡ **Optimized Pagination**: Server-side pagination capable of handling 10,000+ records without performance degradation.
- 🌓 **Adaptive Theming**: Fully responsive Dark/Light mode with auto-system detection and persistent preference storage.
- ⚙️ **Advanced Profile Management**: Secure profile updates, avatar uploads with resizing, and real-time settings synchronization.
- 📧 **Security Recovery**: Built-in Forgot/Reset password flow with SMTP email simulation.

---

## 💻 Tech Stack
| Tier | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, TailwindCSS, Framer Motion, Lucide Icons, Recharts |
| **Backend** | Node.js, Express.js, JWT, BcryptJS, Multer |
| **Database** | MongoDB (Mongoose ODM) |
| **Tools** | Git, Postman, Nodemailer |

---

## 🚀 Getting Started

### 1. Requirements
- Node.js (v18+)
- MongoDB (Local or Atlas)

### 2. Installation
Clone the repository and install dependencies:
```bash
# Frontend
npm install

# Backend
cd backend
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the `/backend` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
```

### 4. Database Seeding (Crucial)
Initialize the Super Admin account (required for first login):
```bash
cd backend
npm run seed:admin
```
**Default Credentials:**
- **Email:** `admin@example.com`
- **Password:** `password123`

### 5. Running the Application
```bash
# Start Backend
cd backend
npm run dev

# Start Frontend (Root)
npm run dev
```

---

## 📜 License
Independent Developer Project. Distributed under the **MIT License**.

Built with ❤️ by [Your Name/GitHub Username]
