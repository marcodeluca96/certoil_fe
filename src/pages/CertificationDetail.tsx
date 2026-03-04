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
import {
  ArrowLeft,
  FileText,
  Calendar,
  Building2,
  Hash,
  MapPin,
  Mail,
  Phone,
  Globe,
  CreditCard,
  AtSign,
  ShieldCheck,
  ShieldAlert,
  Lock,
} from "lucide-react";
import type { ActionButton } from "@/types";

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

  // const isValid = (notarizationId: string): "valid" | "expired" | "not-found" => {
  //   const data = lockMetadata.find((item) => item.notarizationId === notarizationId);
  //   if (!data) {
  //     return "not-found";
  //   }
  //   //se deleteLockDate converted to date is minor than today is expired
  //   if (new Date(data.deleteLockDate).getTime() < Date.now()) {
  //     return "expired";
  //   }
  //   return "valid";
  // };

  const actionBtns: ActionButton[] = [
    {
      label: "Show Certificate",
      onClick: () => window.open(certification.certificatePath, "_blank"),
      variant: "default",
      size: "default",
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/certificazioni")}
          className="mb-4 hover:bg-primary-green/5 text-primary-green cursor-pointer"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Certifications
        </Button>
      </div>

      <PageHeader
        pageTitle={`Certification: ${certification.certificationCode}`}
        pageSubtitle="Complete details and technical data for this certification"
        actionBtns={actionBtns}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-1 space-y-8">
          {/* Company Identity Card */}
          <Card className="shadow-sm border-light-green/20 overflow-hidden h-fit">
            <CardHeader className="bg-primary-green/5 border-b border-light-green/10">
              <CardTitle className="flex items-center text-primary-green">
                <Building2 className="mr-2 h-5 w-5 text-accent-gold" />
                Company Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Basic Identity */}
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Company Name
                  </span>
                  <p className="text-xl font-bold text-primary-green tracking-tight">
                    {certification.companyName}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center">
                      <CreditCard className="mr-1 h-3 w-3" /> VAT Number
                    </span>
                    <p className="text-sm font-medium">{certification.vatNumber || "-"}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center">
                      <Hash className="mr-1 h-3 w-3" /> Tax Code
                    </span>
                    <p className="text-sm font-medium">{certification.taxCode || "-"}</p>
                  </div>
                </div>
              </div>

              <Separator className="bg-light-green/10" />

              {/* Location */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center">
                  <MapPin className="mr-1 h-3 w-3 text-accent-gold" /> Location
                </span>
                <div className="text-sm space-y-0.5">
                  <p className="font-medium">{certification.address}</p>
                  <p className="text-muted-foreground">
                    {certification.zipCode} {certification.city} ({certification.province})
                  </p>
                </div>
              </div>

              <Separator className="bg-light-green/10" />

              {/* Contact Details */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Contact Information
                </span>

                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2 group">
                    <Mail className="h-4 w-4 text-accent-gold/70" />
                    <a
                      href={`mailto:${certification.email}`}
                      className="hover:text-primary-green hover:underline truncate"
                    >
                      {certification.email}
                    </a>
                  </div>
                  {certification.certifiedEmail && (
                    <div className="flex items-center gap-2 group">
                      <AtSign className="h-4 w-4 text-accent-gold/70" />
                      <a
                        href={`mailto:${certification.certifiedEmail}`}
                        className="hover:text-primary-green hover:underline truncate text-xs italic"
                      >
                        {certification.certifiedEmail}{" "}
                        <span className="text-[9px] not-italic font-bold bg-primary-green/10 px-1 rounded ml-1 text-primary-green">
                          PEC
                        </span>
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 group">
                    <Phone className="h-4 w-4 text-accent-gold/70" />
                    <a
                      href={`tel:${certification.phoneNumber}`}
                      className="hover:text-primary-green hover:underline"
                    >
                      {certification.phoneNumber}
                    </a>
                  </div>
                  {certification.website && (
                    <div className="flex items-center gap-2 group">
                      <Globe className="h-4 w-4 text-accent-gold/70" />
                      <a
                        href={
                          certification.website.startsWith("http")
                            ? certification.website
                            : `https://${certification.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary-green hover:underline truncate"
                      >
                        {certification.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security & Status Card */}
          <Card className="shadow-sm border-light-green/20 overflow-hidden h-fit">
            <CardHeader className="bg-primary-green/5 border-b border-light-green/10">
              <CardTitle className="flex items-center text-primary-green">
                <Lock className="mr-2 h-5 w-5 text-accent-gold" />
                Security & Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Status
                  </span>
                  <div className="flex items-center">
                    {certification.isExpired ? (
                      <span className="flex items-center text-expired font-bold text-sm">
                        <ShieldAlert className="mr-1 h-4 w-4" /> Expired
                      </span>
                    ) : (
                      <span className="flex items-center text-valid font-bold text-sm">
                        <ShieldCheck className="mr-1 h-4 w-4" /> Valid
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-right">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Code
                  </span>
                  <p className="font-mono text-xs font-bold text-primary-green">
                    {certification.certificationCode}
                  </p>
                </div>
              </div>

              <Separator className="bg-light-green/10" />

              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center">
                  <Lock className="mr-1 h-3 w-3 text-accent-gold" /> Protection Date
                </span>
                <p className="text-sm font-medium">
                  Locked until:{" "}
                  {new Date(certification.deleteLockDate).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  This certification is protected and cannot be modified or deleted until the date
                  above.
                </p>
              </div>

              <Separator className="bg-light-green/10" />

              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center">
                  <Hash className="mr-1 h-3 w-3 text-accent-gold" /> Notarization Proof
                </span>
                <div className="bg-muted/30 p-2 rounded border border-light-green/5">
                  <p className="text-[10px] font-mono break-all text-muted-foreground leading-relaxed">
                    {certification.notarizationId}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center">
                  <Calendar className="mr-1 h-3 w-3" /> Issued On
                </span>
                <p className="text-sm font-medium">
                  {new Date(certification.certificationCreatedAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

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
