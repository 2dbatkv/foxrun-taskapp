import React from 'react';
import { CheckSquare, Calendar, Bell, Book, FileText } from 'lucide-react';

const SearchResults = ({ results, isAI }) => {
  if (!results) return null;

  if (isAI) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-purple-600">AI Search Results</span>
        </h2>
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">{results.ai_analysis}</p>
        </div>
      </div>
    );
  }

  const { results: data, total_results } = results;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Search Results ({total_results} found)
      </h2>

      <div className="space-y-4">
        {data.tasks && data.tasks.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <CheckSquare size={18} className="text-blue-500" />
              Tasks ({data.tasks.length})
            </h3>
            <div className="space-y-2 ml-6">
              {data.tasks.map((task) => (
                <div key={task.id} className="p-2 bg-gray-50 rounded border border-gray-200">
                  <p className="font-medium">{task.title}</p>
                  {task.description && <p className="text-sm text-gray-600">{task.description}</p>}
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                      {task.status}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.events && data.events.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Calendar size={18} className="text-green-500" />
              Calendar Events ({data.events.length})
            </h3>
            <div className="space-y-2 ml-6">
              {data.events.map((event) => (
                <div key={event.id} className="p-2 bg-gray-50 rounded border border-gray-200">
                  <p className="font-medium">{event.title}</p>
                  {event.description && <p className="text-sm text-gray-600">{event.description}</p>}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(event.start_time).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.reminders && data.reminders.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Bell size={18} className="text-orange-500" />
              Reminders ({data.reminders.length})
            </h3>
            <div className="space-y-2 ml-6">
              {data.reminders.map((reminder) => (
                <div key={reminder.id} className="p-2 bg-gray-50 rounded border border-gray-200">
                  <p className="font-medium">{reminder.title}</p>
                  {reminder.description && <p className="text-sm text-gray-600">{reminder.description}</p>}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(reminder.remind_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.knowledge && data.knowledge.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Book size={18} className="text-purple-500" />
              Knowledge Base ({data.knowledge.length})
            </h3>
            <div className="space-y-2 ml-6">
              {data.knowledge.map((entry) => (
                <div key={entry.id} className="p-2 bg-gray-50 rounded border border-gray-200">
                  <p className="font-medium">{entry.title}</p>
                  <p className="text-sm text-gray-600">{entry.content}</p>
                  {entry.category && (
                    <span className="inline-block mt-1 text-xs px-2 py-1 rounded bg-purple-100 text-purple-800">
                      {entry.category}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.documents && data.documents.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FileText size={18} className="text-red-500" />
              Documents ({data.documents.length})
            </h3>
            <div className="space-y-2 ml-6">
              {data.documents.map((doc) => (
                <div key={doc.id} className="p-2 bg-gray-50 rounded border border-gray-200">
                  <p className="font-medium">{doc.title}</p>
                  {doc.description && <p className="text-sm text-gray-600">{doc.description}</p>}
                  {doc.file_type && (
                    <span className="inline-block mt-1 text-xs px-2 py-1 rounded bg-red-100 text-red-800">
                      {doc.file_type}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {total_results === 0 && (
          <p className="text-gray-500 text-center py-4">No results found</p>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
