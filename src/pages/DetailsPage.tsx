import './DetailsPage.css'
import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBookDetails } from "../services/googleBooksApi";
import { AuthContext } from '../context/AuthContext';
import { fetchReviews, submitReview, deleteReview } from "../services/apiService";

interface Book {
  volumeInfo: {
    title: string;//titel
    authors?: string[];//array with authors
    description?: string;//description of the book
    imageLinks?: {
      thumbnail?: string;//url picture
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


//Function to remove HTML tags and decode HTML entities in the description text for better readability.
const cleanText = (html: string) => {
  let text = html.replace(/<br\s*\/?>/g, "\n"); //Replace <br> tags with actual line breaks
  text = text.replace(/<[^>]+>/g, ""); //remove HTML-tags
  const doc = new DOMParser().parseFromString(text, "text/html");
  text = doc.body.textContent || "";
  text = text.replace(/\n{2,}/g, "\n\n"); //Keep sections
  return text.trim();
};

//validation for reviews
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
    fetchReviewsForBook();
  }, [id]);

  useEffect(() => {
    setIsReviewValid(isValidReview(reviewText));//updates the review's validity status whenever the review text changes.
  }, [reviewText]);

  const fetchBook = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);//Resets error state before making the request
      const data = await getBookDetails(id);
      setBook(data);
    } catch (err) {
      setError("Could not get book information");
      console.error("Error fetching book details:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewsForBook = async () => {
    if (!id) return;

    try {
      const reviewsData = await fetchReviews(id); //use `fetchReviews` from `reviewService.ts`
      setReviews(reviewsData);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
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
      const success = await submitReview(id!, reviewText, rating, token!);

      if (success) {
        setReviewText(""); //resets review input field
        setRating(5); //resets rating to default value
        setShowReviewForm(false); //Hide review form after successful submit
        fetchReviewsForBook(); //Refresh reviews
      }
    } catch (err) {
      console.error("Error submitting review:", err);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!auth?.isLoggedIn) return;

    try {
      const token = localStorage.getItem("token");
      await deleteReview(reviewId, token!);
      fetchReviewsForBook(); // Refresh after deletion
    } catch (err) {
      console.error("Error deleting review:", err);
    }
  };

  if (loading) return <p>Loading book information...</p>;
  if (error) return <p>{error}</p>;
  if (!book) return <p>No book was found.</p>;

  return (
    <div className="details-container">
      <button onClick={() => navigate(-1)} className="back-button">← Go back</button>

      <h1>{book.volumeInfo.title}</h1>

      <p><strong>Author:</strong> {book.volumeInfo.authors?.join(", ") || "Unknown"}</p>
      <p><strong>Published Date:</strong> {book.volumeInfo.publishedDate || "Unknown"}</p>
      <p><strong>Page Count:</strong> {book.volumeInfo.pageCount ? `${book.volumeInfo.pageCount} pages` : "N/A"}</p>

      {book.volumeInfo.imageLinks?.thumbnail && (
        <img src={book.volumeInfo.imageLinks.thumbnail} alt={book.volumeInfo.title} className="book-image" />
      )}

      <p className="book-description">
        {book.volumeInfo.description ? cleanText(book.volumeInfo.description) : "No description available."}
      </p>

      {/* REVIEWS */}

      {/* Only show the 'write a review' button if the user is logged in */}
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
                <p>
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
                <p><strong>{review.userId?.username || "Unknown User"}</strong></p>
                <p>  {review.rating} ⭐</p>
                <p>{review.reviewText}</p>
                <p className="review-date">Posted on: {new Date(review.createdAt).toLocaleDateString()} </p>

                {/* delete button only shows on users own reviews */}
                {auth?.user?.username === review.userId?.username && (
                  <button className="delete-button" onClick={() => handleDeleteReview(review._id)}>
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
