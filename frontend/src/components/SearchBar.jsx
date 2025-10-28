import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { searchAPI } from '../services/api';

const SearchBar = ({ onResults }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [useAI, setUseAI] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      let response;
      if (useAI) {
        response = await searchAPI.aiSearch(query);
      } else {
        response = await searchAPI.search(query);
      }
      onResults(response.data, useAI);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across tasks, calendar, reminders, knowledge base, and documents..."
            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
        </div>
        <button
          type="button"
          onClick={() => setUseAI(!useAI)}
          className={`px-4 py-2 rounded-lg border transition ${
            useAI
              ? 'bg-purple-500 text-white border-purple-500'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
          title={useAI ? 'Using AI Search' : 'Use AI Search'}
        >
          <Sparkles size={20} />
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      {useAI && (
        <p className="text-sm text-purple-600 mt-2 flex items-center gap-1">
          <Sparkles size={14} />
          AI-powered search enabled - Claude will analyze and summarize results
        </p>
      )}
    </div>
  );
};

export default SearchBar;
