import { Outlet } from "react-router-dom";
import { ThemeProvider } from "./theme/ThemeProvider.js";

export function AppShell() {
  return (
    <ThemeProvider>
      <Outlet />
    </ThemeProvider>
  );
}
