import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/tasks", label: "Tasks" },
  { to: "/subjects", label: "Subjects" },
  { to: "/schedule", label: "Schedule" },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand-card">
        <span className="brand-logo">SS</span>
        <div>
          <h2>Planner</h2>
          <p>Organize tasks and study sessions.</p>
        </div>
      </div>

      <nav className="nav-links">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
