import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import { SnackbarProvider } from 'notistack'
import ProtectedRoute from "./components/ProtectedRoute";
import Templates from "./pages/Templates";
import LoginPage from "./pages/LoginPage";
import Registration from "./pages/Registration";

import "./App.scss";

const App = () => {
  return (
    <UserProvider>
      <SnackbarProvider anchorOrigin={{vertical: 'top', horizontal: 'center'}} autoHideDuration={2000}>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/registration" element={<Registration />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Templates />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </div>
        </Router>
      </SnackbarProvider>
    </UserProvider>
  );
};

export default App;
