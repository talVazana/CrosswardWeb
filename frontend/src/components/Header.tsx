import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <div className="font-bold text-xl">
        <Link to="/">Crossward</Link>
      </div>
      <nav className="flex space-x-4 space-x-reverse">
        <Link to="/" className="hover:underline ml-4">Rooms</Link>
        <Link to="/admin" className="hover:underline">Admin</Link>
      </nav>
    </header>
  );
};

export default Header;
