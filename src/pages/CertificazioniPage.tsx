import PageHeader from "@/components/PageHeader";
import type { ActionButton } from "@/types";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCertifications,
  fetchLockMetadataCertifications,
} from "@/store/slices/certificationSlice";
import type { RootState, AppDispatch } from "@/store";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { SpinnerLoading } from "@/components/SpinnerLoading";

const CertificazioniPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, currentPage, pageSize, lockMetadata, loadingLockMetadata } = useSelector(
    (state: RootState) => state.certification,
  );

  useEffect(() => {
    dispatch(fetchCertifications({ page: currentPage, limit: pageSize }));
  }, [dispatch, currentPage, pageSize]);

  const handlePageChange = (newPage: number) => {
    dispatch(fetchCertifications({ page: newPage, limit: pageSize }));
  };

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

  const isValid = (notarizationId: string): "valid" | "expired" | "not-found" => {
    const data = lockMetadata.find((item) => item.notarizationId === notarizationId);
    if (!data) {
      return "not-found";
    }
    //se deleteLockDate converted to date is minor than today is expired
    if (new Date(data.deleteLockDate).getTime() < Date.now()) {
      return "expired";
    }
    return "valid";
  };

  return (
    <>
      <PageHeader
        pageTitle="Oil Certifications"
        pageSubtitle="Manage and monitor all your quality certifications"
        actionBtns={actionBtns}
      />
      {loading && (
        <div className="flex w-full justify-center">
          <SpinnerLoading message="Loading certifications..." />
        </div>
      )}
      {!loading && items.length === 0 && (
        <div className="text-center py-10">No certifications found.</div>
      )}
      {!loading && items.length > 0 && (
        <>
          <div className="cards-grid">
            {items.map((cert) => (
              <Card key={cert.certificationId} className="cert-card">
                <CardHeader className="cert-header">
                  <div className="cert-code">{cert.certificationCode}</div>
                  <span
                    className={`cert-status ${isValid(cert.notarizationId) === "valid" ? "status-approved" : isValid(cert.notarizationId) === "expired" ? "status-expired" : ""}`}
                  >
                    {isValid(cert.notarizationId) === "valid" ? (
                      "Valid"
                    ) : isValid(cert.notarizationId) === "expired" ? (
                      "Expired"
                    ) : loadingLockMetadata === cert.notarizationId ? (
                      <Spinner />
                    ) : null}
                  </span>
                </CardHeader>
                <CardContent className="cert-info">
                  <div className="info-row">
                    <span className="info-label">Company</span>
                    <span className="info-value">{cert.companyName}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Create date</span>
                    <span className="info-value">
                      {new Date(cert.certificationCreatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="cert-actions">
                  <Button
                    variant="outline"
                    onClick={() => window.open(cert.certificatePath, "_blank")}
                  >
                    Show Certificate
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => dispatch(fetchLockMetadataCertifications(cert.notarizationId))}
                  >
                    Check Validity
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="flex justify-center items-center gap-4 mt-8 pb-10">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </Button>
            <span className="font-medium text-sm">Page {currentPage}</span>
            <Button
              variant="outline"
              disabled={items.length < pageSize}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </>
  );
};

export default CertificazioniPage;
