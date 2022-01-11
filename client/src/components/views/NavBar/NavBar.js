import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

function NavBar() {
  return (
    <div>
      {/* NavBar */}
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/login">Login</Link>
        </li>
        <li>
          <Link to="/register">Register</Link>
        </li>
      </ul>
    </div>
  );
}

export default NavBar;
