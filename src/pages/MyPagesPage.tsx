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

      // Filtrera bort den raderade recensionen från state
      setReviews((prevReviews) => prevReviews.filter((review) => review._id !== reviewId));
    } catch (err) {
      console.error("Error deleting review:", err);
    }
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
            <p><strong>Your review:</strong> {review.reviewText}</p>
            <p><strong>Rating:</strong> {review.rating} ⭐</p>
            <p className="review-date">Posted on: {new Date(review.createdAt).toLocaleDateString()}</p>
            <button className="delete-button" onClick={() => deleteReview(review._id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyPagesPage;
