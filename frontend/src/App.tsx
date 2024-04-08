import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Templates from "./pages/Templates";
import LoginPage from "./pages/LoginPage";
import Registration from "./pages/Registration";

import "./App.scss";

const App = () => {
  return (
    <UserProvider>
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
    </UserProvider>
  );
};

export default App;
