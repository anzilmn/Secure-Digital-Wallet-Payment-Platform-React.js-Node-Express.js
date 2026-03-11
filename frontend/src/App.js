import React from 'react';
import { BrowserRouter,Routes,Route,Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider,useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Wallet from './pages/Wallet';
import Send from './pages/Send';
import Transactions from './pages/Transactions';
import Profile from './pages/Profile';
import MerchantPanel from './pages/MerchantPanel';
import AdminDashboard from './pages/AdminDashboard';
import PaymentPage from './pages/PaymentPage';
import QRPage from './pages/QRPage';
import MoneyRequests from './pages/MoneyRequests';
import Analytics from './pages/Analytics';
import Scheduled from './pages/Scheduled';

const Prot=({children,roles})=>{ const{user,loading}=useAuth(); if(loading)return<div className="loading"><div className="spinner"/></div>; if(!user)return<Navigate to="/login"/>; if(roles&&!roles.includes(user.role))return<Navigate to="/dashboard"/>; return children; };

export default function App(){
  return(
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{duration:3500,style:{fontFamily:'Sora,sans-serif',borderRadius:'12px'}}}/>
        <Routes>
          <Route path="/login"    element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/pay/:link" element={<PaymentPage/>}/>
          <Route path="/" element={<Prot><Layout/></Prot>}>
            <Route index element={<Navigate to="/dashboard"/>}/>
            <Route path="dashboard"    element={<Dashboard/>}/>
            <Route path="wallet"       element={<Wallet/>}/>
            <Route path="send"         element={<Send/>}/>
            <Route path="transactions" element={<Transactions/>}/>
            <Route path="qr"           element={<QRPage/>}/>
            <Route path="requests"     element={<MoneyRequests/>}/>
            <Route path="analytics"    element={<Analytics/>}/>
            <Route path="scheduled"    element={<Scheduled/>}/>
            <Route path="profile"      element={<Profile/>}/>
            <Route path="merchant"     element={<Prot roles={['merchant','admin']}><MerchantPanel/></Prot>}/>
            <Route path="admin"        element={<Prot roles={['admin']}><AdminDashboard/></Prot>}/>
          </Route>
          <Route path="*" element={<Navigate to="/dashboard"/>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
