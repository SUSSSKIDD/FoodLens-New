import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CookHistoryPage = () => {
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/recipe/cooked/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data.history);
    } catch (err) {
      console.error(err);
      alert('Failed to load cook history');
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">🍽️ Cook History</h1>
      {history.length === 0 ? (
        <p className="text-center text-gray-500">You haven’t cooked any recipes yet.</p>
      ) : (
        <ul className="space-y-6">
          {history.map((item) => (
            <li key={item._id} className="bg-white border rounded shadow p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <span className="text-sm text-gray-400">
                  {new Date(item.cookedAt).toLocaleString()}
                </span>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-gray-800">{item.content}</pre>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CookHistoryPage;
