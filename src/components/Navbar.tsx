import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
	const location = useLocation();

	const getActiveClassByPath = (path: string): "active" | "" => {
		return location.pathname === path ? "active" : "";
	};

	return (
		<header>
			<div className="header-content">
				<div className="logo">CERTOIL</div>
				<nav>
					<Link to={"/"} className={getActiveClassByPath("/")}>
						Home
					</Link>
					<Link
						to={"/certificazioni"}
						className={getActiveClassByPath("/certificazioni")}
					>
						Certificazioni
					</Link>
				</nav>
			</div>
		</header>
	);
};

export default Navbar;
