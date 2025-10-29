import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, BookOpen, Target, Users } from 'lucide-react';
import { tasksAPI, remindersAPI, knowledgeAPI, teamAPI } from '../services/api';

const Dashboard = () => {
  const [taskStats, setTaskStats] = useState({
    byPriority: { urgent: 0, high: 0, medium: 0, low: 0 },
    byStatus: { todo: 0, in_progress: 0, completed: 0, cancelled: 0 },
    dueSoon: []
  });
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [recentKnowledge, setRecentKnowledge] = useState([]);
  const [teamWorkload, setTeamWorkload] = useState([]);
  const [workloadTimeRange, setWorkloadTimeRange] = useState('weekly'); // 'daily' or 'weekly'

  useEffect(() => {
    fetchDashboardData();
  }, [workloadTimeRange]);

  const fetchDashboardData = async () => {
    try {
      // Fetch tasks
      const tasksResponse = await tasksAPI.getAll();
      const tasks = tasksResponse.data;

      // Calculate task statistics
      const priorityCounts = { urgent: 0, high: 0, medium: 0, low: 0 };
      const statusCounts = { todo: 0, in_progress: 0, completed: 0, cancelled: 0 };
      const dueSoon = [];

      const now = new Date();
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      tasks.forEach(task => {
        // Count by priority
        if (task.priority) priorityCounts[task.priority]++;

        // Count by status
        if (task.status) statusCounts[task.status]++;

        // Check if due soon
        if (task.due_date && task.status !== 'completed' && task.status !== 'cancelled') {
          const dueDate = new Date(task.due_date);
          if (dueDate >= now && dueDate <= sevenDaysFromNow) {
            dueSoon.push(task);
          }
        }
      });

      dueSoon.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

      setTaskStats({
        byPriority: priorityCounts,
        byStatus: statusCounts,
        dueSoon: dueSoon.slice(0, 5)
      });

      // Fetch upcoming reminders
      const remindersResponse = await remindersAPI.getUpcoming();
      setUpcomingReminders(remindersResponse.data.slice(0, 5));

      // Fetch recent knowledge entries
      const knowledgeResponse = await knowledgeAPI.getAll();
      const sortedKnowledge = knowledgeResponse.data
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, 3);
      setRecentKnowledge(sortedKnowledge);

      // Fetch team and calculate workload
      const teamResponse = await teamAPI.getAll();
      const teamMembers = teamResponse.data.team || [];

      // Calculate date range based on workloadTimeRange
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let startDate, endDate, capacityMultiplier;

      if (workloadTimeRange === 'daily') {
        // Daily: today only
        startDate = new Date(today);
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);
        capacityMultiplier = 1;
      } else {
        // Weekly: current week (Sunday - Saturday)
        const dayOfWeek = today.getDay(); // 0 = Sunday
        startDate = new Date(today);
        startDate.setDate(today.getDate() - dayOfWeek); // Go back to Sunday
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // Saturday
        endDate.setHours(23, 59, 59, 999);
        capacityMultiplier = 5; // 5 weekdays
      }

      // Calculate workload per person
      const workloadByPerson = {};
      teamMembers.forEach(member => {
        workloadByPerson[member.name] = {
          capacity: member.daily_capacity_minutes * capacityMultiplier,
          assigned: 0,
          role: member.role
        };
      });

      // Helper function to normalize date to just date part (no time)
      const normalizeDate = (dateString) => {
        const d = new Date(dateString);
        d.setHours(0, 0, 0, 0);
        return d;
      };

      // Sum up task times ONLY for completed tasks
      tasks.forEach(task => {
        // Only count completed tasks with an assignee and completed_at timestamp
        if (!task.assignee || task.status !== 'completed' || !task.completed_at) return;

        if (workloadTimeRange === 'daily') {
          // Daily view: only count tasks completed TODAY
          const completedDate = normalizeDate(task.completed_at);
          const todayNormalized = normalizeDate(today);

          if (completedDate.getTime() === todayNormalized.getTime()) {
            if (workloadByPerson[task.assignee]) {
              workloadByPerson[task.assignee].assigned += task.time_to_complete_minutes || 0;
            }
          }
        } else {
          // Weekly view: only count tasks completed THIS WEEK
          const completedDate = new Date(task.completed_at);

          if (completedDate >= startDate && completedDate <= endDate) {
            if (workloadByPerson[task.assignee]) {
              workloadByPerson[task.assignee].assigned += task.time_to_complete_minutes || 0;
            }
          }
        }
      });

      // Convert to array for rendering
      const workloadArray = Object.entries(workloadByPerson).map(([name, data]) => ({
        name,
        capacity: data.capacity,
        assigned: data.assigned,
        role: data.role,
        percentage: data.capacity > 0 ? Math.round((data.assigned / data.capacity) * 100) : 0
      }));

      setTeamWorkload(workloadArray);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-blue-500'
    };
    return colors[priority] || 'bg-gray-500';
  };

  const getStatusColor = (status) => {
    const colors = {
      todo: 'bg-gray-500',
      in_progress: 'bg-blue-500',
      completed: 'bg-green-500',
      cancelled: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const formatMinutesToHours = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const getWorkloadColor = (percentage) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-orange-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Target size={24} className="text-blue-600" />
        Dashboard Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Task Priorities */}
        <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-lg border border-blue-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <AlertCircle size={16} />
            Task Priority
          </h3>
          <div className="space-y-2">
            {Object.entries(taskStats.byPriority).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(priority)}`}></div>
                  <span className="text-sm capitalize text-gray-700">{priority}</span>
                </div>
                <span className="font-bold text-gray-800">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Task Status */}
        <div className="bg-gradient-to-br from-green-50 to-white p-4 rounded-lg border border-green-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <CheckCircle size={16} />
            Task Status
          </h3>
          <div className="space-y-2">
            {Object.entries(taskStats.byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}></div>
                  <span className="text-sm capitalize text-gray-700">{status.replace('_', ' ')}</span>
                </div>
                <span className="font-bold text-gray-800">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks Due Soon */}
        <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-lg border border-purple-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Clock size={16} />
            Due This Week ({taskStats.dueSoon.length})
          </h3>
          <div className="space-y-2">
            {taskStats.dueSoon.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No tasks due this week</p>
            ) : (
              taskStats.dueSoon.map((task) => (
                <div key={task.id} className="text-xs">
                  <p className="font-medium text-gray-800 truncate">{task.title}</p>
                  <p className="text-gray-500">{formatDate(task.due_date)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Next 5 Reminders */}
        <div className="bg-gradient-to-br from-orange-50 to-white p-4 rounded-lg border border-orange-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Clock size={16} />
            Next 5 Reminders
          </h3>
          <div className="space-y-2">
            {upcomingReminders.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No upcoming reminders</p>
            ) : (
              upcomingReminders.map((reminder) => (
                <div key={reminder.id} className="flex items-start justify-between text-xs border-b border-orange-100 pb-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{reminder.title}</p>
                    <p className="text-gray-500">{formatDate(reminder.remind_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Knowledge Base */}
        <div className="bg-gradient-to-br from-indigo-50 to-white p-4 rounded-lg border border-indigo-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <BookOpen size={16} />
            Recently Updated Knowledge
          </h3>
          <div className="space-y-2">
            {recentKnowledge.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No knowledge entries yet</p>
            ) : (
              recentKnowledge.map((entry) => (
                <div key={entry.id} className="border-b border-indigo-100 pb-2">
                  <p className="text-xs font-medium text-gray-800 truncate">{entry.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {entry.category && (
                      <span className="text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                        {entry.category}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(entry.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Team Workload Section */}
      <div className="mt-6">
        <div className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Users size={16} />
              Team Workload Distribution
            </h3>
            <div className="flex gap-1">
              <button
                onClick={() => setWorkloadTimeRange('daily')}
                className={`px-3 py-1 text-xs rounded ${
                  workloadTimeRange === 'daily'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setWorkloadTimeRange('weekly')}
                className={`px-3 py-1 text-xs rounded ${
                  workloadTimeRange === 'weekly'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                This Week
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {teamWorkload.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No team data available</p>
            ) : (
              teamWorkload.map((member) => (
                <div key={member.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{member.name}</span>
                      <span className="text-gray-500">({member.role})</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold">{formatMinutesToHours(member.assigned)}</span>
                      <span className="text-gray-500"> / {formatMinutesToHours(member.capacity)}</span>
                      <span className={`ml-2 font-bold ${member.percentage >= 100 ? 'text-red-600' : member.percentage >= 80 ? 'text-orange-600' : 'text-green-600'}`}>
                        {member.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getWorkloadColor(member.percentage)}`}
                      style={{ width: `${Math.min(member.percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
