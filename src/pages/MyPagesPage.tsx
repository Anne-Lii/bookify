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
  //states
  const auth = useContext(AuthContext);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [books, setBooks] = useState<{ [key: string]: BookDetails }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //States for inline-editing
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editedReviewText, setEditedReviewText] = useState("");
  const [originalReviewText, setOriginalReviewText] = useState("");

  useEffect(() => {
    if (!auth?.isLoggedIn) return;

    const fetchReviewsAndBooks = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Unauthorized");
          return;
        }

        //get users reviews
        const userReviews = await fetchUserReviews(token);
        setReviews(userReviews);

        //get book information for every review
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

  //delete a review
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

  //start editing a review
  const startEditing = (review: Review) => {
    setEditingReviewId(review._id);
    setEditedReviewText(review.reviewText.replace(/\n/g, "<br>"));
    setOriginalReviewText(review.reviewText);
  };

  //save edited review
  const saveEditedReview = async (reviewId: string) => {
    if (!auth?.isLoggedIn) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await updateUserReview(reviewId, editedReviewText.replace(/<br>/g, "\n"), token);

      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review._id === reviewId ? { ...review, reviewText: editedReviewText.replace(/<br>/g, "\n") } : review
        )
      );

      setEditingReviewId(null);
    } catch (err) {
      console.error("Error updating review:", err);
    }
  };

  //cancel editmode
  const cancelEditing = () => {
    setEditedReviewText(originalReviewText);
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
