/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import React, { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Browse from './pages/Browse';
import OfferDetail from './pages/OfferDetail';
import Account from './pages/Account';
import Savings from './pages/Savings';
import SearchPage from './pages/Search';
import CuratedResults from './pages/CuratedResults';
import AgentDrawer from './components/AgentDrawer';
import { CardProvider } from './contexts/CardContext';
import { SessionProvider } from './contexts/SessionContext';
import { setDyRecommendationContext } from './lib/dynamicYield';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function DynamicYieldPageContext() {
  const { pathname } = useLocation();

  useEffect(() => {
    setDyRecommendationContext(pathname);
  }, [pathname]);

  return null;
}

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-secondary-container selection:text-on-secondary-container bg-surface">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <AgentDrawer />
    </div>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <CardProvider>
        <Router>
          <ScrollToTop />
          <DynamicYieldPageContext />
          <MainLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/offers" element={<Browse />} />
              <Route path="/offers/:sku" element={<OfferDetail />} />
              <Route path="/account" element={<Account />} />
              <Route path="/savings" element={<Savings />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/curated" element={<CuratedResults />} />
              {/* Fallbacks for menu links not yet implemented */}
              <Route path="/rewards" element={<Browse />} />
              <Route path="/concierge" element={<Home />} />
              <Route path="/lifestyle" element={<Home />} />
            </Routes>
          </MainLayout>
        </Router>
      </CardProvider>
    </SessionProvider>
  );
}
