import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Document } from '../types';

export function useDocuments(userId?: string) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchDocuments();
  }, [userId]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .or(`owner_id.eq.${userId},is_public.eq.true`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDocument = async (title: string) => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('documents')
        .insert([
          {
            title,
            content: '',
            owner_id: userId,
            is_public: false,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      setDocuments(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating document:', error);
      return null;
    }
  };

  const updateDocument = async (id: string, updates: Partial<Document>) => {
    try {
      const { error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      setDocuments(prev => 
        prev.map(doc => doc.id === id ? { ...doc, ...updates } : doc)
      );
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  return {
    documents,
    loading,
    createDocument,
    updateDocument,
    deleteDocument,
    refetch: fetchDocuments,
  };
}