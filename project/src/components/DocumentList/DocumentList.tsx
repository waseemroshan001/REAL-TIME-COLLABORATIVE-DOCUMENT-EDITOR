import React, { useState } from 'react';
import { Document } from '../../types';
import { Plus, FileText, Clock, Users, MoreVertical, Trash2, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DocumentListProps {
  documents: Document[];
  loading: boolean;
  onCreateDocument: (title: string) => Promise<Document | null>;
  onSelectDocument: (document: Document) => void;
  onDeleteDocument: (id: string) => void;
  currentUserId: string;
}

export function DocumentList({ 
  documents, 
  loading, 
  onCreateDocument, 
  onSelectDocument,
  onDeleteDocument,
  currentUserId 
}: DocumentListProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim()) return;

    setCreating(true);
    const document = await onCreateDocument(newDocTitle);
    if (document) {
      setNewDocTitle('');
      setShowCreateForm(false);
      onSelectDocument(document);
    }
    setCreating(false);
  };

  const handleDeleteDocument = (id: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      onDeleteDocument(id);
    }
    setActiveMenu(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Documents</h1>
          <p className="text-gray-600">Create and manage your collaborative documents</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          New Document
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Document</h2>
          <form onSubmit={handleCreateDocument} className="flex gap-4">
            <input
              type="text"
              value={newDocTitle}
              onChange={(e) => setNewDocTitle(e.target.value)}
              placeholder="Enter document title..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <button
              type="submit"
              disabled={creating || !newDocTitle.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setNewDocTitle('');
              }}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {documents.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No documents yet</h2>
          <p className="text-gray-600 mb-6">Create your first document to get started</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((document) => (
            <div
              key={document.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 group cursor-pointer"
            >
              <div 
                className="p-6"
                onClick={() => onSelectDocument(document)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {document.title}
                      </h3>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(activeMenu === document.id ? null : document.id);
                      }}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                    
                    {activeMenu === document.id && (
                      <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10 min-w-[150px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle share functionality
                            setActiveMenu(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Share2 className="w-4 h-4" />
                          Share
                        </button>
                        {document.owner_id === currentUserId && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDocument(document.id);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDistanceToNow(new Date(document.updated_at), { addSuffix: true })}
                  </div>
                  {document.is_public && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Public
                    </div>
                  )}
                </div>

                <div className="text-sm text-gray-600 line-clamp-2">
                  {document.content ? 
                    document.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : 
                    'Empty document'
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}