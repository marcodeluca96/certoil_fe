import PageHeader from "@/components/PageHeader";
import type { ActionButton } from "@/types";

const CertificazioniPage = () => {
	const actionBtns: ActionButton[] = [
		{
			label: "+ Nuova Certificazione",
			onClick: () => {},
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
