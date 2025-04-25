import React from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import App from './App';
import axios from 'axios';
import {DevSupport} from "@react-buddy/ide-toolbox";
import {ComponentPreviews, useInitial} from "./dev";

// Configure axios - no need to set baseURL when using proxy in package.json
axios.defaults.withCredentials = true;

// Create a root using the new React 18 API
const container = document.getElementById('root');
const root = createRoot(container);

// Render the app using the new API
root.render(
    <React.StrictMode>
        <DevSupport ComponentPreviews={ComponentPreviews}
                    useInitialHook={useInitial}
        >
            <App/>
        </DevSupport>
    </React.StrictMode>
);