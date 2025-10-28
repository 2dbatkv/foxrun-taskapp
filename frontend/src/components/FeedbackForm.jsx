import React, { useState } from 'react';
import Tile from './Tile';
import { feedbackAPI } from '../services/api';

const categoryOptions = [
  'General Feedback',
  'Feature Request',
  'Bug Report',
  'Performance',
  'Other',
];

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'General Feedback',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validate = () => {
    if (!formData.category) {
      setError('Please select a feedback category.');
      return false;
    }
    if (!formData.message || formData.message.trim().length < 10) {
      setError('Feedback message must be at least 10 characters.');
      return false;
    }
    if (formData.message.length > 1000) {
      setError('Feedback message cannot exceed 1000 characters.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      await feedbackAPI.submit(formData);
      setSuccess('Thanks! Your feedback was sent successfully.');
      setFormData({
        name: '',
        email: '',
        category: 'General Feedback',
        message: '',
      });
    } catch (err) {
      setError('Unable to send feedback right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Tile
      title="Share Feedback"
      className="lg:col-span-1"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Name (optional)"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full p-2 border rounded"
          maxLength={120}
        />
        <input
          type="email"
          placeholder="Email (optional)"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full p-2 border rounded"
          required
        >
          {categoryOptions.map((option) => (
            <option value={option} key={option}>
              {option}
            </option>
          ))}
        </select>
        <textarea
          placeholder="How can we improve?"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full p-2 border rounded"
          rows={4}
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {submitting ? 'Sending...' : 'Send Feedback'}
        </button>
      </form>
    </Tile>
  );
};

export default FeedbackForm;
