/**
 * Root Application Shell.
 * Responsible for loading global styles and mounting the primary page layout.
 */
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "./index.css";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Dashboard />
  );
}

export default App;