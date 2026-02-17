import { Route, Routes } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import CertificazioniPage from "./pages/CertificazioniPage";
import NewCertificazionePage from "./pages/NewCertificazionePage";

function App() {
	return (
		<div>
			<Navbar />
			<main>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/certificazioni" element={<CertificazioniPage />} />
					<Route path="/new-certificazione" element={<NewCertificazionePage />} />
				</Routes>
			</main>
		</div>
	);
}

export default App;
