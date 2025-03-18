import './SearchResultPage.css'
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { searchBooks } from "../services/googleBooksApi";

interface Book {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    imageLinks?: {
      thumbnail?: string;
    };
  };
}


const SearchResultPage = () => {

  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const navigate = useNavigate();
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      if (!query) return;

      try {
        setLoading(true);
        setError(null);
        const books = await searchBooks(query);
        setResults(books);
      } catch (err) {
        setError("Colud not get search results.");
        console.error("Error fetching books:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [query]);
  
  return (
    <div className='searchresult-main'>
      <h1>Search result for: {query}</h1>

      {/* Back to Home Button */}
      <button className="back-button" onClick={() => navigate("/")}>
        Go back
      </button>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && results.length === 0 && <p>No books were found.</p>}

      <ul className="searchResults">
        {results.map((book) => (
          <li key={book.id} className="searchResultItem">
            <Link to={`/book/${book.id}`} className="searchResultLink">
              <h2>{book.volumeInfo.title}</h2>
              <p>{book.volumeInfo.authors?.join(", ") || "Unknown author"}</p>
              {book.volumeInfo.imageLinks?.thumbnail && (
                <img src={book.volumeInfo.imageLinks.thumbnail} alt={book.volumeInfo.title} />
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SearchResultPage;