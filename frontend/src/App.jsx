import React from 'react';
import {Navigate,Route,Routes} from 'react-router-dom';
import {AuthProvider,useAuth} from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import PHCs from './pages/PHCs';
import Inventory from './pages/Inventory';
import Alerts from './pages/Alerts';
import Predictions from './pages/Predictions';
import Transfers from './pages/Transfers';
import MapView from './pages/MapView';
import Copilot from './pages/Copilot';
import Shell from './components/Shell';
function Private({children}){const {user}=useAuth();return user?<Shell>{children}</Shell>:<Navigate to="/login" replace/>}
export default function App(){return <AuthProvider><Routes><Route path="/login" element={<Login/>}/><Route path="/signup" element={<Signup/>}/><Route path="/" element={<Navigate to="/dashboard" replace/>}/><Route path="/dashboard" element={<Private><Dashboard/></Private>}/><Route path="/phcs" element={<Private><PHCs/></Private>}/><Route path="/inventory" element={<Private><Inventory/></Private>}/><Route path="/alerts" element={<Private><Alerts/></Private>}/><Route path="/predictions" element={<Private><Predictions/></Private>}/><Route path="/transfers" element={<Private><Transfers/></Private>}/><Route path="/map" element={<Private><MapView/></Private>}/><Route path="/copilot" element={<Private><Copilot/></Private>}/><Route path="*" element={<Navigate to="/dashboard" replace/>}/></Routes></AuthProvider>}
