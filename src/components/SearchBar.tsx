import './SearchBar.css';
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
    const [query, setQuery] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedQuery = query.trim();

        if (trimmedQuery.length === 0) {
            setErrorMessage("Search cannot be empty.");
            return;
        }

        if (trimmedQuery.length < 3) {
            setErrorMessage("Search must be at least 3 characters.");
            return;
        }

        //Reset error if input is valid
        setErrorMessage(null);
        navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    };

    return (
        <div className="search-container">
            <form onSubmit={handleSearch} className='searchform'>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for a book or an author..."
                />

                {/* Show errormessage if exists */}
                {errorMessage && <p className="error-message">{errorMessage}</p>}

                <button type="submit">Search</button>
            </form>


        </div>
    );
};

export default SearchBar;
