import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import styles from './App.module.css';

function App() {
  return (
    <BrowserRouter>
      <div className={styles.app}>
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
}

export default App;
