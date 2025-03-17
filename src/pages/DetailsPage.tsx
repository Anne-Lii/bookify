import './DetailsPage.css'
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBookDetails } from "../services/googleBooksApi";

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
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

    fetchBook();
  }, [id]);

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
    </div>
  );
}

export default DetailsPage
