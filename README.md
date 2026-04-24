# 🤖 AI Chat Fullstack Application

A fullstack chat application built using **Node.js, Express.js, MySQL, and Vanilla JavaScript**. This project demonstrates RESTful API development, database integration, and dynamic frontend interaction using a structured architecture.

---

## 🚀 Project Overview

The AI Chat Fullstack Application is designed to simulate a real-world chat system where users can send, retrieve, update, and delete messages. The application follows a modular approach with clear separation between frontend, backend, and database components.

The frontend provides an interactive user interface for sending and viewing messages. The backend handles API requests, processes data, and communicates with the MySQL database. The system is scalable and can be extended with features like authentication, AI chatbot integration, and real-time communication.

---

## 🛠️ Tech Stack

### 💻 Frontend

* HTML
* CSS
* JavaScript (Vanilla)

### ⚙️ Backend

* Node.js
* Express.js

### 🗄️ Database

* MySQL (mysql2)

### 🔧 Tools

* Postman (API Testing)
* Git & GitHub (Version Control)

---

## 📁 Folder Structure

```plaintext id="r4n6jl"
AI_CHAT_FULLSTACK/
├── backend/
├── frontend/
├── database/
├── postman/
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash id="yjydha"
git clone https://github.com/YOUR_USERNAME/Neural-AI.git
cd Neural-AI
```

---

### 2️⃣ Setup Backend

```bash id="z7yjru"
cd backend
npm install
```

---

### 3️⃣ Create Environment File

Create a file named `.env` inside the backend folder and add:

```env id="u2eowg"
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=ai_chat_db
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
GROQ_API_KEY=your_api_key_here
```

---

### 4️⃣ Setup Database

* Open MySQL
* Run the `schema.sql` file from the `/database` folder

---

### 5️⃣ Run the Server

```bash id="w0u9zb"
npm start
```

---

### 6️⃣ Run Frontend

* Open `frontend/chat.html` in your browser

---

## 📡 API Endpoints

| Method | Endpoint       | Description        |
| ------ | -------------- | ------------------ |
| GET    | /api/chats     | Fetch all chats    |
| POST   | /api/chats     | Create new message |
| PUT    | /api/chats/:id | Update message     |
| DELETE | /api/chats/:id | Delete message     |

---

## 📸 Screenshots

### 🖥️ Chat Interface

<img width="1162" height="576" alt="image" src="https://github.com/user-attachments/assets/f2a1e629-36af-460b-935f-736fe0744deb" />

<img width="1159" height="571" alt="image" src="https://github.com/user-attachments/assets/7d36dd33-eeab-43e3-b1ef-631eecf88c49" />

<img width="1202" height="592" alt="image" src="https://github.com/user-attachments/assets/70b434ff-9f39-4849-991e-02ea9b06454a" />


## 🧪 Testing

All backend APIs were tested using Postman to ensure proper functionality before integrating with the frontend.

---

## 📌 Features

* CRUD operations for chat messages
* RESTful API design
* MySQL database integration
* Modular and scalable structure

---

## 🔮 Future Enhancements

* 🔹 User authentication (JWT)
* 🔹 AI chatbot integration
* 🔹 Real-time chat (WebSockets)
* 🔹 Cloud deployment

---

## 👩‍💻 Author

**Yasasri**

---

## ⭐ Contributing

Feel free to fork this repository and submit pull requests!

---

## 📜 License

This project is open-source and available under the MIT License.
