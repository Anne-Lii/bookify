import './DetailsPage.css'
import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBookDetails } from "../services/googleBooksApi";
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

interface Book {
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
    };
    publishedDate?: string;
    pageCount?: number;
  };
}

interface Review {
  _id: string;
  userId: { username: string };
  reviewText: string;
  rating: number;
  createdAt: string;
}


//function to remove HTML-tags and decode HTML-entitys in description text to make it nicer
const cleanText = (html: string) => {
  let text = html.replace(/<br\s*\/?>/g, "\n"); //replace <br> text with actuall <br>
  text = text.replace(/<[^>]+>/g, ""); //remove HTML-tags
  const doc = new DOMParser().parseFromString(text, "text/html");
  text = doc.body.textContent || "";
  text = text.replace(/\n{2,}/g, "\n\n"); //Keep sections
  return text.trim();
};

// 🛠️ Valideringsfunktion för recensioner
const isValidReview = (text: string) => {
  return /[a-zA-Z]{3,}/.test(text.trim()); //min 3 char
};

const DetailsPage = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const auth = useContext(AuthContext); //check if user is logged in
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  //reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [isReviewValid, setIsReviewValid] = useState(false);

  useEffect(() => {
    fetchBook();
    fetchReviews();
  }, [id]);

  useEffect(() => {
    setIsReviewValid(isValidReview(reviewText));//update valid-status everytime reviewText changes
  }, [reviewText]);

  const fetchBook = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getBookDetails(id);
      setBook(data);
    } catch (err) {
      setError("Could not get book information");
      console.error("Error fetching book details:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    if (!id) {
      console.error("Book ID is missing!");
      return;
    }

    try {
     
      const response = await axios.get(`https://bookify-api-nk6g.onrender.com/reviews/book/${id}`);
  
      if (response.status === 200) {
        setReviews(response.data);
      } 

    } catch (err:any) {
       if (err.response?.status === 404) {          
        setReviews([]); //set empty list
  } else {
    console.error("Error fetching reviews:", err);
  }
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth?.isLoggedIn) return;
  
    if (!isReviewValid) { 
      console.error("Review is invalid! It must contain at least 3 letters.");
      return;
    }
  
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://bookify-api-nk6g.onrender.com/reviews",
        {
          bookId: id,
          reviewText,
          rating,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      if (response.status === 201) {
        setReviewText("");
        setRating(5);
        setShowReviewForm(false);
        fetchReviews(); // Hämta nya recensioner efter inlämning
      }
    } catch (err) {
      console.error("Error submitting review:", err);
    }
  };
  

  const deleteReview = async (reviewId: string) => {
    if (!auth?.isLoggedIn) return;
  
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://bookify-api-nk6g.onrender.com/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      // Hämta recensionerna igen för att uppdatera listan
      fetchReviews();
    } catch (err) {
      console.error("Error deleting review:", err);
    }
  };
  
  



  if (loading) return <p>Loading book information...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!book) return <p>No bbok was found.</p>;

  return (
    <div className="details-container">
      <button onClick={() => navigate(-1)} className="back-button">← Go back</button>

      <h1>{book.volumeInfo.title}</h1>

      <p><strong>Author:</strong> {book.volumeInfo.authors?.join(", ") || "Unknown"}</p>

      {book.volumeInfo.imageLinks?.thumbnail && (
        <img src={book.volumeInfo.imageLinks.thumbnail} alt={book.volumeInfo.title} className="book-image" />
      )}

      <p className="book-description">
        {book.volumeInfo.description ? cleanText(book.volumeInfo.description) : "No description available."}
      </p>

      {/* Only show the review button if the user is logged in */}
      {auth?.isLoggedIn && (
        <>
          <button className="review-button" onClick={() => setShowReviewForm(!showReviewForm)}>
            {showReviewForm ? "Cancel" : "Write a Review"}
          </button>

          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="review-form">
              <textarea
                placeholder="Write your review here..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                required
              />
              {!isReviewValid && (
                <p style={{ color: "white", fontSize: "14px" }}>
                  Review must contain at least 3 letters and not just numbers or spaces.
                </p>
              )}

              <label>Rating:</label>

              <div className="rating-container">
                {[1, 2, 3, 4, 5].map((num) => (
                  <label key={num} className="rating-label">
                    <input
                      type="radio"
                      name="rating"
                      value={num}
                      checked={rating === num}
                      onChange={() => setRating(num)}
                    />
                    {num} ⭐
                  </label>
                ))}
              </div>

              <button type="submit" disabled={!isReviewValid}>Submit Review</button>


            </form>
          )}
        </>
      )}

      {/* Display reviews */}
      <div className="review-container">
      <h2>Reviews</h2>
      {reviews.length === 0 ? (
        <p>No reviews yet. Be the first to review! (You need to be logged in to leave a review)</p>
      ) : (
        <ul className="reviews-list">
          {reviews.map((review, index) => (
            <li key={review._id || index} className="review-item">
              <p><strong>{review.userId?.username || "Unknown User"}</strong> - {review.rating} ⭐</p>
              <p>{review.reviewText}</p>
              <p className="review-date">Posted on: {new Date(review.createdAt).toLocaleDateString()}</p>

              {/* Visa delete-knappen endast för användarens egna recensioner */}
              {auth?.user?.username === review.userId?.username && (
                <button className="delete-button" onClick={() => deleteReview(review._id)}>
                X 
                </button>
              )}
            </li>
          ))}

        </ul>
      )}
      </div>
    </div>
  );
}

export default DetailsPage
