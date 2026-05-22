/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, LayoutGrid, ChevronDown } from 'lucide-react';

export default function SearchFilters() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (query.trim()) {
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  return (
    <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center bg-white px-8 py-3 rounded-[32px] border border-outline-variant/10 w-full max-w-5xl shadow-2xl relative z-10 mx-auto group hover:border-primary/20 transition-all duration-500">
      <div className="flex items-center flex-1 w-full border-b md:border-b-0 md:border-r border-outline-variant/10 py-5 md:py-0">
        <Search className="text-on-surface-variant group-hover:text-primary transition-colors mr-4" size={22} />
        <input 
          className="bg-transparent border-none focus:ring-0 text-base w-full p-0 font-sans font-extrabold placeholder:text-on-surface-variant/30 tracking-tight" 
          placeholder="What are you looking for?" 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      
      <div className="flex items-center gap-6 md:gap-10 w-full md:w-auto py-5 md:py-0 md:pl-10">
        <button type="button" onClick={() => navigate('/offers')} className="flex-1 md:flex-none font-sans text-[10px] font-black text-on-surface-variant flex items-center justify-center gap-2 hover:text-secondary transition-colors uppercase tracking-[0.2em] cursor-pointer">
          <MapPin size={18} className="text-secondary" />
          Location 
          <ChevronDown size={14} className="opacity-40" />
        </button>
        <div className="hidden md:block w-px h-6 bg-outline-variant/10" />
        <button type="button" onClick={() => navigate('/offers')} className="flex-1 md:flex-none font-sans text-[10px] font-black text-on-surface-variant flex items-center justify-center gap-2 hover:text-secondary transition-colors uppercase tracking-[0.2em] cursor-pointer">
          <LayoutGrid size={18} className="text-secondary" />
          All Categories 
          <ChevronDown size={14} className="opacity-40" />
        </button>
      </div>
    </form>
  );
}
