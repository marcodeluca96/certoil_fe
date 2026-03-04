import PageHeader from "@/components/PageHeader";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import type { Certification } from "@/types/certification";
import { toast } from "sonner";
import { API_URL } from "@/store/consts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SpinnerLoading } from "@/components/SpinnerLoading";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, FileText, Calendar, Building2, Hash } from "lucide-react";

const CertificationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [certification, setCertification] = useState<Certification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_URL}/api/certifications/${id}`)
      .then((response) => {
        setCertification(response.data.data);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Error fetching certification detail");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <SpinnerLoading message="Loading certification details..." />
      </div>
    );
  }

  if (!certification) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h2 className="text-2xl font-semibold mb-2 text-primary-green">Certification Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The certification you are looking for does not exist or has been removed.
        </p>
        <Button
          onClick={() => navigate("/certificazioni")}
          className="bg-primary-green hover:bg-secondary-green"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back to List
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/certificazioni")}
          className="mb-4 hover:bg-primary-green/5 text-primary-green"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Certifications
        </Button>
      </div>

      <PageHeader
        pageTitle={`Certification: ${certification.certificationCode}`}
        pageSubtitle="Complete details and technical data for this certification"
        actionBtns={[
          {
            label: "Show Certificate PDF",
            onClick: () => window.open(certification.certificatePath, "_blank"),
            variant: "default",
            size: "default",
          },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Main Info Card */}
        <Card className="lg:col-span-1 shadow-sm border-light-green/20 overflow-hidden">
          <CardHeader className="bg-primary-green/5 border-b border-light-green/10">
            <CardTitle className="flex items-center text-primary-green">
              <Building2 className="mr-2 h-5 w-5 text-accent-gold" />
              General Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center">
                <Building2 className="mr-1 h-3 w-3" /> Company
              </span>
              <p className="text-lg font-bold text-primary-green">{certification.companyName}</p>
            </div>

            <Separator className="bg-light-green/10" />

            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center">
                <Hash className="mr-1 h-3 w-3" /> Certification Code
              </span>
              <p className="font-mono text-sm bg-bg-cream/50 p-2 rounded-md border border-light-green/10">
                {certification.certificationCode}
              </p>
            </div>

            <Separator className="bg-light-green/10" />

            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center">
                <Calendar className="mr-1 h-3 w-3" /> Issue Date
              </span>
              <p className="text-md text-foreground/80">
                {new Date(certification.certificationCreatedAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <Separator className="bg-light-green/10" />

            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center">
                <div className="w-2 h-2 mr-1 rounded-full bg-accent-gold" /> Notarization ID
              </span>
              <p className="text-[10px] font-mono break-all text-muted-foreground bg-muted/30 p-2 rounded leading-relaxed">
                {certification.notarizationId}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Oil Data Grid */}
        <Card className="lg:col-span-2 shadow-sm border-light-green/20 overflow-hidden">
          <CardHeader className="bg-primary-green/5 border-b border-light-green/10">
            <CardTitle className="flex items-center text-primary-green">
              <FileText className="mr-2 h-5 w-5 text-accent-gold" />
              Oil Data Measurements
            </CardTitle>
            <CardDescription>
              Laboratory analysis results for this specific oil batch
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certification.oilData?.map((item, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border border-light-green/10 bg-gradient-to-br from-white to-bg-cream/20 hover:border-accent-gold/30 hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-semibold text-muted-foreground group-hover:text-primary-green transition-colors">
                      {item.data.name}
                    </span>
                    <span className="px-2 py-0.5 mt-1 rounded text-[10px] font-semibold border border-accent-gold/30 text-accent-gold bg-accent-gold/5 uppercase tracking-tighter">
                      {item.data.unit}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-primary-green">{item.data.value}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CertificationDetail;
