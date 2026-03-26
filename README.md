# Admin Analytics Dashboard 🚀

A modern, responsive, and beautifully designed admin dashboard built with React, Vite, and Tailwind CSS. This project serves as a comprehensive template for startup dashboards and application admin panels.

![Dashboard Preview](https://via.placeholder.com/1200x800?text=Dashboard+Preview)

## ✨ Features

- **Modern UI/UX**: Clean aesthetic with ample whitespace, using best practices in data visualization.
- **Dark Mode Support**: Seamless toggle between light and dark modes with a smooth transition.
- **Responsive Layout**: Fully functional and aesthetically pleasing on both desktop and mobile devices.
- **Simulated Authentication**: A sleek login flow with error handling and protected routes.
- **Interactive Charts**: Revenue and user acquisition data visualized using `recharts`.
- **Dynamic Data Table**: User management table with real-time search and status filtering.
- **Mock API Service**: Simulated backend using promises with artificial delays to mimic real network requests.

## 🛠️ Tech Stack

- **Framework**: React 18, Vite
- **Styling**: Tailwind CSS v4, Contextual Dark Mode
- **Icons**: Lucide React
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Routing**: React Router DOM
- **Utility**: clsx, tailwind-merge

## 📂 Project Structure

```
src/
 ├── components/       # Reusable UI components (Sidebar, Navbar, Card, Layout)
 ├── pages/            # Application routes (Dashboard, Users, Login)
 ├── services/         # Simulated API service (api.js)
 ├── index.css         # Global styles and Tailwind imports
 ├── App.jsx           # Main application routing
 └── main.jsx          # React entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16.0 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/admin-analytics-dashboard.git
   ```

2. Navigate to the project directory:
   ```bash
   cd "Admin Analytics Dashboard"
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🔐 Demo Credentials

To access the dashboard, use the following simulated credentials on the login screen:
- **Email**: `admin@demo.com`
- **Password**: `admin`

## 💡 Customization

- **Colors**: Application branding colors can be easily modified in `src/index.css` under the `:root` and `.dark` variables.
- **Sidebar Options**: Modify `navItems` within `src/components/Sidebar.jsx` to add or remove pages.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
