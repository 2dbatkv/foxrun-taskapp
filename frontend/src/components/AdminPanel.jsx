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
