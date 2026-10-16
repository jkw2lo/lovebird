import { createRoot } from 'react-dom/client';
import '@fontsource/fraunces/400.css';
import '@fontsource/fraunces/500.css';
import '@fontsource/fraunces/400-italic.css';
import '@fontsource-variable/inter';
import './styles.css';
import App from './App.jsx';
import { boot } from './lib/store.js';

boot().then(() => {
  createRoot(document.getElementById('root')).render(<App />);
});
