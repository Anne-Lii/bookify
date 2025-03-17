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
  user: string;
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

  useEffect(() => {
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
        console.log("Fetching reviews for bookId:", id); //DEBUG!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    
        const response = await axios.get(`https://bookify-api-nk6g.onrender.com/reviews/book/${id}`);
    
        if (response.status === 200) {
          setReviews(response.data);
        } else {
          console.error("Unexpected response status:", response.status);
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    };

    fetchBook();
    fetchReviews();
  }, [id]);


  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth?.isLoggedIn) return;

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
        setReviews([...reviews, response.data]); // Update UI with the new review
        setReviewText(""); // Clear input fields
        setRating(5);
        setShowReviewForm(false);
      }
    } catch (err) {
      console.error("Error submitting review:", err);
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

              <button type="submit">Submit Review</button>

            </form>
          )}
        </>
      )}

      {/* Display reviews */}
      <h2>Reviews</h2>
      {reviews.length === 0 ? (
        <p>No reviews yet. Be the first to review!</p>
      ) : (
        <ul className="reviews-list">
          {reviews.map((review) => (
            <li key={review._id} className="review-item">
              <p><strong>{review.user}</strong>{review.rating} ⭐</p>
              <p>{review.reviewText}</p>
              <p className="review-date">Posted on: {new Date(review.createdAt).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DetailsPage
