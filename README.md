# ProChat 💬

ProChat is a real-time chat application built with modern web technologies to provide a seamless and responsive messaging experience. It supports one-to-one and group chats, user authentication, file sharing, and customizable profiles, all powered by a robust backend and intuitive frontend.

---

## Features

- **Real-time Messaging:** Powered by Socket.io with real-time typing indicators and instant message delivery.
- **User Authentication:** Secure login and registration using JWT tokens and bcrypt password hashing.
- **One-to-One and Group Chats:** Create groups, share files, and chat with individuals or multiple users.
- **File and Image Sharing:** Share images and files directly within chats.
- **Profile Customization:** Users can set avatars, status messages, theme preferences, and live presence indicators.
- **Responsive UI:** Built with React, Tailwind CSS, and ShadCN UI components for a clean and mobile-friendly interface.
- **State Management:** Efficient client-side state handling using Zustand.
- **Persistent Storage:** Chat history and user data stored securely in MongoDB.

---

## Tech Stack

- **Frontend:** React.js, Tailwind CSS, Zustand, ShadCN UI  
- **Backend:** Node.js, Express.js, Socket.io  
- **Database:** MongoDB  
- **Authentication:** JWT, bcrypt  

---

## Installation

### Prerequisites

- Node.js and npm installed  
- MongoDB instance (local or cloud)  

## Setup

   ### Clone the repo and enter directory
    git clone https://github.com/your-username/ProChat.git
    cd ProChat

  ### Setup backend
    cd backend
    npm install

  ### Create .env file (replace placeholders with your values)
    echo "PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    CLIENT_URL=http://localhost:5173" > .env

  ### Start backend server 
    npm run dev

  ### Start frontend server
    cd ProChat/frontend
    npm install
    npm run dev






