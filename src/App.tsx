import { Route, Routes } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import CertificazioniPage from "./pages/CertificazioniPage";
import NewCertificazionePage from "./pages/NewCertificazionePage";
import CertificationDetail from "./pages/CertificationDetail";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <div>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/certificazioni" element={<CertificazioniPage />} />
          <Route path="/new-certificazione" element={<NewCertificazionePage />} />
          <Route path="/certificazioni/:id" element={<CertificationDetail />} />
        </Routes>
      </main>
      <Toaster />
    </div>
  );
}

export default App;
