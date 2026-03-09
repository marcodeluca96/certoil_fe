import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import type { CertificationHistoryResponse } from "@/types/certification";
import { toast } from "sonner";
import { API_URL } from "@/store/consts";
import { SpinnerLoading } from "@/components/SpinnerLoading";

const HistoryCertByCompanyPage = () => {
  const navigate = useNavigate();
  const { id: certificationId, companyId } = useParams();
  const [certificationHistory, setCertificationHistory] =
    useState<CertificationHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_URL}/api/certifications/history/${companyId}`)
      .then((response) => {
        setCertificationHistory(response.data);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Error fetching certification history");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [companyId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <SpinnerLoading message="Loading certification history..." />
      </div>
    );
  }

  if (!certificationHistory) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h2 className="text-2xl font-semibold mb-2 text-primary-green">
          Certification History Not Found
        </h2>
        <p className="text-muted-foreground mb-6">
          The certification history you are looking for does not exist or has been removed.
        </p>
        <Button
          onClick={() => navigate(`/certificazioni/${certificationId}`)}
          className="bg-primary-green hover:bg-secondary-green"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back to Detail
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/certificazioni/${certificationId}`)}
          className="mb-4 hover:bg-primary-green/5 text-primary-green cursor-pointer"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Certification Detail
        </Button>
      </div>

      <PageHeader
        pageTitle={`Certification History`}
        pageSubtitle={
          "History of certifications of the company " + certificationHistory.data[0].companyName
        }
        actionBtns={[]}
      />
    </div>
  );
};

export default HistoryCertByCompanyPage;
