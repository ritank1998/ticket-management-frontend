import { useState } from 'react';
import "../App.css";

const Navbarlogin = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(true); // Assume the user is logged in initially

    const handleLogout = () => {
        // Clear the token from sessionStorage or perform any other logout operations
        sessionStorage.removeItem('token');
        // Update the isLoggedIn state to false
        setIsLoggedIn(false);
        // Redirect the user to the login page or perform any other desired action
        window.location.replace('/login');
    };

    return (
        <>
            <nav className="navbar navbar-light">
                <div className="container-fluid">
                    <a className="navbar-brand" href="#">
                        <span className="head">Ticket's Metrix</span>
                    </a>
                    {isLoggedIn && (
                        <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
                    )}
                </div>
            </nav>
        </>
    );
};

export default Navbarlogin;
