import React from 'react';
import { createRoot } from 'react-dom/client';
import { StoreProvider } from './lib/store.js';
import Layout from './components/Layout.js';

const App = () => {
    return React.createElement(StoreProvider, null,
        React.createElement(Layout, null)
    );
};

const root = createRoot(document.getElementById('root'));
root.render(React.createElement(App));
