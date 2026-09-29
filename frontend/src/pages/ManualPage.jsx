import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { BookOpen } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import manualGuest from '../assets/MANUAL_GUEST.md?raw';
import manualStaff from '../assets/MANUAL_STAFF.md?raw';
import manualAdmin from '../assets/MANUAL_ADMIN.md?raw';

export default function ManualPage() {
  const { user } = useAuthStore();
  
  const manualContent = useMemo(() => {
    if (user?.role === 'admin') return manualAdmin;
    if (user?.role === 'staff') return manualStaff;
    return manualGuest;
  }, [user]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900/50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-8 border-b border-slate-100 dark:border-slate-700 pb-6">
            <div className="p-3 bg-brand-100 text-brand-700 rounded-2xl">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">Manual de Usuario</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Guía especializada para tu perfil</p>
            </div>
          </div>
          <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-brand-600">
            <ReactMarkdown>{manualContent}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
