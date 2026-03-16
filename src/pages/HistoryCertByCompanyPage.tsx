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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText } from "lucide-react";

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

      <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="font-semibold text-slate-700">Certification Code</TableHead>
              <TableHead className="font-semibold text-slate-700">Created At</TableHead>
              <TableHead className="font-semibold text-slate-700">Expiry Date</TableHead>
              <TableHead className="font-semibold text-slate-700">Notes</TableHead>
              <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {certificationHistory.data.map((cert) => (
              <TableRow
                key={cert.certificationId}
                className="hover:bg-slate-50/50 transition-colors"
              >
                <TableCell className="font-medium text-primary-green">
                  {cert.certificationCode}
                </TableCell>
                <TableCell>
                  {new Date(cert.certificationCreatedAt).toLocaleDateString("it-IT", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell>
                  {new Date(cert.certificationExpiryDate).toLocaleDateString("it-IT", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell className="max-w-[200px] truncate" title={cert.certificationNote || ""}>
                  {cert.certificationNote || "-"}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary-green text-primary-green hover:bg-primary-green hover:text-white cursor-pointer"
                    onClick={() => window.open(cert.certificatePath, "_blank")}
                  >
                    <FileText className="mr-2 h-4 w-4" /> View Certificate
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default HistoryCertByCompanyPage;
