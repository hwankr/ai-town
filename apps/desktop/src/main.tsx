import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProviders } from './app/providers/AppProviders';
import { HomeRoute } from './app/routes/HomeRoute';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <HomeRoute />
    </AppProviders>
  </React.StrictMode>
);
