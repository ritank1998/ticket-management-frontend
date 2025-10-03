import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';

 
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode className='min-h-full text-foreground bg-background '>
   <BrowserRouter>
      <main className="min-h-full ">
        <App />
      </main>
      </BrowserRouter>
  </React.StrictMode>,
);
 
reportWebVitals();