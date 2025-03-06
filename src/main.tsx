import { createRoot } from 'react-dom/client'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import {AuthProvider } from '@/contexts/AuthContext';


ReactDOM.createRoot(document.getElementById("root")!).render(
    <AuthProvider>
    <App />
    </AuthProvider>
);
