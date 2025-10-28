import React, { useState, useEffect } from 'react';
import { Plus, X, Edit2, Trash2, Book, Tag } from 'lucide-react';
import Tile from './Tile';
import { knowledgeAPI } from '../services/api';

const KnowledgeBase = () => {
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [expandedEntry, setExpandedEntry] = useState(null);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const initialFormState = {
    title: '',
    content: '',
    category: '',
    tags: '',
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await knowledgeAPI.getAll();
      setEntries(response.data);
    } catch (error) {
      console.error('Error fetching knowledge entries:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.title.trim()) {
      setFormError('Title is required.');
      return;
    }

    if (!formData.content || formData.content.trim().length < 20) {
      setFormError('Content must be at least 20 characters.');
      return;
    }

    try {
      if (editingEntry) {
        await knowledgeAPI.update(editingEntry.id, formData);
      } else {
        await knowledgeAPI.create(formData);
      }
      fetchEntries();
      setFormSuccess(editingEntry ? 'Entry updated successfully.' : 'Entry created successfully.');
      resetForm();
    } catch (error) {
      console.error('Error saving knowledge entry:', error);
      setFormError('Unable to save entry. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await knowledgeAPI.delete(id);
        fetchEntries();
      } catch (error) {
        console.error('Error deleting knowledge entry:', error);
      }
    }
  };

  const handleEdit = (entry) => {
    setFormError('');
    setFormSuccess('');
    setEditingEntry(entry);
    setFormData({
      title: entry.title,
      content: entry.content,
      category: entry.category || '',
      tags: entry.tags || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingEntry(null);
    setShowForm(false);
    setFormError('');
  };

  const openForm = () => {
    setFormError('');
    setFormSuccess('');
    setEditingEntry(null);
    setFormData(initialFormState);
    setShowForm(true);
  };

  const toggleExpand = (id) => {
    setExpandedEntry(expandedEntry === id ? null : id);
  };

  return (
    <Tile
      title="Knowledge Base"
      actions={
        <button
          onClick={() => (showForm ? resetForm() : openForm())}
          className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 flex items-center gap-1"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'New Entry'}
        </button>
      }
    >
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 bg-gray-50 rounded-lg">
          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full p-2 mb-2 border rounded"
            required
          />
          <textarea
            placeholder="Content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full p-2 mb-2 border rounded"
            rows="4"
            required
          />
          <input
            type="text"
            placeholder="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full p-2 mb-2 border rounded"
          />
          <input
            type="text"
            placeholder="Tags (comma-separated)"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="w-full p-2 mb-2 border rounded"
          />
          {formError && <p className="text-sm text-red-600 mb-2">{formError}</p>}
          {formSuccess && <p className="text-sm text-green-600 mb-2">{formSuccess}</p>}
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
          >
            {editingEntry ? 'Update Entry' : 'Create Entry'}
          </button>
        </form>
      )}

      {!showForm && formSuccess && (
        <p className="text-sm text-green-600 mb-3">{formSuccess}</p>
      )}

      <div className="space-y-2">
        {entries.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No knowledge entries yet</p>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-2">
                <div
                  className="flex items-start gap-2 flex-1 cursor-pointer"
                  onClick={() => toggleExpand(entry.id)}
                >
                  <Book size={16} className="text-blue-500 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{entry.title}</h3>
                    {entry.category && (
                      <span className="inline-block mt-1 text-xs px-2 py-1 rounded bg-purple-100 text-purple-800">
                        {entry.category}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(entry)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {expandedEntry === entry.id ? (
                <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                  {entry.content}
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  {entry.content.slice(0, 100)}
                  {entry.content.length > 100 && '... (click to expand)'}
                </p>
              )}

              {entry.tags && (
                <div className="mt-2 flex items-center gap-1 flex-wrap">
                  <Tag size={12} className="text-gray-400" />
                  {entry.tags.split(',').map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Tile>
  );
};

export default KnowledgeBase;
