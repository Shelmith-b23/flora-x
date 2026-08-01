import React, { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetails } from './pages/ProductDetails';
import { Florists } from './pages/Florists';
import { FloristProfile } from './pages/FloristProfile';
import { NotFound } from './pages/NotFound';
import { QuickViewModal } from './components/QuickViewModal';

// Auth and Profile Pages
import Login from './pages/Login';
import Register from './pages/Register';
import FloristRegistrationWizard from './pages/FloristRegistrationWizard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import EmailSentConfirmation from './pages/EmailSentConfirmation';
import PendingApproval from './pages/PendingApproval';
import Unauthorized from './pages/Unauthorized';
import Forbidden from './pages/Forbidden';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import FloristPortal from './pages/FloristPortal';

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

    // 1. Dynamic parameterized routes (checking prefix)
    if (currentHash.startsWith('#/product/')) {
      return <ProductDetails />;
    }
    if (currentHash.startsWith('#/florist/')) {
      return <FloristProfile />;
    }
    if (currentHash.startsWith('#/blog/')) {
      return <BlogDetails />;
    }

    // Extract base hash without query string (e.g. #/verify-email?token=... -> #/verify-email)
    const baseHash = currentHash.split('?')[0] || '#/';

    // 2. Exact static routes
    switch (baseHash) {
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
        
      // Authentication and Profile Routes
      case '#/login':
        return <Login />;
      case '#/admin/login':
      case '#/super-admin/login':
        return <Login isAdminLogin={true} />;
      case '#/register':
        return <Register />;
      case '#/register/florist':
        return <FloristRegistrationWizard />;
      case '#/forgot-password':
        return <ForgotPassword />;
      case '#/reset-password':
        return <ResetPassword />;
      case '#/verify-email':
        return <VerifyEmail />;
      case '#/email-sent':
        return <EmailSentConfirmation />;
      case '#/pending-approval':
        return <PendingApproval />;
      case '#/unauthorized':
        return <Unauthorized />;
      case '#/forbidden':
        return <Forbidden />;
      case '#/profile':
        return <Profile />;
      case '#/admin':
        return <AdminDashboard />;
      case '#/florist-portal':
        return <FloristPortal />;
        
      default:
        return <NotFound />;
    }
  };

  return (
    <AuthProvider>
      <AppProvider>
        <Layout>
          {renderPage()}
          {/* Mount global quick view overlay portal */}
          <QuickViewModal />
        </Layout>
      </AppProvider>
    </AuthProvider>
  );
}
