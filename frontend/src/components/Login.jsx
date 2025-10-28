import React, { useState } from 'react';
import { LogIn } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const validateCode = (input) => {
    // Pattern: 4 numbers followed by 3 letters (e.g., 1234AJB)
    const pattern = /^\d{4}[A-Za-z]{3}$/;
    return pattern.test(input);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateCode(code)) {
      setError('');
      onLogin(code);
    } else {
      setError('Invalid code format. Use: 4 numbers + 3 letters (e.g., 1234AJB)');
    }
  };

  const handleChange = (e) => {
    const value = e.target.value.toUpperCase();
    // Limit to 7 characters
    if (value.length <= 7) {
      setCode(value);
      setError('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
            <LogIn size={48} className="text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Fox Run Task Planner</h1>
          <p className="text-gray-600">Enter your access code to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
              Access Code
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={handleChange}
              placeholder="1234AJB"
              className="w-full px-4 py-3 text-center text-2xl font-mono border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase tracking-wider"
              autoComplete="off"
              autoFocus
            />
            <p className="mt-2 text-sm text-gray-500 text-center">
              Format: 4 numbers + 3 letters
            </p>
            {error && (
              <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold text-lg flex items-center justify-center gap-2"
          >
            <LogIn size={20} />
            Login
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Example codes: 1234AJB, 5678JDO, 9012SAM</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
