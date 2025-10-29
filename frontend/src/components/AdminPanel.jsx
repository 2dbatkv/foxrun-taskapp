import React, { useEffect, useState } from 'react';
import TileLayout from './TileLayout';
import Tile from './Tile';
import TaskPlanner from './TaskPlanner';
import Calendar from './Calendar';
import Reminders from './Reminders';
import KnowledgeBase from './KnowledgeBase';
import Documents from './Documents';
import ChatInterface from './ChatInterface';
import FeedbackForm from './FeedbackForm';
import { adminAPI, feedbackAPI } from '../services/api';

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
      ) : feedbackReports.length === 0 ? (
        <p className="text-gray-500">No feedback submitted yet.</p>
      ) : (
        <div className="space-y-3">
          {feedbackReports.map((item) => (
            <div key={item.id} className="p-3 border border-gray-200 rounded-md bg-white shadow-sm">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{item.category}</p>
                  <p className="text-xs text-gray-500">
                    {item.name || 'Anonymous'}
                    {item.email ? ` · ${item.email}` : ''}
                  </p>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {new Date(item.created_at).toLocaleString()}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{item.message}</p>
            </div>
          ))}
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

const AdminPanel = ({ onBack, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-100">
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
