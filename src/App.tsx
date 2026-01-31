import { Route, Routes } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import CertificazioniPage from "./pages/CertificazioniPage";

function App() {
	return (
		<div>
			<Navbar />
			<main>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/certificazioni" element={<CertificazioniPage />} />
				</Routes>
			</main>
		</div>
	);
}

export default App;
