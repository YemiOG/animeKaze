import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/application/App';

// Importing the Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/index.css';


ReactDOM.render(
  <React.StrictMode>
  <App />
  </React.StrictMode>,
  document.getElementById('root')
);

