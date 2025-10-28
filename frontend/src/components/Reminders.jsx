import React, { useState, useEffect } from 'react';
import { Plus, X, Edit2, Trash2, Bell, Check } from 'lucide-react';
import Tile from './Tile';
import { remindersAPI } from '../services/api';

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const initialFormState = {
    title: '',
    description: '',
    remind_at: '',
    is_active: true,
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const response = await remindersAPI.getUpcoming();
      setReminders(response.data);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.title.trim()) {
      setFormError('Reminder title is required.');
      return;
    }

    const remindTime = new Date(formData.remind_at);
    if (Number.isNaN(remindTime.getTime())) {
      setFormError('Please provide a valid reminder date and time.');
      return;
    }

    try {
      if (editingReminder) {
        await remindersAPI.update(editingReminder.id, formData);
      } else {
        await remindersAPI.create(formData);
      }
      fetchReminders();
      setFormSuccess(editingReminder ? 'Reminder updated successfully.' : 'Reminder created successfully.');
      resetForm();
    } catch (error) {
      console.error('Error saving reminder:', error);
      setFormError('Unable to save reminder. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      try {
        await remindersAPI.delete(id);
        fetchReminders();
      } catch (error) {
        console.error('Error deleting reminder:', error);
      }
    }
  };

  const handleComplete = async (reminder) => {
    try {
      await remindersAPI.update(reminder.id, { is_completed: true });
      fetchReminders();
    } catch (error) {
      console.error('Error completing reminder:', error);
      setFormError('Unable to mark reminder as completed.');
    }
  };

  const handleEdit = (reminder) => {
    setFormError('');
    setFormSuccess('');
    setEditingReminder(reminder);
    setFormData({
      title: reminder.title,
      description: reminder.description || '',
      remind_at: reminder.remind_at.slice(0, 16),
      is_active: reminder.is_active,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingReminder(null);
    setShowForm(false);
    setFormError('');
  };

  const openForm = () => {
    setFormError('');
    setFormSuccess('');
    setEditingReminder(null);
    setFormData(initialFormState);
    setShowForm(true);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const isOverdue = (dateString) => {
    return new Date(dateString) < new Date();
  };

  return (
    <Tile
      title="Reminders"
      actions={
        <button
          onClick={() => (showForm ? resetForm() : openForm())}
          className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 flex items-center gap-1"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'New Reminder'}
        </button>
      }
    >
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 bg-gray-50 rounded-lg">
          <input
            type="text"
            placeholder="Reminder title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full p-2 mb-2 border rounded"
            required
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-2 mb-2 border rounded"
            rows="2"
          />
          <div className="mb-2">
            <label className="block text-sm text-gray-600 mb-1">Remind At</label>
            <input
              type="datetime-local"
              value={formData.remind_at}
              onChange={(e) => setFormData({ ...formData, remind_at: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm">Active</span>
          </label>
          {formError && <p className="text-sm text-red-600 mb-2">{formError}</p>}
          {formSuccess && <p className="text-sm text-green-600 mb-2">{formSuccess}</p>}
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
          >
            {editingReminder ? 'Update Reminder' : 'Create Reminder'}
          </button>
        </form>
      )}

      {!showForm && formSuccess && (
        <p className="text-sm text-green-600 mb-3">{formSuccess}</p>
      )}

      <div className="space-y-2">
        {reminders.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No active reminders</p>
        ) : (
          reminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`p-3 rounded-lg border hover:shadow-md transition ${
                isOverdue(reminder.remind_at)
                  ? 'bg-red-50 border-red-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-start gap-2 flex-1">
                  <Bell
                    size={16}
                    className={`mt-1 ${isOverdue(reminder.remind_at) ? 'text-red-500' : 'text-blue-500'}`}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{reminder.title}</h3>
                    {reminder.description && (
                      <p className="text-sm text-gray-600 mt-1">{reminder.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {formatDateTime(reminder.remind_at)}
                      {isOverdue(reminder.remind_at) && (
                        <span className="ml-2 text-red-600 font-semibold">OVERDUE</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleComplete(reminder)}
                    className="text-green-500 hover:text-green-700"
                    title="Mark as completed"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => handleEdit(reminder)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(reminder.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Tile>
  );
};

export default Reminders;
