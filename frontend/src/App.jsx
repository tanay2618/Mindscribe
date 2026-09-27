import { Route, Routes } from "react-router-dom";
import { AnalysisProvider } from "./context/AnalysisContext.jsx";
import Nav from "./components/Nav.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Journal from "./pages/Journal.jsx";
import Results from "./pages/Results.jsx";
import PipelineTrace from "./pages/PipelineTrace.jsx";

export default function App() {
  return (
    <AnalysisProvider>
      <div className="app-shell">
        <Nav />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/results" element={<Results />} />
            <Route path="/pipeline" element={<PipelineTrace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AnalysisProvider>
  );
}
