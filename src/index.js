import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './tailwind.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Enable React strict mode in development but not in production
// This helps with identifying potential problems but
// can cause performance issues from double-rendering
const StrictModeWrapper = process.env.NODE_ENV === 'development' 
  ? React.StrictMode 
  : React.Fragment;

// Create root using the new React 18 concurrent features
const root = createRoot(document.getElementById('root'));

// Preload important images/fonts to improve initial load performance
const preloadResources = () => {
  // Add preloads for critical fonts or images if needed
  const resources = [
    // Add your critical resource URLs here
  ];
  
  resources.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = url.endsWith('.woff2') || url.endsWith('.woff') ? 'font' : 'image';
    if (link.as === 'font') {
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
  });
};

// Add performance specific code
if (process.env.NODE_ENV === 'production') {
  preloadResources();
}

// Render the application
root.render(
  <StrictModeWrapper>
    <App />
  </StrictModeWrapper>
);

// Measure and report web vitals
reportWebVitals(metric => {
  // Only log in development or send to analytics in production
  if (process.env.NODE_ENV === 'development') {
    console.log(metric);
  } else {
    // Send metrics to your analytics platform here
    // Example: sendToAnalytics(metric);
  }
});
