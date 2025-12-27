import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import GoalTracker2026 from './goal_tracker_2026';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <GoalTracker2026 />
  </React.StrictMode>
);