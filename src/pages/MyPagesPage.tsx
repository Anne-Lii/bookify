import './MyPagesPage.css'

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { getBookDetails } from "../services/googleBooksApi";

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
  const auth = useContext(AuthContext);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [books, setBooks] = useState<{ [key: string]: BookDetails }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //states for inline-editing
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editedReviewText, setEditedReviewText] = useState("");
  const [originalReviewText, setOriginalReviewText] = useState("");

  useEffect(() => {
    if (!auth?.isLoggedIn) return;

    const fetchUserReviews = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("https://bookify-api-nk6g.onrender.com/reviews/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          setReviews(response.data);
          
          //get book information for every review
          const bookData: { [key: string]: BookDetails } = {};
          await Promise.all(
            response.data.map(async (review: Review) => {
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
        }
      } catch (err) {
        setError("Could not fetch your reviews.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserReviews();
  }, [auth?.isLoggedIn]);

  //function to delete a review from my pages
  const deleteReview = async (reviewId: string) => {
    if (!auth?.isLoggedIn) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://bookify-api-nk6g.onrender.com/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      //remove the deleted review from state
      setReviews((prevReviews) => prevReviews.filter((review) => review._id !== reviewId));
    } catch (err) {
      console.error("Error deleting review:", err);
    }
  };

  //function to start editing a review
  const startEditing = (review: Review) => {
    setEditingReviewId(review._id);
    setEditedReviewText(review.reviewText.replace(/\n/g, "<br>"));
    setOriginalReviewText(review.reviewText);
  };
  

  //function to save changed review
  const saveEditedReview = async (reviewId: string) => {
    if (!auth?.isLoggedIn) return;
  
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://bookify-api-nk6g.onrender.com/reviews/${reviewId}`,
        { reviewText: editedReviewText.replace(/<br>/g, "\n") }, //convert back to newline
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      //Update state
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review._id === reviewId ? { ...review, reviewText: editedReviewText.replace(/<br>/g, "\n") } : review
        )
      );
  
      //close edit mode
      setEditingReviewId(null);
    } catch (err) {
      console.error("Error updating review:", err);
    }
  };
  

  //function to cancel editing and restore original text
  const cancelEditing = () => {
    setEditedReviewText(originalReviewText); //restores original text
    setEditingReviewId(null); //close editmode
  };


  if (!auth?.isLoggedIn) {
    return <p>You need to be logged in to see this page.</p>;
  }

  if (loading) return <p>Loading your reviews...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
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

            {/* if user is editing this review, show editmode */}
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
                <p> {review.reviewText}</p>
                <p><strong>Rating:</strong> {review.rating} ⭐</p>
                <p className="review-date">Posted on: {new Date(review.createdAt).toLocaleDateString()}</p>

                {/* Edit and Delete-buttons */}
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
