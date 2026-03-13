# ThinkGrid Backend - Technical Documentation

This document provides a detailed overview of the backend architecture, tech stack, and file structure.

## 🛠 Tech Stack & Dependencies

The backend is built as a RESTful API using the following core technologies:

### Core Framework
- **Node.js**: JavaScript runtime environment.
- **Express.js**: Fast, unopinionated, minimalist web framework for Node.js.
- **ES Modules**: Modern JavaScript module system (`import`/`export`).

### Database & ORM
- **MongoDB Atlas**: Cloud-hosted NoSQL database.
- **Mongoose**: Elegant MongoDB object modeling for Node.js, providing schema validation and easy interaction.

### Authentication & Security
- **JSON Web Tokens (JWT)**: Used for stateless authentication between frontend and backend.
- **BcryptJS**: Used for securely hashing user passwords.
- **CORS**: Configured to allow cross-origin requests from the frontend (Vercel/Localhost).

### File Management
- **Multer**: Middleware for handling `multipart/form-data`, primarily used for file/material uploads.

### Other Utilities
- **Axios**: Used for server-side HTTP requests (e.g., verifying Google OAuth tokens).
- **Dotenv**: Manages environment variables (.env).
- **Nodemon** (Dev only): Automatically restarts the server on file changes.

---

## 📂 File Structure & Purpose

### Root Files
- **`server.js`**: The main entry point. Configures the Express app, connects to MongoDB, sets up global middleware, and mounts all API routes.
- **`package.json`**: Defines dependencies, scripts, and project metadata.
- **`.env`**: Stores sensitive configuration (Database URI, JWT Secret, Port).
- **`.gitignore`**: Specifies files and folders to be ignored by Git (e.g., `node_modules`, `.env`).

### `config/`
- **`db.js`**: Contains the logic to establish a connection with the MongoDB Atlas cluster.

### `controllers/`
*Contains the business logic for each feature area:*
- **`authController.js`**: Handles user registration, login, and Google OAuth authentication flow.
- **`userController.js`**: Manages user profiles (fetching and updating profile data).
- **`roomController.js`**: Logic for creating, joining, and listing discussion rooms.
- **`materialController.js`**: Logic for the Materials Hub, including uploading and saving resources.
- **`messageController.js`**: Handles direct messaging and conversation history.
- **`exploreController.js`**: Logic for fetching and filtering users in the community hub.

### `middleware/`
- **`auth.js`**: A custom middleware that protects routes by verifying the JWT token in the request headers.
- **`upload.js`**: Configures **Multer** for local file storage, handling file naming and directory structure for uploads.

### `models/`
*Defines the MongoDB collection schemas:*
- **`User.js`**: Schema for user accounts, profiles, and credentials.
- **`Material.js`**: Schema for study resources and shared documents.
- **`Room.js`**: Schema for discussion groups and labs.
- **`Message.js`**: Schema for chat messages between users.
- **`Post.js`**: Schema for community feed posts (if applicable).

### `routes/`
*Maps incoming API requests to their respective controllers:*
- **`auth.js`**, **`users.js`**, **`rooms.js`**, **`materials.js`**, **`messages.js`**, **`explore.js`**, **`posts.js`**.

### `uploads/`
- Static folder where all uploaded materials and resources are stored and served from.
