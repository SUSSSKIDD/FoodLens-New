import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from "../context/AuthContext";
import { auth, provider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import DarkModeToggle from '../components/DarkModeToggle';
import LogoutButton from '../components/LogoutButton';
import HomeButton from '../components/HomeButton';

const LoginPage = () => {
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '' });
  const [isSignup, setIsSignup] = useState(false);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSignupChange = (e) => setSignupForm({ ...signupForm, [e.target.name]: e.target.value });

  const handleEmailLogin = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      login(res.data.token);
      navigate('/camera');
    } catch (err) {
      alert('Invalid credentials');
    }
  };

  const handleSignup = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', signupForm);
      alert('User registered successfully! Please login with your credentials.');
      setIsSignup(false); // Switch to login form
      setForm({ email: signupForm.email, password: signupForm.password }); // Pre-fill login form
    } catch (err) {
      alert('Signup failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const res = await axios.post('http://localhost:5000/api/auth/google-login', { idToken });
      login(res.data.token);
      navigate('/camera');
    } catch (err) {
      console.error(err);
      alert('Google login failed');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="flex justify-between items-center mb-4 w-full max-w-md">
        {user && (
          <h1 className="text-2xl font-bold">
            {greeting}, {user.name}! 🌱
          </h1>
        )}
        <div className="flex items-center gap-2">
          <DarkModeToggle />
          {user && <HomeButton />}
          {user && <LogoutButton />}
        </div>
      </div>
      <h1 className="text-3xl font-bold mb-4">👋 Welcome to FoodLens</h1>

      {isSignup ? (
        <div>
          <h2 className="text-xl font-semibold mb-2">Signup</h2>
          <input
            name="name"
            value={signupForm.name}
            onChange={handleSignupChange}
            placeholder="Name"
            className="border p-2 m-2 w-72"
          />
          <input
            name="email"
            value={signupForm.email}
            onChange={handleSignupChange}
            placeholder="Email"
            className="border p-2 m-2 w-72"
          />
          <input
            type="password"
            name="password"
            value={signupForm.password}
            onChange={handleSignupChange}
            placeholder="Password"
            className="border p-2 m-2 w-72"
          />
          <button onClick={handleSignup} className="bg-purple-500 text-white px-4 py-2 m-2 rounded">
            Signup
          </button>
          <button onClick={() => setIsSignup(false)} className="text-blue-500 underline">
            Already have an account? Login
          </button>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-2">Login</h2>
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
          <button onClick={() => setIsSignup(true)} className="text-blue-500 underline">
            New user? Signup
          </button>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
