import axios from 'axios';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/useUser'; // Import useUser hook

const Logout: React.FC = () => {
  const { setToken, setUser } = useUser(); // Use the context to manage the token and user state
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await axios.post('http://localhost:5001/api/logout', {}, {
        withCredentials: true,
      });
      
      localStorage.removeItem('authToken');
      
      setToken(null);
      setUser(null);

      console.log('Logout successful:', response.data);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Logout error');
    }
  };

  return (
    <button onClick={handleLogout} className='flex justify-between items-center w-2/3'>
      <span>Odhlásit se</span>
      <i className="fa-solid fa-arrow-right-from-bracket"></i>
    </button>
  );
}

export default Logout;
