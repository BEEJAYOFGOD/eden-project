import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import Landing from "./pages/Landing";
import Location from "./pages/Location";
import CropSelection from "./pages/CropSelection";

import "./App.css";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/location" element={<Location />} />
                <Route path="/crops" element={<CropSelection />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
