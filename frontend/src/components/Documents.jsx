import React, { useState, useEffect } from 'react';
import { Plus, X, Edit2, Trash2, FileText, ExternalLink, Tag } from 'lucide-react';
import Tile from './Tile';
import { documentsAPI } from '../services/api';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const initialFormState = {
    title: '',
    description: '',
    file_path: '',
    file_type: '',
    url: '',
    tags: '',
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await documentsAPI.getAll();
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.title.trim()) {
      setFormError('Document title is required.');
      return;
    }

    if (!formData.file_path.trim() && !formData.url.trim()) {
      setFormError('Provide a file path or URL for the document.');
      return;
    }

    if (formData.url.trim()) {
      try {
        // eslint-disable-next-line no-new
        new URL(formData.url);
      } catch (err) {
        setFormError('Please enter a valid URL (including protocol).');
        return;
      }
    }

    try {
      if (editingDocument) {
        await documentsAPI.update(editingDocument.id, formData);
      } else {
        await documentsAPI.create(formData);
      }
      fetchDocuments();
      setFormSuccess(editingDocument ? 'Document updated successfully.' : 'Document added successfully.');
      resetForm();
    } catch (error) {
      console.error('Error saving document:', error);
      setFormError('Unable to save document. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await documentsAPI.delete(id);
        fetchDocuments();
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }
  };

  const handleEdit = (document) => {
    setFormError('');
    setFormSuccess('');
    setEditingDocument(document);
    setFormData({
      title: document.title,
      description: document.description || '',
      file_path: document.file_path || '',
      file_type: document.file_type || '',
      url: document.url || '',
      tags: document.tags || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingDocument(null);
    setShowForm(false);
    setFormError('');
  };

  const openForm = () => {
    setFormError('');
    setFormSuccess('');
    setEditingDocument(null);
    setFormData(initialFormState);
    setShowForm(true);
  };

  const getFileTypeColor = (fileType) => {
    const colors = {
      pdf: 'bg-red-100 text-red-800',
      doc: 'bg-blue-100 text-blue-800',
      docx: 'bg-blue-100 text-blue-800',
      txt: 'bg-gray-100 text-gray-800',
      md: 'bg-green-100 text-green-800',
    };
    return colors[fileType?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const handleOpenFile = (filePath) => {
    if (!filePath) return;

    // Convert Windows path to file:// URL
    let fileUrl = filePath;
    if (filePath.match(/^[a-zA-Z]:\\/)) {
      // Windows path like C:\Users\...
      fileUrl = 'file:///' + filePath.replace(/\\/g, '/');
    }

    // Try to open the file
    window.open(fileUrl, '_blank');
  };

  return (
    <Tile
      title="Documents"
      actions={
        <button
          onClick={() => (showForm ? resetForm() : openForm())}
          className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 flex items-center gap-1"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'New Document'}
        </button>
      }
    >
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 bg-gray-50 rounded-lg">
          <input
            type="text"
            placeholder="Document title"
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
            placeholder="File path"
            value={formData.file_path}
            onChange={(e) => setFormData({ ...formData, file_path: e.target.value })}
            className="w-full p-2 mb-2 border rounded"
          />
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input
              type="text"
              placeholder="File type (pdf, doc, etc.)"
              value={formData.file_type}
              onChange={(e) => setFormData({ ...formData, file_type: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <input
              type="url"
              placeholder="URL"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
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
            {editingDocument ? 'Update Document' : 'Create Document'}
          </button>
        </form>
      )}

      {!showForm && formSuccess && (
        <p className="text-sm text-green-600 mb-3">{formSuccess}</p>
      )}

      <div className="space-y-2">
        {documents.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No documents yet</p>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-start gap-2 flex-1">
                  <FileText size={16} className="text-blue-500 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">{doc.title}</h3>
                      {doc.url && (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                    {doc.file_type && (
                      <span className={`inline-block mt-1 text-xs px-2 py-1 rounded ${getFileTypeColor(doc.file_type)}`}>
                        {doc.file_type.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(doc)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {doc.description && (
                <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
              )}

              {doc.file_path && (
                <button
                  onClick={() => handleOpenFile(doc.file_path)}
                  className="text-xs text-blue-600 hover:text-blue-800 mb-2 font-mono truncate underline cursor-pointer text-left w-full"
                  title="Click to open file"
                >
                  📄 {doc.file_path}
                </button>
              )}

              {doc.tags && (
                <div className="flex items-center gap-1 flex-wrap">
                  <Tag size={12} className="text-gray-400" />
                  {doc.tags.split(',').map((tag, idx) => (
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

export default Documents;
