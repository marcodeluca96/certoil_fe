import PageHeader from "@/components/PageHeader";
import type { ActionButton } from "@/types";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <>
      <PageHeader
        pageTitle="Oil Certifications"
        pageSubtitle="Manage and monitor all your quality certifications"
        actionBtns={actionBtns}
      />
      <div className="cards-grid">
        <Card className="cert-card">
          <CardHeader className="cert-header">
            <div className="cert-code">CERT-2026-001</div>
            <span className="cert-status status-approved">Approvata</span>
          </CardHeader>
          <CardContent className="cert-info">
            <div className="info-row">
              <span className="info-label">Produttore</span>
              <span className="info-value">Oleificio Toscano</span>
            </div>
            <div className="info-row">
              <span className="info-label">Data Certificazione</span>
              <span className="info-value">15/01/2026</span>
            </div>
            <div className="info-row">
              <span className="info-label">Validità</span>
              <span className="info-value">15/01/2027</span>
            </div>
          </CardContent>
          <CardFooter className="cert-actions">
            <Button variant="outline">Visualizza</Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default CertificazioniPage;
