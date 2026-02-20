import PageHeader from "@/components/PageHeader";
import type { ActionButton } from "@/types";
import { useNavigate } from "react-router-dom";

const CertificazioniPage = () => {
	const navigate = useNavigate();

	const actionBtns: ActionButton[] = [
		{
			label: "+ New Certification",
			onClick: () => {
				navigate("/new-certificazione");
			},
			variant: "default",
			size: "lg",
		},
	];

	return (
		<PageHeader
			pageTitle="Oil Certifications"
			pageSubtitle="Manage and monitor all your quality certifications"
			actionBtns={actionBtns}
		/>
	);
};

export default CertificazioniPage;
