import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from "../context/AuthContext";
import { auth, provider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import DarkModeToggle from '../components/DarkModeToggle';

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleEmailLogin = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      login(res.data.token);
      navigate('/home');
    } catch (err) {
      alert('Invalid credentials');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const res = await axios.post('http://localhost:5000/api/auth/google-login', { idToken });
      login(res.data.token);
      navigate('/home');
    } catch (err) {
      console.error(err);
      alert('Google login failed');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="flex justify-end mb-4 w-full max-w-md">
        <DarkModeToggle />
      </div>
      <h1 className="text-3xl font-bold mb-4">👋 Welcome to FoodLens</h1>

      <input
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
        className="border p-2 m-2 w-72"
      />
      <input
        type="password"
        name="password"
        value={form.password}
        onChange={handleChange}
        placeholder="Password"
        className="border p-2 m-2 w-72"
      />
      <button onClick={handleEmailLogin} className="bg-green-500 text-white px-4 py-2 m-2 rounded">
        Login with Email
      </button>

      <button
        onClick={handleGoogleLogin}
        className="bg-blue-600 text-white px-4 py-2 rounded m-2"
      >
        Sign in with Google
      </button>
    </div>
  );
};

export default LoginPage;
