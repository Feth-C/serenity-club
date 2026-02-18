// frontend/src/App.jsx

import AppRoutes from './routes/AppRoutes'; //
import { useContext } from 'react';
import { AuthContext } from './contexts/AuthContext';
import Header from './components/layout/Header';

function App() { //
  const { user } = useContext(AuthContext);

  return ( //
    <>
      {user && <Header user={user} />}
      <AppRoutes />
    </> // <AppRoutes /> 
  );
}

export default App;
