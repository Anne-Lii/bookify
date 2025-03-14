import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getBookDetails } from "../services/googleBooksApi";

const DetailsPage = () => {

  const { id } = useParams();
  const [book, setBook] = useState<any>(null);

  useEffect(() => {
      const fetchBook = async () => {
          if (!id) return;
          const data = await getBookDetails(id);
          setBook(data);
      };
      fetchBook();
  }, [id]);

  if (!book) return <p>Laddar bokinformation...</p>;

  return (
    <>
      <h1>{book.volumeInfo.title}</h1>
      <p>Författare: {book.volumeInfo.authors?.join(", ")}</p>
            <img src={book.volumeInfo.imageLinks?.thumbnail} alt={book.volumeInfo.title} />
            <p>{book.volumeInfo.description}</p>
    </>
  )
}

export default DetailsPage
