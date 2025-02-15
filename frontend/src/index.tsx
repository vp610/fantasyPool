import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from './App';
import store from './store/store';
import { supabase } from './db/supabase';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

export const SupabaseContext = React.createContext(supabase);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <SupabaseContext.Provider value={supabase}>
      <Provider store={store}>
        <AuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
      </Provider>
    </SupabaseContext.Provider>
  </React.StrictMode>
);
