import { Link, useLocation } from "react-router-dom";
import logo from "../assets/certoil_logo.png";

const Navbar = () => {
	const location = useLocation();

	const getActiveClassByPath = (path: string): "active" | "" => {
		return location.pathname === path ? "active" : "";
	};

	return (
		<header>
			<div className="header-content">
				<div className="logo">
					<img src={logo} alt="CertOIL Logo" style={{ height: "40px" }} />
				</div>
				<nav>
					<Link to={"/"} className={getActiveClassByPath("/")}>
						Home
					</Link>
					<Link
						to={"/certificazioni"}
						className={getActiveClassByPath("/certificazioni")}
					>
						Certification
					</Link>
				</nav>
			</div>
		</header>
	);
};

export default Navbar;
