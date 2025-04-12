import { Route, Routes } from "react-router-dom";
import Footer from "./components/footer";
import Navbar from "./components/navbar";

//todo ROUTES
function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/home" element={}/>
      </Routes>
      <Footer />
    </>
  );
}

export default App;
