# 🏦 CreditSea Loan Manager

<div align="center">

![Loan Manager Banner](https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=200&fit=crop&crop=entropy&auto=format&q=80)

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_App-4285f4?style=for-the-badge)](https://loan-manager-frontend-bcvd.vercel.app/)
[![Frontend](https://img.shields.io/badge/Frontend-Next.js_15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Backend](https://img.shields.io/badge/Backend-Node.js_+_Express-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb)](https://mongodb.com/)
[![Auth](https://img.shields.io/badge/Auth-Clerk-7C3AED?style=for-the-badge)](https://clerk.com/)

**A modern, full-stack loan management system designed for financial institutions and lending platforms.**

**🔗 Repositories:** [Frontend](https://github.com/sam-arth07/LoanManagerFrontend) • [Backend](https://github.com/sam-arth07/LoanManagerBackend)

[🚀 Live Demo](https://loan-manager-frontend-bcvd.vercel.app/) • [📖 Documentation](#documentation) • [🔧 Installation](#installation) • [🤝 Contributing](#contributing)

</div>

---

## ✨ Features

### 👤 **User Experience**

-   🔐 **Secure Authentication** - Powered by Clerk with JWT tokens
-   📱 **Responsive Design** - Seamless experience across all devices
-   🎨 **Modern UI/UX** - Built with Tailwind CSS and Radix UI components
-   ⚡ **Real-time Updates** - Instant loan status notifications
-   🔄 **Offline Support** - Continue working even without internet

### 💼 **Loan Management**

-   📝 **Easy Application Process** - Streamlined loan application workflow
-   📊 **Application Tracking** - Track loans from application to approval
-   💰 **Multiple Loan Types** - Support for various loan purposes
-   📈 **Status Management** - Pending → Approved → Verified → Repaid workflow
-   🔍 **Advanced Filtering** - Search and filter loans by multiple criteria

### 👨‍💼 **Admin Dashboard**

-   📈 **Analytics Dashboard** - Comprehensive loan statistics and KPIs
-   👥 **User Management** - Manage borrowers and admin users
-   💸 **Financial Overview** - Track disbursed amounts, repayments, and savings
-   📋 **Loan Administration** - Approve, reject, or verify loan applications
-   📊 **Performance Metrics** - Approval rates, collection rates, and more

### 🔧 **Technical Excellence**

-   🏗️ **Microservices Architecture** - Separate frontend and backend repositories for independent deployment
-   🛡️ **Type Safety** - Full TypeScript implementation across both services
-   🗃️ **Database ORM** - Prisma for type-safe database operations
-   🌐 **API Architecture** - RESTful API with proper error handling
-   🔒 **Security** - CORS protection, input validation, and secure authentication

---

## 🏗️ Architecture

<div align="center">

```mermaid
graph TB
    subgraph "Frontend (Vercel)"
        A[Next.js 15 App]
        B[Tailwind CSS + Radix UI]
        C[Clerk Authentication]
        D[React Hook Form]
    end

    subgraph "Backend (Render)"
        E[Express.js Server]
        F[Prisma ORM]
        G[JWT Middleware]
        H[CORS Protection]
    end

    subgraph "Database"
        I[(MongoDB Atlas)]
    end

    subgraph "Authentication"
        J[Clerk Platform]
    end

    A --> E
    E --> F
    F --> I
    C --> J
    G --> J
```

</div>

---

## 🛠️ Tech Stack

### **Frontend**

| Technology             | Purpose           | Version |
| ---------------------- | ----------------- | ------- |
| ⚛️ **Next.js**         | React Framework   | 15.3.2  |
| 🎨 **Tailwind CSS**    | Styling           | Latest  |
| 🧩 **Radix UI**        | Component Library | Latest  |
| 🔐 **Clerk**           | Authentication    | 6.19.1  |
| 📋 **React Hook Form** | Form Management   | Latest  |
| 🌙 **Next Themes**     | Dark Mode Support | 0.4.6   |

### **Backend**

| Technology        | Purpose             | Version |
| ----------------- | ------------------- | ------- |
| 🟢 **Node.js**    | Runtime Environment | Latest  |
| ⚡ **Express.js** | Web Framework       | 5.1.0   |
| 🔺 **TypeScript** | Type Safety         | 5.8.3   |
| 🗃️ **Prisma**     | Database ORM        | 6.7.0   |
| 🍃 **MongoDB**    | Database            | Latest  |
| 🔐 **Clerk SDK**  | Authentication      | 5.1.6   |

### **Deployment & DevOps**

| Service              | Purpose                |
| -------------------- | ---------------------- |
| ▲ **Vercel**         | Frontend Hosting       |
| 🎨 **Render**        | Backend Hosting        |
| 🍃 **MongoDB Atlas** | Database Hosting       |
| 🔐 **Clerk**         | Authentication Service |

---

## 🚀 Installation

### Prerequisites

-   Node.js 18+ installed
-   MongoDB Atlas account (or local MongoDB)
-   Clerk account for authentication

> **Note:** This project consists of two separate repositories - Frontend and Backend. You can choose to run either independently or both together for full functionality.

---

## 🎨 Frontend Setup

### 1️⃣ Clone the Frontend Repository

```bash
git clone https://github.com/sam-arth07/LoanManagerFrontend.git
cd LoanManagerFrontend
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

### 4️⃣ Start Development Server

```bash
npm run dev
```

### 5️⃣ Access the Frontend

-   Development: http://localhost:3000
-   Production: https://loan-manager-frontend-bcvd.vercel.app/

---

## ⚙️ Backend Setup

### 1️⃣ Clone the Backend Repository

```bash
git clone https://github.com/sam-arth07/LoanManagerBackend.git
cd LoanManagerBackend
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Environment Setup

Create a `.env` file in the root directory:

```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/loanmanager"
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
PORT=5000
FRONTEND_URL=https://your-frontend-url.com
```

### 4️⃣ Database Setup

```bash
npx prisma generate
npx prisma db push
```

### 5️⃣ Start Development Server

```bash
npm run dev
```

### 6️⃣ Access the Backend API

-   Development: http://localhost:5000
-   Production: https://your-backend-deployment-url.com

---

## 🔗 Connecting Frontend & Backend

1. **Update Frontend Environment**: Set `NEXT_PUBLIC_API_URL` to your backend URL
2. **Update Backend CORS**: Add your frontend URL to the allowed origins in the backend
3. **Verify Connection**: Check that API calls from frontend reach the backend successfully

---

## 🎯 Usage Guide

### **For Borrowers:**

1. **Sign Up/Login** using the authentication system
2. **Apply for a Loan** by filling out the application form
3. **Track Application Status** in your dashboard
4. **View Loan History** and repayment status

### **For Administrators:**

1. **Access Admin Dashboard** (requires admin privileges)
2. **Review Applications** and make approval decisions
3. **Monitor Analytics** and loan performance metrics
4. **Manage Users** and system settings

---

## 📁 Project Structure

### **Frontend Repository Structure**

```
LoanManagerFrontend/
├── 📁 app/                   # Next.js App Router
│   ├── 📁 admin/             # Admin Dashboard Pages
│   ├── 📁 dashboard/         # User Dashboard
│   ├── layout.tsx            # Root Layout
│   ├── page.tsx              # Home Page
│   └── globals.css           # Global Styles
├── 📁 components/            # Reusable UI Components
│   ├── 📁 ui/                # Shadcn/UI Components
│   ├── AdminLayout.tsx       # Admin Layout Wrapper
│   ├── LoanForm.tsx          # Loan Application Form
│   └── UserLoansTable.tsx    # Loans Display Table
├── 📁 hooks/                 # Custom React Hooks
├── 📁 lib/                   # Utility Libraries
├── 📁 utils/                 # Helper Functions
├── 📁 public/                # Static Assets
├── package.json              # Dependencies
└── README.md                 # Documentation
```

### **Backend Repository Structure**

```
LoanManagerBackend/
├── 📁 src/                   # Source Code
│   ├── 📁 routes/            # API Route Handlers
│   │   ├── admin.ts          # Admin Operations
│   │   ├── auth.ts           # Authentication
│   │   └── loan.ts           # Loan Management
│   └── prisma.ts             # Database Client
├── 📁 prisma/                # Database Schema
│   └── schema.prisma         # Prisma Schema File
├── 📁 generated/             # Generated Prisma Client
├── index.ts                  # Server Entry Point
├── package.json              # Dependencies
└── README.md                 # Documentation
```

---

## 🔌 API Documentation

### **Authentication Endpoints**

```http
POST /api/auth/verify           # Verify user authentication
```

### **Loan Management**

```http
GET    /api/loan                # Get user's loans
POST   /api/loan                # Create new loan application
PUT    /api/loan/:id            # Update loan application
DELETE /api/loan/:id            # Delete loan application
```

### **Admin Endpoints**

```http
GET    /api/admin/dashboard-stats    # Get dashboard statistics
GET    /api/admin/loans              # Get all loans (paginated)
GET    /api/admin/loans/:id          # Get specific loan details
PATCH  /api/admin/loans/:id/status   # Update loan status
GET    /api/admin/users              # Get all users (paginated)
```

---

## 🚀 Deployment

### **Frontend Deployment (Vercel)**

1. Fork the [Frontend Repository](https://github.com/sam-arth07/LoanManagerFrontend)
2. Connect your forked repository to Vercel
3. Set environment variables in Vercel dashboard:
    ```env
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
    CLERK_SECRET_KEY=your_clerk_secret_key
    NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
    NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
    NEXT_PUBLIC_API_URL=https://your-backend-url.com
    ```
4. Deploy automatically on every push to main branch

### **Backend Deployment (Render)**

1. Fork the [Backend Repository](https://github.com/sam-arth07/LoanManagerBackend)
2. Create a new web service on Render
3. Connect your forked repository
4. Set build command: `npm run build`
5. Set start command: `npm start`
6. Configure environment variables:
    ```env
    DATABASE_URL=mongodb+srv://...
    CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
    CLERK_SECRET_KEY=your_clerk_secret_key
    PORT=5000
    FRONTEND_URL=https://your-frontend-url.vercel.app
    ```

### **Post-Deployment Steps**

1. Update frontend environment variable `NEXT_PUBLIC_API_URL` with your backend URL
2. Update backend CORS settings to include your frontend URL
3. Test the connection between frontend and backend

---

## 🙏 Acknowledgments

-   **Clerk** for providing robust authentication
-   **Vercel** for seamless frontend deployment
-   **MongoDB Atlas** for reliable database hosting
-   **Render** for efficient backend hosting
-   **Radix UI** for accessible component primitives

---

<div align="center">

**⭐ If this project helped you, please give it a star! ⭐**

[![Frontend Stars](https://img.shields.io/github/stars/sam-arth07/LoanManagerFrontend?style=social&label=Frontend%20Stars)](https://github.com/sam-arth07/LoanManagerFrontend/stargazers)
[![Backend Stars](https://img.shields.io/github/stars/sam-arth07/LoanManagerBackend?style=social&label=Backend%20Stars)](https://github.com/sam-arth07/LoanManagerBackend/stargazers)

Made with ❤️ by the CreditSea Team

</div>
