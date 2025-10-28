import React, { useState, useEffect } from 'react';
import { Plus, X, Edit2, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import Tile from './Tile';
import { calendarAPI } from '../services/api';

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const initialFormState = {
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
    all_day: false,
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await calendarAPI.getAll();
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.title.trim()) {
      setFormError('Event title is required.');
      return;
    }

    const start = new Date(formData.start_time);
    const end = new Date(formData.end_time);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      setFormError('Please provide valid start and end times.');
      return;
    }

    if (end <= start) {
      setFormError('End time must be after start time.');
      return;
    }

    try {
      if (editingEvent) {
        await calendarAPI.update(editingEvent.id, formData);
      } else {
        await calendarAPI.create(formData);
      }
      fetchEvents();
      setFormSuccess(editingEvent ? 'Event updated successfully.' : 'Event created successfully.');
      resetForm();
    } catch (error) {
      console.error('Error saving event:', error);
      setFormError('Unable to save event. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await calendarAPI.delete(id);
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const handleEdit = (event) => {
    setFormError('');
    setFormSuccess('');
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      start_time: event.start_time.slice(0, 16),
      end_time: event.end_time.slice(0, 16),
      location: event.location || '',
      all_day: event.all_day,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingEvent(null);
    setShowForm(false);
    setFormError('');
  };

  const openForm = () => {
    setFormError('');
    setFormSuccess('');
    setEditingEvent(null);
    setFormData(initialFormState);
    setShowForm(true);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return events
      .filter(event => new Date(event.start_time) >= now)
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
      .slice(0, 10);
  };

  return (
    <Tile
      title="Calendar"
      actions={
        <button
          onClick={() => (showForm ? resetForm() : openForm())}
          className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 flex items-center gap-1"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'New Event'}
        </button>
      }
    >
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 bg-gray-50 rounded-lg">
          <input
            type="text"
            placeholder="Event title"
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
          <input
            type="text"
            placeholder="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full p-2 mb-2 border rounded"
          />
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Start Time</label>
              <input
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">End Time</label>
              <input
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={formData.all_day}
              onChange={(e) => setFormData({ ...formData, all_day: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm">All Day Event</span>
          </label>
          {formError && <p className="text-sm text-red-600 mb-2">{formError}</p>}
          {formSuccess && <p className="text-sm text-green-600 mb-2">{formSuccess}</p>}
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
          >
            {editingEvent ? 'Update Event' : 'Create Event'}
          </button>
        </form>
      )}

      {!showForm && formSuccess && (
        <p className="text-sm text-green-600 mb-3">{formSuccess}</p>
      )}

      <div className="space-y-2">
        {getUpcomingEvents().length === 0 ? (
          <p className="text-gray-500 text-center py-4">No upcoming events</p>
        ) : (
          getUpcomingEvents().map((event) => (
            <div
              key={event.id}
              className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-start gap-2">
                  <CalendarIcon size={16} className="text-blue-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-800">{event.title}</h3>
                    {event.location && (
                      <p className="text-sm text-gray-600">{event.location}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(event)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {event.description && (
                <p className="text-sm text-gray-600 mb-2">{event.description}</p>
              )}
              <div className="text-xs text-gray-500">
                <div>Start: {formatDateTime(event.start_time)}</div>
                <div>End: {formatDateTime(event.end_time)}</div>
              </div>
              {event.all_day && (
                <span className="inline-block mt-2 text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-800">
                  All Day
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </Tile>
  );
};

export default Calendar;
