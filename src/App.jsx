import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Landing from './pages/Landing';
import VerifyOTP from './pages/VerifyOTP';
import './App.scss';
import Chat from './pages/Chat';

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <Router>
        <div className="app">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/" element={<Navigate to="/landing" replace />} />
          </Routes>
          <ToastContainer />
        </div>
      </Router>
    </ConfigProvider>
  );
}

export default App;
