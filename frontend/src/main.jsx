import { StrictMode } from 'react'
import React from "react";
import { createRoot } from 'react-dom/client'
import ReactDOM from "react-dom/client";
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import {Provider} from "react-redux";
import {store} from './app/store.js'
import './index.css'
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
       <App />
       </BrowserRouter>
    </Provider>
  </React.StrictMode>
)
