import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';
import { ThemeProvider } from './theme/ThemeContext';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider><App /></ThemeProvider>
    </Provider>
  </StrictMode>,
);
