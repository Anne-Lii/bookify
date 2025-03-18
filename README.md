# **Bookify**
Anne-Lii Hansen 
anha2324@student.miun.se

Bookify is a React-based web application that allows users to search for books via the Google Books API, write reviews, and manage their own book reviews. The frontend is built with TypeScript and communicates with a backend API developed with Hapi.js and the data is stored in a MongoDb database.


## **FRONTEND**

### **Features**
* Search for books using the Google Books API  
* View detailed book information  
* Register and log in with JWT authentication  
* Write book reviews  
* Rate a book
* Edit and delete your own reviews  
* View a list of all reviews written by logged in user

### **Technologies Used**
#### **Frontend**
- **React** with TypeScript  
- **React Router** for navigation  
- **Axios** for API requests  
- **Context API** for state management  
- **CSS Modules** for styling  

#### **Backend**
- **Hapi.js** (Node.js framework)  
- **MongoDB** (Database)  
- **JWT authentication** for user login  
- **Google Books API** integration  

###  **Installation & Setup**
This project is version-controlled using Git. Repository is public on GitHub:
https://github.com/Anne-Lii/bookify.git 

#### **1. Clone the project**
```sh
git clone https://github.com/Anne-Lii/bookify.git
cd bookify
```

#### **2. Install dependencies**
```sh
npm install
```

#### **3. Start server**
```sh
npm run dev
```


## **BACKEND**

The frontend communicates with a backend API built with Hapi.js.
It is hosted on Render:
```sh
https://bookify-api-nk6g.onrender.com 
```

### **API endpoints**

POST	  /register:	            Create a new account
POST	  /login:	                Login and get a JWT
GET	    /reviews/book/:bookId:	Get reviews for a book
POST	  /reviews:	              Write a review (authentication is needed)
PUT	    /reviews/:reviewId:	    Update a review (authentication is needed)
DELETE	/reviews/:reviewId:	    Delete a review (authentication is needed)
GET	    /reviews/user:	        Get all the logged in users reviews

### Error Handling
* Form validation ensures that users enter valid data when registering and submitting reviews.
* API error handling provides clear messages if a request fails.
* JWT authentication errors return proper feedback if login fails.