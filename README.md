# 🏦 CreditSea Loan Manager

<div align="center">

![Loan Manager Banner](https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=200&fit=crop&crop=entropy&auto=format&q=80)

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_App-4285f4?style=for-the-badge)](https://loan-manager-frontend-bcvd.vercel.app/)
[![Frontend](https://img.shields.io/badge/Frontend-Next.js_15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Backend](https://img.shields.io/badge/Backend-Node.js_+_Express-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb)](https://mongodb.com/)
[![Auth](https://img.shields.io/badge/Auth-Clerk-7C3AED?style=for-the-badge)](https://clerk.com/)

**A modern, full-stack loan management system designed for financial institutions and lending platforms.**

[🚀 Live Demo](https://loan-manager-frontend-bcvd.vercel.app/) • [📖 Documentation](#documentation) • [🔧 Installation](#installation) • [🤝 Contributing](#contributing)

</div>

---

## ✨ Features

### 👤 **User Experience**
- 🔐 **Secure Authentication** - Powered by Clerk with JWT tokens
- 📱 **Responsive Design** - Seamless experience across all devices
- 🎨 **Modern UI/UX** - Built with Tailwind CSS and Radix UI components
- ⚡ **Real-time Updates** - Instant loan status notifications
- 🔄 **Offline Support** - Continue working even without internet

### 💼 **Loan Management**
- 📝 **Easy Application Process** - Streamlined loan application workflow
- 📊 **Application Tracking** - Track loans from application to approval
- 💰 **Multiple Loan Types** - Support for various loan purposes
- 📈 **Status Management** - Pending → Approved → Verified → Repaid workflow
- 🔍 **Advanced Filtering** - Search and filter loans by multiple criteria

### 👨‍💼 **Admin Dashboard**
- 📈 **Analytics Dashboard** - Comprehensive loan statistics and KPIs
- 👥 **User Management** - Manage borrowers and admin users
- 💸 **Financial Overview** - Track disbursed amounts, repayments, and savings
- 📋 **Loan Administration** - Approve, reject, or verify loan applications
- 📊 **Performance Metrics** - Approval rates, collection rates, and more

### 🔧 **Technical Excellence**
- 🏗️ **Monorepo Architecture** - Organized codebase with separate frontend/backend
- 🛡️ **Type Safety** - Full TypeScript implementation
- 🗃️ **Database ORM** - Prisma for type-safe database operations
- 🌐 **API Architecture** - RESTful API with proper error handling
- 🔒 **Security** - CORS protection, input validation, and secure authentication

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
| Technology | Purpose | Version |
|------------|---------|---------|
| ⚛️ **Next.js** | React Framework | 15.3.2 |
| 🎨 **Tailwind CSS** | Styling | Latest |
| 🧩 **Radix UI** | Component Library | Latest |
| 🔐 **Clerk** | Authentication | 6.19.1 |
| 📋 **React Hook Form** | Form Management | Latest |
| 🌙 **Next Themes** | Dark Mode Support | 0.4.6 |

### **Backend**
| Technology | Purpose | Version |
|------------|---------|---------|
| 🟢 **Node.js** | Runtime Environment | Latest |
| ⚡ **Express.js** | Web Framework | 5.1.0 |
| 🔺 **TypeScript** | Type Safety | 5.8.3 |
| 🗃️ **Prisma** | Database ORM | 6.7.0 |
| 🍃 **MongoDB** | Database | Latest |
| 🔐 **Clerk SDK** | Authentication | 5.1.6 |

### **Deployment & DevOps**
| Service | Purpose |
|---------|---------|
| ▲ **Vercel** | Frontend Hosting |
| 🎨 **Render** | Backend Hosting |
| 🍃 **MongoDB Atlas** | Database Hosting |
| 🔐 **Clerk** | Authentication Service |

---

## 🚀 Installation

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- Clerk account for authentication

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/loan-manager.git
cd loan-manager
```

### 2️⃣ Install Dependencies

**Frontend:**
```bash
cd apps/frontend
npm install
```

**Backend:**
```bash
cd apps/backend
npm install
```

### 3️⃣ Environment Setup

**Frontend (.env.local):**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Backend (.env):**
```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/loanmanager"
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
PORT=5000
```

### 4️⃣ Database Setup
```bash
cd apps/backend
npx prisma generate
npx prisma db push
```

### 5️⃣ Start Development Servers

**Backend:**
```bash
cd apps/backend
npm run dev
```

**Frontend:**
```bash
cd apps/frontend
npm run dev
```

### 6️⃣ Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

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

```
loan-manager/
├── 📁 apps/
│   ├── 📁 frontend/          # Next.js Frontend Application
│   │   ├── 📁 app/           # App Router Pages
│   │   ├── 📁 components/    # Reusable UI Components
│   │   ├── 📁 hooks/         # Custom React Hooks
│   │   ├── 📁 lib/           # Utility Libraries
│   │   └── 📁 utils/         # Helper Functions
│   └── 📁 backend/           # Express.js Backend API
│       ├── 📁 src/           # Source Code
│       │   ├── 📁 routes/    # API Route Handlers
│       │   └── prisma.ts     # Database Client
│       ├── 📁 prisma/        # Database Schema
│       └── index.ts          # Server Entry Point
├── 📄 README.md              # Project Documentation
└── 📄 package.json           # Root Package Configuration
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

### **Frontend (Vercel)**
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on every push to main branch

### **Backend (Render)**
1. Create a new web service on Render
2. Connect your GitHub repository
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Configure environment variables

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### **Development Guidelines**
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Clerk** for providing robust authentication
- **Vercel** for seamless frontend deployment
- **MongoDB Atlas** for reliable database hosting
- **Render** for efficient backend hosting
- **Radix UI** for accessible component primitives

---

## 📞 Support

Need help? We're here for you!

- 📧 **Email**: support@creditsea.com
- 💬 **Discord**: [Join our community](https://discord.gg/creditsea)
- 📖 **Documentation**: [Read the docs](#documentation)
- 🐛 **Issues**: [Report a bug](https://github.com/your-username/loan-manager/issues)

---

<div align="center">

**⭐ If this project helped you, please give it a star! ⭐**

[![GitHub stars](https://img.shields.io/github/stars/your-username/loan-manager?style=social)](https://github.com/your-username/loan-manager/stargazers)

Made with ❤️ by the CreditSea Team

</div>
