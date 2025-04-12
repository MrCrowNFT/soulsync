import { Route, Routes } from "react-router-dom";
import Footer from "./components/footer";
import Navbar from "./components/navbar";
import Home from "./pages/home";
import Dashboard from "./pages/dashboard";
import Chat from "./components/chat";

//todo ROUTES
function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/home" element={<Home/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/chat" element={<Chat/>}/>
      </Routes>
      <Footer />
    </>
  );
}

export default App;
