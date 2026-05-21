# DevInspectAI - Backend API

AI-powered code review and analysis backend service.

## Features

- **User Authentication** - JWT-based auth with register/login
- **AI Code Analysis** - Multi-mode analysis (Student, Interviewer, Developer)
- **Dual AI Provider Support** - OpenAI (primary) and Google Gemini (fallback)
- **Workspace Management** - Team collaboration with workspaces
- **Analysis History** - Persistent storage of all code reviews
- **CI/CD Integration** - API key-based authentication for CI pipelines

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **AI Providers**: OpenAI API, Google Gemini API
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcryptjs for password hashing

## Setup

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- OpenAI API key OR Google Gemini API key

### Installation

```bash
# Install dependencies
npm install

# Copy environment example
cp .env.example .env

# Edit .env with your configuration
# Required: MONGO_URI, JWT_SECRET, and at least one AI provider key
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 5000) |
| `NODE_ENV` | No | Environment (development/production) |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for JWT signing (min 32 chars) |
| `OPENAI_API_KEY` | No* | OpenAI API key (primary provider) |
| `OPENAI_MODEL` | No | OpenAI model (default: gpt-4o-mini) |
| `GEMINI_API_KEY` | No* | Google Gemini API key (fallback) |
| `GEMINI_MODEL` | No | Gemini model (default: gemini-2.0-flash) |
| `CORS_ORIGIN` | No | Comma-separated allowed origins |

\* At least one AI provider key is required for full functionality.

### Running the Server

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

Server will start on `http://localhost:5000`

## API Endpoints

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
| POST | `/api/ai/analyze-code` | No | Quick analysis with history |

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
| POST | `/api/workspace/:id/invite` | Yes | Invite member |

### CI/CD
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/ci/review` | API Key | Run analysis via API key |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Service health status |
| GET | `/api/ai/health` | AI provider status |
| GET | `/api/test/hello` | Basic connectivity test |

## Analysis Modes

### Student Mode
- Beginner-friendly explanations
- Step-by-step breakdowns
- Educational feedback
- Bug identification with learning notes

### Interviewer Mode
- Code correctness evaluation
- 5-10 technical interview questions
- Expected answers provided
- Edge case analysis

### Developer Mode
- Production-grade code review
- Security vulnerability detection
- Performance optimization suggestions
- Architecture and tooling recommendations

## Response Format

All analysis endpoints return consistent JSON:

```json
{
  "correctedCode": "string",
  "explanation": "string",
  "modeOutput": "string",
  "errors": [
    {
      "message": "string",
      "line": "number",
      "severity": "Critical|High|Medium|Low",
      "category": "Security|Bug|Style|Performance"
    }
  ],
  "suggestions": [],
  "questions": [],
  "mode": "student|interviewer|developer",
  "degraded": "boolean"
}
```

## Error Handling

The API uses standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

Error responses include a `message` field with details.

## License

ISC