# I-Notarization – Online Notarization Management System

A full-stack platform that enables users to notarize documents online, integrated with **blockchain**, **NFT storage**, **AI (Gemini)**, **VietQR**, **online payments**, and a modern user interface.

This repository contains **both backend and frontend documentation**, merged into a single unified README for your combined repo.

---

# 🚀 Features

## 🔒 Core Platform Features

* **Document Upload:** Upload personal or business documents securely.
* **Notary Service Selection:** Choose services and notarization fields.
* **Requester Information:** Provide required details for notarization.
* **Email Notifications:** Receive real-time updates about request status.
* **Authentication:** JWT-based login system.
* **Google OAuth Login** for quick access.
* **Role-Based Access Control:** Admin, customer, and notary permissions.

## 🧠 Advanced Integrations

* **Gemini API** for AI-powered document generation & suggestions.
* **Blockchain & NFT Storage** (via Alchemy + Pinata) for immutable document proofs.
* **Firebase Cloud Storage** for secure document file hosting.
* **VietQR Integration** for verification QR codes.
* **Online Payment Gateway** (PayOS).

## 🧩 Frontend Features

* React + Material UI interface.
* Create notarization profiles.
* Upload & preview documents.
* Create notarization sessions for multi-doc workflows.
* Track notarization status on dashboard.
* User guides & visual step-by-step instructions.
* Fully responsive UI.

---

# 🛠 Technology Stack

## Backend

* **Node.js, Express.js**
* **MongoDB, Mongoose**
* **Authentication:** JWT, Passport.js
* **Validation:** Joi
* **Logging:** Winston, Morgan
* **Security:** Helmet, XSS-Clean, Express-Mongo-Sanitize
* **CI/CD:** Travis CI
* **Testing:** Jest
* **Container:** Docker
* **Deployment:** Railway

## Frontend

* **React (CRA)**
* **Material UI**
* **Redux Toolkit**
* **React Router**
* **React Intersection Observer**
* **React Toastify**
* **Testing:** Jest + RTL


# ⚙️ Backend – Installation & Setup

### 1. Clone repo

```bash
git clone https://github.com/MinhQuan805/INotarization.git
cd INotarization/backend
```

### 2. Install dependencies

```bash
yarn
```

### 3. Configure environment

```bash
cp .env.example .env
```

Fill all required fields (MongoDB, JWT, Google OAuth, Firebase, Gemini, PayOS…).

### 4. Start server

```bash
yarn start
```

### Backend API docs

Visit:

```
http://localhost:3000/v1/docs
```

### Running tests

```bash
yarn test
yarn test --coverage
```

### Docker

```bash
yarn docker:dev
yarn docker:prod
```

---

# 🖥️ Frontend – Installation & Setup

### 1. Navigate to frontend

```bash
cd ../frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Example:

```
REACT_APP_API_BASE_URL=http://localhost:3000
```

### 4. Start development server

```bash
npm start
```

App URL:

```
http://localhost:3000
```

### Run tests

```bash
npm test
```

---

# 🌐 Environment Variables Overview

### Backend (.env)

```bash
# Server
PORT=3000
HOST=http://localhost

# Database
MONGODB_URL=mongodb://127.0.0.1:27017/I-Notarization

# JWT
JWT_SECRET=...
JWT_ACCESS_EXPIRATION_MINUTES=30
JWT_REFRESH_EXPIRATION_DAYS=30

# SMTP
SMTP_HOST=
SMTP_PORT=
SMTP_USERNAME=
SMTP_PASSWORD=
EMAIL_FROM=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=

# Gemini AI
GEMINI_API_KEY=

# Firebase
FIREBASE_TYPE=
FIREBASE_PROJECT_ID=
...

# Payment (PayOS)
PAYOS_CLIENT_ID=
PAYOS_API_KEY=
PAYOS_CHECKSUM_KEY=

# Blockchain / NFT
ALCHEMY_API_KEY=
PRIVATE_KEY=
CONTRACT_ADDRESS=
PINATA_API_KEY=
PINATA_SECRET_KEY=
```

### Frontend (.env)

```
REACT_APP_API_BASE_URL=http://localhost:3000
```

---

# 🤝 Contribution

Contributions are welcome!
Feel free to open issues or submit pull requests.

---