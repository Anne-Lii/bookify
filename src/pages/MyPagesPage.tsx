import './MyPagesPage.css';
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { getBookDetails } from "../services/googleBooksApi";
import { fetchUserReviews, deleteUserReview, updateUserReview } from "../services/apiService";

interface Review {
  _id: string;
  bookId: string;
  reviewText: string;
  rating: number;
  createdAt: string;
}

interface BookDetails {
  title: string;
  authors?: string[];
  image?: string;
}

const MyPagesPage = () => {
  //States
  const auth = useContext(AuthContext);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [books, setBooks] = useState<{ [key: string]: BookDetails }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //States for inline-editing
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editedReviewText, setEditedReviewText] = useState("");
  const [editedRating, setEditedRating] = useState<number>(0);
  const [originalReviewText, setOriginalReviewText] = useState("");
  const [originalRating, setOriginalRating] = useState<number>(0);

  useEffect(() => {
    if (!auth?.isLoggedIn) return;

    const fetchReviewsAndBooks = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Unauthorized");
          return;
        }

        //Get user's reviews
        const userReviews = await fetchUserReviews(token);
        setReviews(userReviews);

        //Get book information for each review
        const bookData: { [key: string]: BookDetails } = {};
        await Promise.all(
          userReviews.map(async (review: Review) => {
            if (!bookData[review.bookId]) {
              const bookInfo = await getBookDetails(review.bookId);
              bookData[review.bookId] = {
                title: bookInfo.volumeInfo.title,
                authors: bookInfo.volumeInfo.authors,
                image: bookInfo.volumeInfo.imageLinks?.thumbnail,
              };
            }
          })
        );

        setBooks(bookData);
      } catch (err) {
        setError("You have no reviews yet.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviewsAndBooks();
  }, [auth?.isLoggedIn]);

  //Delete a review
  const deleteReview = async (reviewId: string) => {
    if (!auth?.isLoggedIn) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await deleteUserReview(reviewId, token);
      setReviews((prevReviews) => prevReviews.filter((review) => review._id !== reviewId));
    } catch (err) {
      console.error("Error deleting review:", err);
    }
  };

  //Start edit-mode 
  const startEditing = (review: Review) => {
    setEditingReviewId(review._id);
    setEditedReviewText(review.reviewText.replace(/\n/g, "<br>"));
    setEditedRating(review.rating);
    setOriginalReviewText(review.reviewText);
    setOriginalRating(review.rating);
  };

  //Save edited review and rating
  const saveEditedReview = async (reviewId: string) => {
    if (!auth?.isLoggedIn) return;

    try {
      const token = localStorage.getItem("token") ?? "";
      if (!token) {
        console.error("No token found, user might not be logged in.");
        return;
      }

      await updateUserReview(reviewId, editedReviewText.replace(/<br>/g, "\n"), editedRating, token);

      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review._id === reviewId
            ? { ...review, reviewText: editedReviewText.replace(/<br>/g, "\n"), rating: editedRating }
            : review
        )
      );

      setEditingReviewId(null);
    } catch (err) {
      console.error("Error updating review:", err);
    }
  };

  //Cancel editing
  const cancelEditing = () => {
    setEditedReviewText(originalReviewText);
    setEditedRating(originalRating);
    setEditingReviewId(null);
  };

  if (!auth?.isLoggedIn) {
    return <p>You need to be logged in to see this page.</p>;
  }

  if (loading) return <p>Loading your reviews...</p>;
  if (error) return <p>{error}</p>;
  if (reviews.length === 0) return <p>You haven't written any reviews yet.</p>;

  return (
    <div className='container-myReviews'>
      <h1>My Reviews</h1>
      <ul>
        {reviews.map((review) => (
          <li key={review._id} className="review-item">
            <h3>{books[review.bookId]?.title || "Unknown Title"}</h3>
            <p><strong>Author:</strong> {books[review.bookId]?.authors?.join(", ") || "Unknown"}</p>
            {books[review.bookId]?.image && (
              <img src={books[review.bookId]?.image} alt={books[review.bookId]?.title} className="book-image" />
            )}

            {editingReviewId === review._id ? (
              <>
                <p
                  className="editable-text"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => setEditedReviewText(e.currentTarget.innerText.trim())}
                  dangerouslySetInnerHTML={{ __html: editedReviewText }}
                ></p>

                {/* Dropdown to change rating */}
                <div>
                  <label><strong>Rating:</strong></label>
                  <select
                    value={editedRating}
                    onChange={(e) => setEditedRating(Number(e.target.value))}
                    className="rating-dropdown"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>{num} ⭐</option>
                    ))}
                  </select>
                </div>

                <button className="save-button" onClick={() => saveEditedReview(review._id)}>Save</button>
                <button className="cancel-button" onClick={cancelEditing}>Cancel</button>
              </>
            ) : (
              <>
                <p>{review.reviewText}</p>
                <p><strong>Rating:</strong> {review.rating} ⭐</p>
                <p className="review-date">Posted on: {new Date(review.createdAt).toLocaleDateString()}</p>

                <button className="edit-button" onClick={() => startEditing(review)}>Edit</button>
                <button className="delete-button" onClick={() => deleteReview(review._id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyPagesPage;
