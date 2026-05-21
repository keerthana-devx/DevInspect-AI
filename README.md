# DevInspectAI - AI-Powered Code Review Platform

A full-stack MERN application that provides AI-powered code review and analysis with three specialized modes: Student, Interviewer, and Developer.

## 🚀 Features

- **User Authentication** - JWT-based registration and login
- **AI Code Analysis** - Multi-mode analysis powered by OpenAI/Gemini
- **Three Analysis Modes**:
  - **Student Mode** - Beginner-friendly explanations and learning notes
  - **Interviewer Mode** - Technical interview questions and evaluations
  - **Developer Mode** - Production-grade code review with security and performance analysis
- **Workspace Management** - Team collaboration features
- **Analysis History** - Persistent storage with bookmarking
- **CI/CD Integration** - API key-based authentication for automation

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **AI Providers**: OpenAI API, Google Gemini API
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcryptjs

### Frontend
- **Build Tool**: Vite
- **Framework**: React 18
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Context API
- **Charts**: Chart.js
- **Icons**: Lucide React
- **Routing**: React Router v7

## 📋 Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key OR Google Gemini API key

## 🔧 Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd DevInspectAI
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your API URL
```

## ⚙️ Configuration

### Backend Environment Variables (.env)

```env
# Required
PORT=5000
MONGO_URI=mongodb://localhost:27017/devinspect
JWT_SECRET=your-super-secret-jwt-key-min-32-characters

# Optional - AI Providers (at least one required for full functionality)
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4o-mini

# OR
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash

# Optional
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

### Frontend Environment Variables (.env)

```env
VITE_API_URL=http://localhost:5000
```

## 🚀 Running the Application

### Start Backend
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

### Start Frontend
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

## 📚 API Documentation

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |

### Code Analysis
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/analysis` | Yes | Run analysis and save to history |
| GET | `/api/analysis` | Yes | Get user's analysis history |
| PUT | `/api/analysis/:id/bookmark` | Yes | Toggle bookmark |
| DELETE | `/api/analysis/:id` | Yes | Delete analysis |
| DELETE | `/api/analysis` | Yes | Clear all analyses |
| POST | `/api/analyze-code` | No | Quick analysis (no history) |

### User Profile
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/user/profile` | Yes | Get user profile |
| PUT | `/api/user/profile` | Yes | Update profile |
| DELETE | `/api/user/profile` | Yes | Delete account |

### Workspaces
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/workspace` | Yes | Create workspace |
| GET | `/api/workspace` | Yes | Get user's workspaces |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Service health status |

## 📁 Project Structure

```
DevInspectAI/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth middleware
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API routes
│   │   ├── services/        # AI services
│   │   ├── utils/           # Utility functions
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Server entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts
│   │   ├── lib/             # Utilities and config
│   │   ├── pages/           # Route pages
│   │   └── main.jsx         # App entry point
│   ├── .env.example
│   └── package.json
└── README.md
```

## 🔑 Key Features

### 1. Authentication System
- JWT-based authentication with 7-day expiry
- Secure password hashing with bcrypt
- Token stored in localStorage as `devinspect-token`
- User data stored as `devinspect-user`

### 2. AI Analysis
- **OpenAI** as primary provider (GPT-4o-mini)
- **Google Gemini** as fallback (gemini-2.0-flash)
- Offline simulation mode when no API keys configured
- Consistent JSON response format across all modes

### 3. Mode System
- **Student**: Educational feedback with step-by-step explanations
- **Interviewer**: Technical questions with expected answers
- **Developer**: Production-grade review with security/performance analysis

### 4. Frontend Architecture
- Centralized API configuration (`apiConfig.js`)
- Auth context for state management
- Local + server-side history storage
- Responsive design with Tailwind CSS

## 🐛 Troubleshooting

### Common Issues

1. **401 Errors on Profile Fetch**
   - Ensure token is stored in localStorage as `devinspect-token`
   - Check that JWT_SECRET is set correctly in backend .env

2. **CORS Errors**
   - Verify CORS_ORIGIN includes your frontend URL
   - Default allows localhost:3000 and localhost:5173

3. **AI Analysis Returns Fallback Response**
   - Check that OPENAI_API_KEY or GEMINI_API_KEY is configured
   - Verify API key is valid and has available credits

4. **MongoDB Connection Failed**
   - Ensure MongoDB is running
   - Check MONGO_URI is correct

## 📄 License

ISC