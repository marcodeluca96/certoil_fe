import PageHeader from "@/components/PageHeader";
import type { ActionButton } from "@/types";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCertifications } from "@/store/slices/certificationSlice";
import type { RootState, AppDispatch } from "@/store";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SpinnerLoading } from "@/components/SpinnerLoading";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CertificazioniPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, currentPage, pageSize, totalCount } = useSelector(
    (state: RootState) => state.certification,
  );

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  useEffect(() => {
    dispatch(fetchCertifications({ page: currentPage, limit: pageSize }));
  }, [dispatch, currentPage, pageSize]);

  const handlePageChange = (newPage: number) => {
    dispatch(fetchCertifications({ page: newPage, limit: pageSize }));
  };

  const handlePageSizeChange = (value: string) => {
    dispatch(fetchCertifications({ page: 1, limit: Number(value) }));
  };

  /** Builds the array of page numbers (and "..." strings) to render */
  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "...")[] = [1];
    const left = Math.max(2, currentPage - 1);
    const right = Math.min(totalPages - 1, currentPage + 1);

    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push("...");
    pages.push(totalPages);
    return pages;
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
                  {/* <span
                    className={`cert-status ${isValid(cert.notarizationId) === "valid" ? "status-approved" : isValid(cert.notarizationId) === "expired" ? "status-expired" : ""}`}
                  >
                    {isValid(cert.notarizationId) === "valid" ? (
                      "Valid"
                    ) : isValid(cert.notarizationId) === "expired" ? (
                      "Expired"
                    ) : loadingLockMetadata === cert.notarizationId ? (
                      <Spinner />
                    ) : null}
                  </span> */}
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
                    variant="default"
                    onClick={() => window.open(cert.certificatePath, "_blank")}
                  >
                    Show Certificate
                  </Button>
                  {/* <Button
                    variant="outline"
                    onClick={() => dispatch(fetchLockMetadataCertifications(cert.notarizationId))}
                  >
                    Check Validity
                  </Button> */}
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/certificazioni/${cert.certificationId}`)}
                  >
                    Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8 pb-10">
            {/* Page size selector */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Show</span>
              <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-muted-foreground">per page</span>
            </div>

            {/* Numbered pagination */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {getPageNumbers().map((page, idx) =>
                page === "..." ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground select-none">
                    …
                  </span>
                ) : (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                )
              )}

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default CertificazioniPage;
