import React, { useContext, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CreateItem = lazy(() => import('./pages/CreateItem'));
const ItemDetails = lazy(() => import('./pages/ItemDetails'));
const Inbox = lazy(() => import('./pages/Inbox'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

const PageLoader = () => (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: '20px' }}>
        <div className="loading-spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(136, 116, 194, 0.1)', borderTop: '3px solid #8874C2', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
    </div>
);

const RootRoute = () => {
    const { user, loading } = useContext(AuthContext);
    
    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh', gap: '20px' }}>
                <div className="loading-spinner" style={{ width: '50px', height: '50px', border: '4px solid rgba(136, 116, 194, 0.1)', borderTop: '4px solid #8874C2', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <p style={{ color: '#8874C2', fontWeight: 500, fontSize: '1.1rem' }}>Bringing your campus closer...</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }
    
    return user ? <Navigate to="/explore" /> : <Login />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Decorative Background Blobs */}
        <div className="bg-blob bg-blob-1"></div>
        <div className="bg-blob bg-blob-2"></div>
        
        <Navbar />
        
        <main>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<RootRoute />} />
              <Route path="/explore" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/items/:id" element={<ItemDetails />} />
              
              {/* Protected Routes */}
              <Route element={<PrivateRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/create" element={<CreateItem />} />
                  <Route path="/edit/:id" element={<CreateItem />} />
                  <Route path="/inbox" element={<Inbox />} />
                  <Route path="/admin" element={<AdminPanel />} />
              </Route>
            </Routes>
          </Suspense>
        </main>
        
        <ToastContainer position="bottom-right" theme="colored" />
      </Router>
    </AuthProvider>
  );
}

export default App;
