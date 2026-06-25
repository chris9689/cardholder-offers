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
    <form onSubmit={handleSearchSubmit} className="flex items-center bg-white px-8 py-4 rounded-3xl border border-outline-variant/10 w-full max-w-3xl shadow-xl relative z-10 mx-auto group hover:border-primary/30 transition-all duration-500">
      <Search className="text-on-surface-variant group-hover:text-primary transition-colors mr-4" size={22} />
      <input 
        className="bg-transparent border-none focus:outline-none text-base w-full p-0 font-sans font-medium placeholder:text-on-surface-variant/40 tracking-tight" 
        placeholder="What are you looking for?" 
        type="text" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </form>
  );
}
