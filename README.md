# Bookify – Frontend
Frontend project for **Bookify**, developed as part of the course **Advanced Frontend Development** (Mid Sweden University, 2025).  

Developed by **Anne-Lii Hansen**  

---

## About
Bookify is a React-based web application that allows users to search for books via the **Google Books API**, write reviews, and manage their own content.  
The frontend is built with **TypeScript** and communicates with a backend API developed using **Hapi.js**, with data stored in **MongoDB**.  

---

## Tech Stack
**Frontend**
- React (TypeScript)  
- React Router (navigation)  
- Axios (API requests)  
- Context API (state management)  
- CSS Modules (styling)  

**Backend**
- Node.js with Hapi.js  
- MongoDB  
- JWT authentication  
- Google Books API integration  

---

## Features
- Search for books using the Google Books API  
- View detailed book information  
- Register and log in with JWT authentication  
- Write, edit, and delete your own book reviews  
- Rate books  
- View all reviews written by the logged-in user  
- Secure and validated forms with error handling  

---

## Installation & Setup
Clone the repository and install dependencies:  
```bash
git clone https://github.com/Anne-Lii/bookify.git
cd bookify
npm install
npm run dev
```

## Backend API

The frontend communicates with a backend API built with Hapi.js. It is hosted on Render: https://bookify-api-nk6g.onrender.com/

Example Endpoints

- POST /register – Create a new account
- POST /login – Login and receive a JWT
- GET /reviews/book/:bookId – Get reviews for a specific book
- POST /reviews – Write a review (JWT required)
- PUT /reviews/:reviewId – Update a review (JWT required)
- DELETE /reviews/:reviewId – Delete a review (JWT required)
- GET /reviews/user – Get all reviews from the logged-in user
