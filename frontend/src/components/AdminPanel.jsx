import React, { useEffect, useLayoutEffect, useState, useRef } from 'react';
import TileLayout from './TileLayout';
import Tile from './Tile';
import TaskPlanner from './TaskPlanner';
import Calendar from './Calendar';
import Reminders from './Reminders';
import KnowledgeBase from './KnowledgeBase';
import Documents from './Documents';
import ChatInterface from './ChatInterface';
import FeedbackForm from './FeedbackForm';
import { adminAPI, feedbackAPI, taskTemplatesAPI } from '../services/api';

const LoginAttemptsTile = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getLoginAttempts();
      setAttempts(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load login activity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, []);

  const formatTimestamp = (timestamp) => new Date(timestamp).toLocaleString();

  return (
    <Tile
      title="Login Activity"
      className="lg:col-span-3"
      actions={
        <button
          onClick={fetchAttempts}
          className="text-blue-500 hover:text-blue-700 text-sm"
          type="button"
        >
          Refresh
        </button>
      }
    >
      {loading ? (
        <p className="text-gray-500">Loading login records...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : attempts.length === 0 ? (
        <p className="text-gray-500">No login attempts recorded yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2 pr-4">Time</th>
                <th className="py-2 pr-4">Password</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Result</th>
                <th className="py-2 pr-4">Client IP</th>
                <th className="py-2 pr-4">Reason</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((attempt) => (
                <tr key={attempt.id} className="border-t border-gray-200">
                  <td className="py-2 pr-4 whitespace-nowrap">
                    {formatTimestamp(attempt.created_at)}
                  </td>
                  <td className="py-2 pr-4 font-mono">
                    {attempt.code_label || attempt.submitted_code}
                  </td>
                  <td className="py-2 pr-4 uppercase text-gray-700">
                    {attempt.code_role || 'n/a'}
                  </td>
                  <td className="py-2 pr-4">
                    {attempt.success ? (
                      <span className="text-green-600 font-semibold">Success</span>
                    ) : (
                      <span className="text-red-600 font-semibold">Failed</span>
                    )}
                  </td>
                  <td className="py-2 pr-4 font-mono text-gray-500">
                    {attempt.client_ip || '—'}
                  </td>
                  <td className="py-2 pr-4 text-gray-500">
                    {attempt.failure_reason || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Tile>
  );
};

const FeedbackListTile = () => {
  const [feedbackReports, setFeedbackReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await feedbackAPI.getAll();
      setFeedbackReports(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load feedback submissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeedback = async (id) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;
    try {
      await feedbackAPI.delete(id);
      setSuccessMessage('Feedback deleted successfully!');
      fetchFeedback();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to delete feedback.');
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  return (
    <Tile
      title="User Feedback"
      className="lg:col-span-3"
      actions={
        <button
          onClick={fetchFeedback}
          className="text-blue-500 hover:text-blue-700 text-sm"
          type="button"
        >
          Refresh
        </button>
      }
    >
      {loading ? (
        <p className="text-gray-500">Loading feedback...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div>
          {successMessage && (
            <div className="mb-3 p-2 bg-green-100 text-green-700 rounded text-sm">
              {successMessage}
            </div>
          )}
          {feedbackReports.length === 0 ? (
            <p className="text-gray-500">No feedback submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {feedbackReports.map((item) => (
                <div key={item.id} className="p-3 border border-gray-200 rounded-md bg-white shadow-sm">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{item.category}</p>
                      <p className="text-xs text-gray-500">
                        {item.name || 'Anonymous'}
                        {item.email ? ` · ${item.email}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(item.created_at).toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleDeleteFeedback(item.id)}
                        className="text-red-600 hover:text-red-800 text-xs"
                        type="button"
                        title="Delete feedback"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{item.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Tile>
  );
};

const TeamManagementTile = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getTeamMembers();
      setTeamMembers(response.data.team || []);
      setError(null);
    } catch (err) {
      setError('Failed to load team members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const handleAddMember = () => {
    setTeamMembers([
      ...teamMembers,
      { name: '', daily_capacity_minutes: 480, role: 'Family Member' },
    ]);
  };

  const handleUpdateMember = (index, field, value) => {
    const updated = [...teamMembers];
    if (field === 'daily_capacity_minutes') {
      updated[index][field] = parseInt(value, 10) || 0;
    } else {
      updated[index][field] = value;
    }
    setTeamMembers(updated);
  };

  const handleDeleteMember = (index) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage('');
      await adminAPI.updateTeamMembers({ team: teamMembers });
      setSuccessMessage('Team members updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to save team members. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Tile
      title="Team Management"
      className="lg:col-span-3"
      actions={
        <div className="flex gap-2">
          <button
            onClick={handleAddMember}
            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
            type="button"
          >
            Add Member
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 ${
              saving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            type="button"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      }
    >
      {loading ? (
        <p className="text-gray-500">Loading team members...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div>
          {successMessage && (
            <div className="mb-3 p-2 bg-green-100 text-green-700 rounded text-sm">
              {successMessage}
            </div>
          )}
          {teamMembers.length === 0 ? (
            <p className="text-gray-500">No team members yet. Click "Add Member" to get started.</p>
          ) : (
            <div className="space-y-2">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row gap-2 p-3 border border-gray-200 rounded-md bg-white"
                >
                  <input
                    type="text"
                    placeholder="Name"
                    value={member.name}
                    onChange={(e) => handleUpdateMember(index, 'name', e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Capacity (minutes)"
                    value={member.daily_capacity_minutes}
                    onChange={(e) => handleUpdateMember(index, 'daily_capacity_minutes', e.target.value)}
                    className="w-full md:w-40 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Role"
                    value={member.role}
                    onChange={(e) => handleUpdateMember(index, 'role', e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <button
                    onClick={() => handleDeleteMember(index)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Tile>
  );
};

const TaskTemplateLibraryTile = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkImportText, setBulkImportText] = useState('');
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [newTemplate, setNewTemplate] = useState({
    title: '',
    description: '',
    priority: 'medium',
    time_to_complete_minutes: 30,
    category: 'daily'
  });

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await taskTemplatesAPI.getAll();
      setTemplates(response.data.templates || []);
      setError(null);
    } catch (err) {
      setError('Failed to load task templates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleAddTemplate = async () => {
    try {
      await taskTemplatesAPI.create(newTemplate);
      setSuccessMessage('Template added successfully!');
      setShowAddForm(false);
      setNewTemplate({
        title: '',
        description: '',
        priority: 'medium',
        time_to_complete_minutes: 30,
        category: 'daily'
      });
      fetchTemplates();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to add template.');
    }
  };

  const handleBulkImport = async () => {
    try {
      const data = JSON.parse(bulkImportText);
      await taskTemplatesAPI.bulkImport(data);
      setSuccessMessage('Templates imported successfully!');
      setShowBulkImport(false);
      setBulkImportText('');
      fetchTemplates();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to import templates. Check JSON format.');
    }
  };

  const handleEditClick = (template) => {
    setEditingTemplate({ ...template });
    setShowAddForm(false);
    setShowBulkImport(false);
  };

  const handleUpdateTemplate = async () => {
    try {
      await taskTemplatesAPI.update(editingTemplate.id, editingTemplate);
      setSuccessMessage('Template updated successfully!');
      setEditingTemplate(null);
      fetchTemplates();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to update template.');
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await taskTemplatesAPI.delete(id);
      setSuccessMessage('Template deleted successfully!');
      fetchTemplates();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to delete template.');
    }
  };

  return (
    <Tile
      title="Task Template Library"
      className="lg:col-span-3"
      actions={
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
            type="button"
          >
            {showAddForm ? 'Cancel' : 'Add Template'}
          </button>
          <button
            onClick={() => setShowBulkImport(!showBulkImport)}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
            type="button"
          >
            {showBulkImport ? 'Cancel' : 'Bulk Import'}
          </button>
        </div>
      }
    >
      {loading ? (
        <p className="text-gray-500">Loading templates...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div>
          {successMessage && (
            <div className="mb-3 p-2 bg-green-100 text-green-700 rounded text-sm">
              {successMessage}
            </div>
          )}

          {showAddForm && (
            <div className="mb-4 p-4 border border-gray-300 rounded bg-gray-50">
              <h4 className="font-semibold mb-3 text-sm">Add New Template</h4>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Title"
                  value={newTemplate.title}
                  onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <textarea
                  placeholder="Description"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  rows="2"
                />
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={newTemplate.priority}
                    onChange={(e) => setNewTemplate({ ...newTemplate, priority: e.target.value })}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Minutes"
                    value={newTemplate.time_to_complete_minutes}
                    onChange={(e) => setNewTemplate({ ...newTemplate, time_to_complete_minutes: parseInt(e.target.value) || 0 })}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <select
                    value={newTemplate.category}
                    onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>
                <button
                  onClick={handleAddTemplate}
                  className="bg-green-500 text-white px-4 py-1 rounded text-sm hover:bg-green-600"
                  type="button"
                >
                  Save Template
                </button>
              </div>
            </div>
          )}

          {showBulkImport && (
            <div className="mb-4 p-4 border border-gray-300 rounded bg-gray-50">
              <h4 className="font-semibold mb-3 text-sm">Bulk Import Templates (JSON)</h4>
              <textarea
                placeholder='{"templates": [{"title": "...", "description": "...", "priority": "medium", "time_to_complete_minutes": 30, "category": "daily"}]}'
                value={bulkImportText}
                onChange={(e) => setBulkImportText(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm font-mono"
                rows="6"
              />
              <button
                onClick={handleBulkImport}
                className="mt-2 bg-blue-500 text-white px-4 py-1 rounded text-sm hover:bg-blue-600"
                type="button"
              >
                Import Templates
              </button>
            </div>
          )}

          {editingTemplate && (
            <div className="mb-4 p-4 border border-blue-300 rounded bg-blue-50">
              <h4 className="font-semibold mb-3 text-sm">Edit Template</h4>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Title"
                  value={editingTemplate.title}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, title: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <textarea
                  placeholder="Description"
                  value={editingTemplate.description}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  rows="2"
                />
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={editingTemplate.priority}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, priority: e.target.value })}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Minutes"
                    value={editingTemplate.time_to_complete_minutes}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, time_to_complete_minutes: parseInt(e.target.value) || 0 })}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <select
                    value={editingTemplate.category}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value })}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateTemplate}
                    className="bg-blue-500 text-white px-4 py-1 rounded text-sm hover:bg-blue-600"
                    type="button"
                  >
                    Update Template
                  </button>
                  <button
                    onClick={() => setEditingTemplate(null)}
                    className="bg-gray-300 text-gray-700 px-4 py-1 rounded text-sm hover:bg-gray-400"
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {templates.length === 0 ? (
            <p className="text-gray-500">No templates yet. Add one to get started!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 border-b">
                    <th className="py-2 pr-4">Title</th>
                    <th className="py-2 pr-4">Category</th>
                    <th className="py-2 pr-4">Priority</th>
                    <th className="py-2 pr-4">Time</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((template) => (
                    <tr key={template.id} className="border-b border-gray-200">
                      <td className="py-2 pr-4">
                        <div className="font-medium text-gray-800">{template.title}</div>
                        {template.description && (
                          <div className="text-xs text-gray-500">{template.description}</div>
                        )}
                      </td>
                      <td className="py-2 pr-4">
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs capitalize">
                          {template.category}
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        <span className={`px-2 py-0.5 rounded text-xs capitalize ${
                          template.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          template.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          template.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {template.priority}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-gray-700">{template.time_to_complete_minutes} min</td>
                      <td className="py-2 pr-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditClick(template)}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="text-red-600 hover:text-red-800 text-xs"
                            type="button"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Tile>
  );
};

const AdminPanel = ({ onBack, onLogout }) => {
  const topRef = useRef(null);

  // Scroll to top when admin panel mounts
  useLayoutEffect(() => {
    // Force scroll to top with multiple methods
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
    topRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, []);

  // Additional scroll lock during render
  useLayoutEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  });

  // Aggressive scroll prevention for first second
  useLayoutEffect(() => {
    const preventScroll = (e) => {
      window.scrollTo(0, 0);
    };

    window.addEventListener('scroll', preventScroll, { passive: false });

    const timer = setTimeout(() => {
      window.removeEventListener('scroll', preventScroll);
    }, 1000);

    return () => {
      window.removeEventListener('scroll', preventScroll);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div ref={topRef} />
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Audit logins and manage all workspace data.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onBack}
              className="bg-gray-200 text-gray-800 px-3 py-2 rounded-md hover:bg-gray-300"
              type="button"
            >
              Back to Workspace
            </button>
            <button
              onClick={onLogout}
              className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600"
              type="button"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <TileLayout>
          <LoginAttemptsTile />
          <TeamManagementTile />
          <TaskTemplateLibraryTile />
          <FeedbackListTile />
          <TaskPlanner />
          <Calendar />
          <Reminders />
          <KnowledgeBase />
          <Documents />
          <ChatInterface />
          <FeedbackForm />
        </TileLayout>
      </main>
    </div>
  );
};

export default AdminPanel;
