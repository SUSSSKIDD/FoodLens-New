// src/pages/CameraPage.jsx
import React, { useState, useRef, useEffect, useContext } from 'react';
import ImageUploader from '../components/ImageUploader';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DarkModeToggle from '../components/DarkModeToggle';
import { AuthContext } from "../context/AuthContext";
import LogoutButton from '../components/LogoutButton';
import SavedRecipesButton from '../components/SavedRecipesButton';

const CameraPage = () => {
  const { user } = useContext(AuthContext);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  const [image, setImage] = useState(null);
  const [detections, setDetections] = useState([]);
  const imageRef = useRef();
  const [imgDims, setImgDims] = useState({ width: 640, height: 640 });
  const navigate = useNavigate();

  const handleImageChange = (file) => {
    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);
    detectVegetables(file);
  };

  useEffect(() => {
    if (imageRef.current) {
      const { width, height } = imageRef.current.getBoundingClientRect();
      setImgDims({ width, height });
    }
  }, [image]);

  const detectVegetables = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post('http://localhost:5000/api/detect', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setDetections(res.data.detected);
    } catch (err) {
      console.error('Detection error:', err);
      alert('Failed to detect vegetables.');
    }
  };

  const handleContinue = () => {
    navigate('/recipe', { state: { detectedVeggies: detections } });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="flex justify-between items-center mb-4 w-full max-w-md">
        <h1 className="text-2xl font-bold">
          {greeting}, {user.name}! 🌱
        </h1>
        <div className="flex items-center gap-2">
          <DarkModeToggle />
          <SavedRecipesButton />
          <LogoutButton />
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-4">🥕 Detect Vegetables</h2>    
      <ImageUploader onImageSelected={handleImageChange} />

      {image && (
        <div className="relative inline-block mt-4">
          <img
            ref={imageRef}
            src={image}
            alt="Uploaded"
            className="max-w-full border"
            onLoad={() => {
              const { width, height } = imageRef.current.getBoundingClientRect();
              setImgDims({ width, height });
            }}
          />
        </div>
      )}

      {detections.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold">Detected Vegetables:</h3>
          <ul className="mb-4">
            {detections.map((det, idx) => (
              <li key={idx}>
                ✅ {det.label} ({det.confidence}%)
              </li>
            ))}
          </ul>

          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={handleContinue}
          >
            Next: Generate Recipe
          </button>
        </div>
      )}
    </div>
  );
};

export default CameraPage;
