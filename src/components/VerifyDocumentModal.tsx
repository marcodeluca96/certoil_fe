import React, { useState, useRef } from "react";
import { X, UploadCloud, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { API_URL } from "@/store/consts";
import axios from "axios";

interface VerifyDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  notarizationId: string;
}

interface VerificationResult {
  match: boolean;
  actualContent?: string;
  expectedContent?: string;
}

export const VerifyDocumentModal: React.FC<VerifyDocumentModalProps> = ({
  isOpen,
  onClose,
  notarizationId,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleVerify = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setIsVerifying(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("notarizationId", notarizationId);

    try {
      const response = await axios.post(`${API_URL}/iota/verify`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        setResult({
          match: response.data.match,
          actualContent: response.data.actualContent,
          expectedContent: response.data.expectedContent,
        });
      } else {
        toast.error("Verification failed on server");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during verification");
    } finally {
      setIsVerifying(false);
    }
  };

  const resetAndClose = () => {
    setFile(null);
    setResult(null);
    setIsVerifying(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-primary-green/5">
          <h3 className="text-lg font-bold text-primary-green">Verify Document</h3>
          <button
            onClick={resetAndClose}
            className="text-muted-foreground hover:text-primary-green transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {!result ? (
            <div className="space-y-6">
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
                  ${file ? "border-primary-green bg-primary-green/5" : "border-muted-foreground/20 hover:border-primary-green hover:bg-primary-green/5"}
                `}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf"
                />
                <UploadCloud
                  className={`h-12 w-12 mx-auto mb-4 ${file ? "text-primary-green" : "text-muted-foreground"}`}
                />
                {file ? (
                  <div className="space-y-1">
                    <p className="font-medium text-primary-green">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-secondary">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF document only</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={resetAndClose}
                  disabled={isVerifying}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-primary-green hover:bg-secondary-green gap-2"
                  onClick={handleVerify}
                  disabled={!file || isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                    </>
                  ) : (
                    "Verify Now"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 animate-in zoom-in duration-500">
              {result.match ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <CheckCircle2 className="h-24 w-24 text-valid animate-in zoom-in-50 duration-500" />
                    <div className="absolute inset-0 bg-valid/20 rounded-full animate-ping -z-10" />
                  </div>
                  <h4 className="text-2xl font-bold text-primary-green">Verified!</h4>
                  <p className="text-muted-foreground">
                    The document content matches exactly with the information registered on the
                    blockchain.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <XCircle className="h-24 w-24 text-expired animate-in shake duration-500" />
                  </div>
                  <h4 className="text-2xl font-bold text-expired">Verification Failed</h4>
                  <p className="text-muted-foreground">
                    This document does not match the original version registered under this
                    Notarization ID.
                  </p>
                  {/* <div className="bg-expired/5 p-4 rounded-lg text-left text-xs font-mono break-all space-y-2 border border-expired/10">
                    <div>
                      <span className="font-bold text-expired opacity-70">Expected:</span>
                      <p className="opacity-80">{result.expectedContent}</p>
                    </div>
                    <div>
                      <span className="font-bold text-expired opacity-70">Actual:</span>
                      <p className="opacity-80">{result.actualContent}</p>
                    </div>
                  </div> */}
                </div>
              )}

              <Button className="mt-8 w-full" variant="outline" onClick={() => setResult(null)}>
                Try Another File
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
