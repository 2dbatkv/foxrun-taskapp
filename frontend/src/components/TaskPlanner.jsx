import React, { useState, useEffect } from 'react';
import { Plus, X, Edit2, Trash2, Archive } from 'lucide-react';
import Tile from './Tile';
import { tasksAPI, taskTemplatesAPI } from '../services/api';

const TaskPlanner = () => {
  const [tasks, setTasks] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const initialFormState = {
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    due_date: '',
    assignee: '',
    time_to_complete_minutes: '',
  };
  const [formData, setFormData] = useState(initialFormState);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    fetchTasks();
    fetchTemplates();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await tasksAPI.getAll();
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await taskTemplatesAPI.getAll();
      setTemplates(response.data.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleTemplateSelect = (templateId) => {
    if (!templateId) return;

    const template = templates.find(t => t.id === parseInt(templateId));
    if (template) {
      setFormData({
        ...formData,
        title: template.title,
        description: template.description || '',
        priority: template.priority,
        time_to_complete_minutes: template.time_to_complete_minutes?.toString() || '',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsedTime = parseInt(formData.time_to_complete_minutes, 10);

    if (Number.isNaN(parsedTime) || parsedTime <= 0) {
      setFormError('Time to complete must be a positive number of minutes.');
      return;
    }

    const payload = {
      ...formData,
      time_to_complete_minutes: parsedTime,
    };

    try {
      if (editingTask) {
        await tasksAPI.update(editingTask.id, payload);
      } else {
        await tasksAPI.create(payload);
      }
      fetchTasks();
      setFormSuccess(editingTask ? 'Task updated successfully.' : 'Task created successfully.');
      resetForm();
    } catch (error) {
      console.error('Error saving task:', error);
      setFormError('Unable to save task. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await tasksAPI.delete(id);
        fetchTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleArchive = async (id) => {
    if (window.confirm('Are you sure you want to archive this task?')) {
      try {
        await tasksAPI.archive(id);
        setFormSuccess('Task archived successfully.');
        fetchTasks();
        setTimeout(() => setFormSuccess(''), 3000);
      } catch (error) {
        console.error('Error archiving task:', error);
        setFormError('Unable to archive task. Please try again.');
      }
    }
  };

  const handleEdit = (task) => {
    setFormError('');
    setFormSuccess('');
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      assignee: task.assignee || '',
      time_to_complete_minutes: task.time_to_complete_minutes?.toString() || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingTask(null);
    setShowForm(false);
    setFormError('');
  };

  const openForm = () => {
    setFormError('');
    setFormSuccess('');
    setEditingTask(null);
    setFormData(initialFormState);
    setShowForm(true);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      todo: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.todo;
  };

  const formatTimeToComplete = (minutes) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  return (
    <Tile
      title="Task Planner"
      actions={
        <button
          onClick={() => (showForm ? resetForm() : openForm())}
          className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 flex items-center gap-1"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'New Task'}
        </button>
      }
    >
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 bg-gray-50 rounded-lg">
          {!editingTask && templates.length > 0 && (
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Use a Template (Optional)
              </label>
              <select
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="w-full p-2 border rounded"
                defaultValue=""
              >
                <option value="">-- Select a template to pre-fill --</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.title} ({template.category} - {template.time_to_complete_minutes}min)
                  </option>
                ))}
              </select>
            </div>
          )}
          <input
            type="text"
            placeholder="Task title"
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
            rows="3"
          />
          <div className="grid grid-cols-2 gap-2 mb-2">
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="p-2 border rounded"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="p-2 border rounded"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="mb-2">
            <label className="block text-sm text-gray-600 mb-1" htmlFor="dueDate">
              Due Date
            </label>
            <input
              id="dueDate"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          <input
            type="text"
            placeholder="Assignee (e.g., Aaron)"
            value={formData.assignee}
            onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
            className="w-full p-2 mb-2 border rounded"
          />
          <div className="mb-2">
            <label className="block text-sm text-gray-600 mb-1" htmlFor="timeToComplete">
              Time to Complete (minutes)
            </label>
            <input
              id="timeToComplete"
              type="number"
              min="1"
              step="1"
              value={formData.time_to_complete_minutes}
              onChange={(e) => setFormData({ ...formData, time_to_complete_minutes: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          {formError && <p className="text-sm text-red-600 mb-2">{formError}</p>}
          {formSuccess && <p className="text-sm text-green-600 mb-2">{formSuccess}</p>}
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
          >
            {editingTask ? 'Update Task' : 'Create Task'}
          </button>
        </form>
      )}

      {!showForm && formSuccess && (
        <p className="text-sm text-green-600 mb-3">{formSuccess}</p>
      )}

      <div className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No tasks yet. Create your first task!</p>
        ) : (
          [...tasks]
            .sort((a, b) => {
              // Sort order: todo, in_progress, cancelled, completed
              const statusOrder = { todo: 1, in_progress: 2, cancelled: 3, completed: 4 };
              return statusOrder[a.status] - statusOrder[b.status];
            })
            .map((task) => (
            <div
              key={task.id}
              className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800">{task.title}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(task)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit task"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleArchive(task.id)}
                    className="text-orange-500 hover:text-orange-700"
                    title="Archive task"
                  >
                    <Archive size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete task"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {task.description && (
                <p className="text-sm text-gray-600 mb-2">{task.description}</p>
              )}
              <div className="flex gap-2 flex-wrap">
                <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${getStatusColor(task.status)}`}>
                  {task.status.replace('_', ' ')}
                </span>
                {task.due_date && (
                  <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-800">
                    Due: {new Date(task.due_date).toLocaleDateString()}
                  </span>
                )}
                {task.assignee && (
                  <span className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-800">
                    Assignee: {task.assignee}
                  </span>
                )}
                {task.time_to_complete_minutes && (
                  <span className="text-xs px-2 py-1 rounded bg-teal-100 text-teal-800">
                    Time: {formatTimeToComplete(task.time_to_complete_minutes)}
                  </span>
                )}
              </div>
            </div>
            ))
        )}
      </div>
    </Tile>
  );
};

export default TaskPlanner;
