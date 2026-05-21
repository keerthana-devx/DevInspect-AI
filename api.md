# DevInspect AI - Backend API Documentation

This document lists all active and inactive API endpoints, request/response formats, headers, and parameters present in the DevInspect AI backend codebase.

---

## 📌 General Information
* **Base URL:** `http://localhost:5000/api` (default port configured in `server.js` or through environment variable `PORT`)
* **Content Type:** `application/json` (for all request and response bodies)
* **Authentication:** Stateless JWT Token passed in the `Authorization` header.

---

## 🔐 Authentication API

### 1. Register User
* **Endpoint:** `POST /api/auth/register`
* **Description:** Creates a new user profile and returns a JWT token.
* **Headers:** 
  * `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "strongpassword123"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "_id": "60d0fe4f5311236168a109ca",
    "name": "John Doe",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
* **Error Response (400 Bad Request):**
  ```json
  {
    "message": "User exists"
  }
  ```

---

### 2. Login User
* **Endpoint:** `POST /api/auth/login`
* **Description:** Verifies user credentials and returns a JWT token.
* **Headers:** 
  * `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "strongpassword123"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "_id": "60d0fe4f5311236168a109ca",
    "name": "John Doe",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
* **Error Response (401 Unauthorized):**
  ```json
  {
    "message": "Invalid credentials"
  }
  ```

---

## 📊 Code Analysis & AI APIs

### 3. Run Analysis (Protected)
* **Endpoint:** `POST /api/analysis`
* **Description:** Runs an AI analysis on the provided input text/code, associates it with the authenticated user, and saves the history in MongoDB.
* **Headers:**
  * `Content-Type: application/json`
  * `Authorization: Bearer <your_jwt_token>` (Required)
* **Request Body:**
  ```json
  {
    "text": "console.log('test')",
    "mode": "developer" // Options: "developer", "student", "interview"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "_id": "60d0fe4f5311236168a109cb",
    "user": "60d0fe4f5311236168a109ca",
    "inputText": "console.log('test')",
    "result": {
      "correctedCode": "console.log('test');",
      "explanation": "Added missing semicolon.",
      "modeOutput": "BUGS:\n- None\n\nIMPROVEMENTS:\n- Add semicolon...",
      "errors": []
    },
    "mode": "developer",
    "createdAt": "2026-05-20T14:17:00.000Z",
    "updatedAt": "2026-05-20T14:17:00.000Z"
  }
  ```
* **Error Responses:**
  * **401 Unauthorized:**
    ```json
    { "message": "Not authorized" }
    ```
    or
    ```json
    { "message": "Token failed" }
    ```
  * **500 Internal Server Error:**
    ```json
    {
      "message": "AI analysis failed"
    }
    ```

---

### 4. Review Code
* **Endpoint:** `POST /api/review/analyze`
* **Description:** Quick code review using the AI service. Does not require authentication or user logging.
* **Headers:**
  * `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "code": "function add(a,b) { return a+b }",
    "mode": "developer" // Options: "developer", "student", "interview"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "originalCode": "function add(a,b) { return a+b }",
    "correctedCode": "function add(a, b) {\n  return a + b;\n}",
    "explanation": "Formatted code and added missing semicolons.",
    "modeOutput": "...",
    "errors": []
  }
  ```
* **Error Response (500 Internal Server Error):**
  ```json
  {
    "success": false,
    "message": "AI analysis failed"
  }
  ```

---

### 5. AI Analyze Content
* **Endpoint:** `POST /api/ai/analyze`
* **Description:** Analyzes code relative to a given programming language.
* **Headers:**
  * `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "code": "print('hello')",
    "language": "python"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "result": {
      "correctedCode": "print('hello')",
      "explanation": "Code is already correct.",
      "modeOutput": "...",
      "errors": []
    }
  }
  ```
* **Error Response (500 Internal Server Error):**
  ```json
  {
    "success": false,
    "message": "AI analysis failed"
  }
  ```

---

### 6. AI Analyze Code (with Optional History Tracking)
* **Endpoint:** `POST /api/ai/analyze-code`
* **Description:** A primary code analyzer. It runs the AI pipeline, logs the result to `History` collection under the authenticated user (or as `"guest"` if unauthenticated), and maps details.
* **Headers:**
  * `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "code": "const x = 5",
    "mode": "developer" // Options: "developer", "student", "interview"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "correctedCode": "const x = 5;",
    "explanation": "Added missing semicolon.",
    "modeOutput": "BUGS:\n- missing semicolon...",
    "errors": [],
    "degraded": false
  }
  ```
* **Error Response (400 Bad Request):**
  ```json
  {
    "message": "Missing code in request"
  }
  ```
* **Error Response (500 Internal Server Error):**
  ```json
  {
    "message": "AI analysis failed"
  }
  ```

---

### 7. Spec-Compatible Root Code Analysis Alias
* **Endpoint:** `POST /api/analyze-code`
* **Description:** Direct top-level alias for `POST /api/ai/analyze-code` mounted in the root application router.
* **Headers:**
  * `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "code": "const x = 5",
    "mode": "developer"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "correctedCode": "const x = 5;",
    "explanation": "Added missing semicolon.",
    "modeOutput": "BUGS:\n- missing semicolon...",
    "errors": [],
    "degraded": false
  }
  ```
* **Error Response (400 Bad Request):**
  ```json
  {
    "message": "Missing code in request"
  }
  ```
* **Error Response (500 Internal Server Error):**
  ```json
  {
    "message": "AI analysis failed"
  }
  ```

---

### 8. AI Service Provider Health Check
* **Endpoint:** `GET /api/ai/health`
* **Description:** Returns the availability and models configured for Gemini and OpenAI providers based on server environment variables.
* **Headers:** None
* **Success Response (200 OK):**
  ```json
  {
    "status": "ok",
    "providers": {
      "openai": true,
      "gemini": {
        "configured": true,
        "models": ["gemini-2.5-flash"]
      }
    },
    "ready": true
  }
  ```

---

## 🧪 Testing APIs

### 9. Hello Verification Check
* **Endpoint:** `GET /api/test/hello`
* **Description:** Verification endpoint to check route accessibility.
* **Headers:** None
* **Success Response (200 OK):**
  ```json
  {
    "message": "API Working"
  }
  ```

---

## ⚠️ Unused / Inactive Routes
*(Discovered in code files but not currently mounted in `app.js`)*

### 10. History Verification Router (`historyRoutes.js`)
* **Endpoint:** `GET /api/history/` *(Not Mounted)*
* **Description:** Placeholder history health check.
* **Success Response (200 OK):**
  ```json
  {
    "message": "History route working"
  }
  ```
* **Note:** A legacy controller `src/controllers/historyController.js` exists using CommonJS (`require`), containing full implementations for `getHistory` (fetching all histories for the authenticated user) and `addHistoryEntry`. However, they are currently unmounted and inactive in the API routing setup.

### 11. User Verification Router (`userRoutes.js`)
* **Endpoint:** `GET /api/user/` *(Not Mounted)*
* **Description:** Placeholder user health check.
* **Success Response (200 OK):**
  ```json
  {
    "message": "User route working"
  }
  ```
* **Note:** A legacy controller `src/controllers/userController.js` exists using CommonJS (`require`), containing full implementations for `getProfile` and `getAllUsers`. However, they are currently unmounted and inactive in the API routing setup.
