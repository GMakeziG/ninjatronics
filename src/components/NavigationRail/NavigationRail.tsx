import { NavLink } from "react-router-dom";
import "./NavigationRail.css";
import { navDestinations } from "./destinations.js";

export function NavigationRail() {
  return (
    <nav aria-label="Primary navigation" className="navigation-rail">
      <ul className="navigation-rail__list">
        {navDestinations.map((destination) => (
          <li key={destination.id} className="navigation-rail__item">
            <NavLink
              to={destination.to}
              className={({ isActive }) =>
                isActive ? "navigation-rail__link navigation-rail__link--active" : "navigation-rail__link"
              }
            >
              {destination.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
