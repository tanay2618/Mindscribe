import { NavLink } from "react-router-dom";
import { useAnalysis } from "../context/AnalysisContext.jsx";
import StatusIndicator from "./StatusIndicator.jsx";

export default function Nav() {
  const { result } = useAnalysis();
  const hasResult = Boolean(result);

  return (
    <header className="nav">
      <div className="nav__inner">
        <NavLink to="/" className="nav__mark">
          MindScribe
        </NavLink>
        <nav>
          <ul className="nav__links">
            <li>
              <NavLink
                to="/"
                end
                className={({ isActive }) => `nav__link${isActive ? " is-active" : ""}`}
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/journal"
                className={({ isActive }) => `nav__link${isActive ? " is-active" : ""}`}
              >
                Journal
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/results"
                aria-disabled={!hasResult}
                className={({ isActive }) => `nav__link${isActive ? " is-active" : ""}`}
              >
                Results
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/pipeline"
                aria-disabled={!hasResult}
                className={({ isActive }) => `nav__link${isActive ? " is-active" : ""}`}
              >
                Pipeline Trace
              </NavLink>
            </li>
          </ul>
        </nav>
        <StatusIndicator />
      </div>
    </header>
  );
}
