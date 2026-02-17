import PageHeader from "@/components/PageHeader";
import type { ActionButton } from "@/types";
import { useNavigate } from "react-router-dom";

const CertificazioniPage = () => {
	const navigate = useNavigate();

	const actionBtns: ActionButton[] = [
		{
			label: "+ Nuova Certificazione",
			onClick: () => {
				navigate("/new-certificazione");
			},
			variant: "default",
			size: "lg",
		},
	];

	return (
		<PageHeader
			pageTitle="Certificazioni Oli"
			pageSubtitle="Gestisci e monitora tutte le certificazioni di qualità"
			actionBtns={actionBtns}
		/>
	);
};

export default CertificazioniPage;
