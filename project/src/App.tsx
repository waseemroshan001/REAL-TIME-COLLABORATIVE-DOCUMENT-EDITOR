import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useDocuments } from './hooks/useDocuments';
import { AuthForm } from './components/Auth/AuthForm';
import { DocumentList } from './components/DocumentList/DocumentList';
import { Editor } from './components/Editor/Editor';
import { Header } from './components/Layout/Header';
import { Document } from './types';

function App() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const { 
    documents, 
    loading: docsLoading, 
    createDocument, 
    updateDocument, 
    deleteDocument 
  } = useDocuments(user?.id);
  
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onSignIn={signIn} onSignUp={signUp} />;
  }

  if (selectedDocument) {
    return (
      <Editor
        document={selectedDocument}
        onBack={() => setSelectedDocument(null)}
        onUpdateDocument={(id, updates) => {
          updateDocument(id, updates);
          setSelectedDocument(prev => prev ? { ...prev, ...updates } : null);
        }}
        currentUserId={user.id}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onSignOut={signOut} />
      <DocumentList
        documents={documents}
        loading={docsLoading}
        onCreateDocument={createDocument}
        onSelectDocument={setSelectedDocument}
        onDeleteDocument={deleteDocument}
        currentUserId={user.id}
      />
    </div>
  );
}

export default App;