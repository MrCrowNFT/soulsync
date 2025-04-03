import Navbar from "./components/navbar";
import { authNavItems, mainNavItems } from "./data/navbar-data";

function App() {
  return (
    <>
      <Navbar
        navItems={mainNavItems}
        authItems={authNavItems}
        logoSrc="../public/mental-health-icon.svg"
      />
    </>
  );
}

export default App;
