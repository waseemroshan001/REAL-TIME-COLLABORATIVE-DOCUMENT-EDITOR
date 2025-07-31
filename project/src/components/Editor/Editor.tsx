import React, { useEffect, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Document } from '../../types';
import { supabase } from '../../lib/supabase';
import { Toolbar } from './Toolbar';
import { 
  ArrowLeft, 
  Save, 
  Users, 
  Globe, 
  Lock,
  Share2
} from 'lucide-react';

interface EditorProps {
  document: Document;
  onBack: () => void;
  onUpdateDocument: (id: string, updates: Partial<Document>) => void;
  currentUserId: string;
}

export function Editor({ document, onBack, onUpdateDocument, currentUserId }: EditorProps) {
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [title, setTitle] = useState(document.title);
  const [collaborators, setCollaborators] = useState<number>(1);

  const editor = useEditor({
    extensions: [StarterKit],
    content: document.content || '<p>Start writing your document...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[500px] px-6 py-4',
      },
    },
    onUpdate: ({ editor }) => {
      debouncedSave(editor.getHTML());
    },
  });

  const saveDocument = useCallback(async (content: string) => {
    setSaving(true);
    try {
      await onUpdateDocument(document.id, { 
        content,
        updated_at: new Date().toISOString()
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving document:', error);
    } finally {
      setSaving(false);
    }
  }, [document.id, onUpdateDocument]);

  const debouncedSave = useCallback(
    debounce((content: string) => saveDocument(content), 1000),
    [saveDocument]
  );

  const handleTitleChange = async (newTitle: string) => {
    if (newTitle !== document.title) {
      await onUpdateDocument(document.id, { title: newTitle });
    }
  };

  const togglePublic = async () => {
    await onUpdateDocument(document.id, { is_public: !document.is_public });
  };

  useEffect(() => {
    // Set up real-time collaboration
    const channel = supabase
      .channel(`document-${document.id}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setCollaborators(Object.keys(state).length);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: currentUserId,
            document_id: document.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [document.id, currentUserId]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => handleTitleChange(title)}
              className="text-xl font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
              placeholder="Untitled Document"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{collaborators}</span>
              </div>
              
              <button
                onClick={togglePublic}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                {document.is_public ? (
                  <>
                    <Globe className="w-4 h-4" />
                    Public
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Private
                  </>
                )}
              </button>

              <button className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4 text-green-600" />
                  Saved {formatTimeAgo(lastSaved)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar editor={editor} />

      {/* Editor */}
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg my-8">
        <EditorContent 
          editor={editor} 
          className="min-h-[600px] border border-gray-200 rounded-lg"
        />
      </div>
    </div>
  );
}

// Utility functions
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}