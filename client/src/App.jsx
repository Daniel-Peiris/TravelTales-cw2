// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext.jsx';
import Navbar from './components/Layout/Navbar.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import BlogPost from './pages/BlogPost.jsx';
import CreateBlog from './pages/CreateBlog.jsx';
import EditBlog from './pages/EditBlog.jsx';
import Profile from './pages/Profile.jsx';
import Search from './pages/Search.jsx';
import Following from './pages/Following.jsx';
import ProtectedRoute from './components/Auth/ProtectedRoute.jsx';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/blog/:id" element={<BlogPost />} />
                <Route path="/search" element={<Search />} />
                <Route path="/user/:username" element={<Profile />} />
                <Route 
                  path="/create" 
                  element={
                    <ProtectedRoute>
                      <CreateBlog />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/edit/:id" 
                  element={
                    <ProtectedRoute>
                      <EditBlog />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/following" 
                  element={
                    <ProtectedRoute>
                      <Following />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
            <ToastContainer 
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
