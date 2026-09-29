import React, { useState, useEffect, useRef } from 'react';
import { Settings2, Type, Moon, Sun } from 'lucide-react';

export default function AppearanceMenu() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [theme, setTheme] = useState('light');
  const [fontScale, setFontScale] = useState('md');

  useEffect(() => {
    // Initialize state from document/localStorage on mount
    const savedTheme = localStorage.getItem('hotelwork-theme');
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(savedTheme || (isDark ? 'dark' : 'light'));

    const savedScale = localStorage.getItem('hotelwork-font-scale') || 'md';
    setFontScale(savedScale);
  }, []);

  // Click outside and Escape key listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('hotelwork-theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleFontScaleChange = (scale) => {
    setFontScale(scale);
    localStorage.setItem('hotelwork-font-scale', scale);
    const sizes = { sm: '87.5%', md: '100%', lg: '112.5%', xl: '125%' };
    document.documentElement.style.fontSize = sizes[scale] || '100%';
  };

  const fonts = [
    { id: 'sm', label: 'A-', title: 'Pequeña' },
    { id: 'md', label: 'A', title: 'Normal' },
    { id: 'lg', label: 'A+', title: 'Grande' },
    { id: 'xl', label: 'A++', title: 'Extra Grande' },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-center"
        title="Apariencia y accesibilidad"
        aria-label="Apariencia y accesibilidad"
      >
        <Settings2 className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-3 z-50 animate-fadeIn text-slate-800 dark:text-slate-100">
          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <h4 className="text-sm font-bold tracking-tight">Apariencia</h4>
          </div>

          <div className="p-4 space-y-5">
            {/* Font Scale Section */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5" /> Tamaño del texto
              </label>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                {fonts.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => handleFontScaleChange(f.id)}
                    title={f.title}
                    aria-label={f.title}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-all ${
                      fontScale === f.id
                        ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Section */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5" /> Tema
              </label>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    theme === 'light'
                      ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Sun className="w-4 h-4" /> Claro
                </button>
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    theme === 'dark'
                      ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Moon className="w-4 h-4" /> Oscuro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
