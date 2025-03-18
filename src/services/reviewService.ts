import axios from "axios";

const API_URL = "https://bookify-api-nk6g.onrender.com/reviews";

//fetch reviews for a specific book
export const fetchReviews = async (bookId: string) => {
    try {
      const response = await axios.get(`${API_URL}/book/${bookId}`);
      return response.status === 200 ? response.data : [];
    } catch (err: any) {
      if (err.response?.status === 404) {
        return []; //No reviews found, return empty array
      } else {
        console.error("Error fetching reviews:", err);
        throw err; //Re-throw the error to handle it in the component
      }
    }
};

//submit a new review
export const submitReview = async (bookId: string, reviewText: string, rating: number, token: string) => {
    try {
      const response = await axios.post(
        API_URL,
        { bookId, reviewText, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.status === 201; //return true if successful
    } catch (err) {
      console.error("Error submitting review:", err);
      throw err;
    }
};

//delete a review
export const deleteReview = async (reviewId: string, token: string) => {
    try {
      await axios.delete(`${API_URL}/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Error deleting review:", err);
      throw err;
    }
};