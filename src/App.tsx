import React, { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetails } from './pages/ProductDetails';
import { Florists } from './pages/Florists';
import { FloristProfile } from './pages/FloristProfile';
import { NotFound } from './pages/NotFound';
import { QuickViewModal } from './components/QuickViewModal';
import {
  About,
  Reviews,
  Occasions,
  Categories,
  Contact,
  FAQ,
  Careers,
  Policies,
  BecomeFlorist,
  Blog,
  BlogDetails
} from './pages/MarketingPages';

export default function App() {
  const [route, setRoute] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash);
      // Perfect UX: Always scroll page to top on route change
      window.scrollTo({ top: 0, behavior: 'instant' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Simple, solid router matching
  const renderPage = () => {
    const currentHash = route || '#/';

    // 1. Dynamic parameterized routes
    if (currentHash.startsWith('#/product/')) {
      return <ProductDetails />;
    }
    if (currentHash.startsWith('#/florist/')) {
      return <FloristProfile />;
    }
    if (currentHash.startsWith('#/blog/')) {
      return <BlogDetails />;
    }

    // 2. Exact static routes
    switch (currentHash) {
      case '#/':
      case '#':
        return <Home />;
      case '#/shop':
        return <Shop />;
      case '#/florists':
        return <Florists />;
      case '#/about':
        return <About />;
      case '#/reviews':
        return <Reviews />;
      case '#/occasions':
        return <Occasions />;
      case '#/categories':
        return <Categories />;
      case '#/contact':
        return <Contact />;
      case '#/faq':
        return <FAQ />;
      case '#/careers':
        return <Careers />;
      case '#/privacy':
      case '#/terms':
        return <Policies />;
      case '#/become-a-florist':
        return <BecomeFlorist />;
      case '#/blog':
        return <Blog />;
      default:
        return <NotFound />;
    }
  };

  return (
    <AppProvider>
      <Layout>
        {renderPage()}
        {/* Mount global quick view overlay portal */}
        <QuickViewModal />
      </Layout>
    </AppProvider>
  );
}
