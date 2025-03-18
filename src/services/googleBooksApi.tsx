import axios from "axios";

const API_BASE_URL = "https://www.googleapis.com/books/v1/volumes";

export const searchBooks = async (query: string, maxResults = 20) => {
    try {
        const response = await axios.get(`${API_BASE_URL}?q=${query}&maxResults=${maxResults}`);
        return response.data.items || [];
    } catch (error) {
        console.error("Error fetching books:", error);
        return [];
    }
};

export const getBookDetails = async (bookId: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${bookId}`);
        return response.data || null;
    } catch (error) {
        console.error("Error fetching book details:", error);
        return null;
    }
};
