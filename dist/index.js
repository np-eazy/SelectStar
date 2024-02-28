import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
var root = document.createElement("div");
root.className = "container";
document.body.appendChild(root);
var rootDiv = ReactDOM.createRoot(root);
rootDiv.render(_jsx(React.StrictMode, { children: _jsx(App, {}) }));
