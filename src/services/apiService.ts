import axios from "axios";

const API_URL = "https://bookify-api-nk6g.onrender.com";


//A SPECIFIK BOOKS REVIEWS

//Fetch reviews for a specific book
export const fetchReviews = async (bookId: string) => {
    try {
        const response = await axios.get(`${API_URL}/reviews/book/${bookId}`);
        return response.status === 200 ? response.data : [];
    } catch (err: any) {
        if (err.response?.status === 404) {
            return []; // No reviews found, return empty array
        } else {
            console.error("Error fetching reviews:", err);
            throw err;
        }
    }
};

//Submit a new review
export const submitReview = async (bookId: string, reviewText: string, rating: number, token: string) => {
    try {
        const response = await axios.post(
            `${API_URL}/reviews`,
            { bookId, reviewText, rating },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.status === 201;
    } catch (err) {
        console.error("Error submitting review:", err);
        throw err;
    }
};

//Delete a review
export const deleteReview = async (reviewId: string, token: string) => {
    try {
        await axios.delete(`${API_URL}/reviews/${reviewId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    } catch (err) {
        console.error("Error deleting review:", err);
        throw err;
    }
};

//USER REVIEWS

//Fetch user reviews
export const fetchUserReviews = async (token: string) => {
  try {
      const response = await axios.get(`${API_URL}/reviews/user`, {
          headers: { Authorization: `Bearer ${token}` },
      });

      return response.status === 200 ? response.data : [];
  } catch (err) {
      console.error("Error fetching user reviews:", err);
      throw err;
  }
};

//Delete a review
export const deleteUserReview = async (reviewId: string, token: string) => {
  try {
      await axios.delete(`${API_URL}/reviews/${reviewId}`, {
          headers: { Authorization: `Bearer ${token}` },
      });
  } catch (err) {
      console.error("Error deleting review:", err);
      throw err;
  }
};

//Update a review
export const updateUserReview = async (reviewId: string, reviewText: string, token: string) => {
  try {
      await axios.put(
          `${API_URL}/reviews/${reviewId}`,
          { reviewText },
          { headers: { Authorization: `Bearer ${token}` } }
      );
  } catch (err) {
      console.error("Error updating review:", err);
      throw err;
  }
};


//USER

//User login
export const loginUser = async (email: string, password: string) => {
    try {
        const response = await axios.post(`${API_URL}/login`, { email, password });
        if (response.status === 200) {
            return response.data;
        }
    } catch (err) {
        throw new Error("Invalid email or password.");
    }
};

//User registration
export const registerUser = async (username: string, email: string, password: string) => {
    try {
        const response = await axios.post(`${API_URL}/register`, { username, email, password });
        return response.status === 201;
    } catch (err) {
        console.error("Error registering user:", err);
        throw err;
    }
};
