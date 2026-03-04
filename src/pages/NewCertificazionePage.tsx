import PageHeader from "@/components/PageHeader";
import { Link, useNavigate } from "react-router-dom";

import { FieldGroup, FieldSet, Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { useMemo, useRef, useState } from "react";
import { API_URL } from "@/store/consts";
import { ArrowLeft, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

/** =======================
 *  Config
 *  ======================= */
const POST_URL = API_URL + "/api/certifications";
const MAX_FILE_MB = 10;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;
const ACCEPTED_MIME = ["application/pdf"] as const;
const ACCEPT_ATTR = ".pdf";

type Scheme = "EVOO" | "BIO" | "DOP" | "IGP" | "ALTRO";
type ProductClass = "extravergine" | "vergine" | "biologico" | "dop" | "igp";

type OilDataItem = {
  name: string;
  value: string; // keep as string like your example
  unit: string;
};

type CompanyData = {
  companyName: string;
  address: string;
  zipCode: string;
  city: string;
  province: string;
  vatNumber: string;
  taxCode: string;
  email: string;
  certifiedEmail: string;
  phoneNumber: string;
  website: string;
};

type ApiPayload = {
  oilData: OilDataItem[];
  companyData: CompanyData;
  // document is sent as multipart/form-data file, not inside JSON
  certificationExpireDate: string; // ISO string
  certificationNote: string;
};

type ErrorMap = Record<string, string>;

function todayYYYYMMDD() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  if (err && typeof err === "object" && "message" in err) {
    const m = (err as { message?: unknown }).message;
    if (typeof m === "string") return m;
  }
  return "Error while submitting";
}

function isEmailValid(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function isDuplicateFile(list: File[], f: File) {
  return list.some(
    (x) => x.name === f.name && x.size === f.size && x.lastModified === f.lastModified,
  );
}

function validateOneFile(f: File): string | null {
  if (!ACCEPTED_MIME.includes(f.type as (typeof ACCEPTED_MIME)[number])) {
    return `Unsupported file type: ${f.name}`;
  }
  if (f.size > MAX_FILE_BYTES) {
    return `File too large (max ${MAX_FILE_MB}MB): ${f.name}`;
  }
  return null;
}

function ErrorText({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-2 text-sm text-red-600">{msg}</p>;
}

function toIsoDateOrEmpty(yyyyMmDd: string): string {
  // Converts "2026-12-31" => "2026-12-31T00:00:00.000Z"
  if (!yyyyMmDd) return "";
  return new Date(`${yyyyMmDd}T00:00:00.000Z`).toISOString();
}

export default function NewCertificazionePage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  // ===== (You still have these, UI can keep them; not sent in new payload) =====
  const [scheme, setScheme] = useState<Scheme>("EVOO");
  const [productClass, setProductClass] = useState<ProductClass>("extravergine");
  const [issuedAt, setIssuedAt] = useState(todayYYYYMMDD());

  // ===== Oil analysis (used for oilData) =====
  const [oilMeasurements, setOilMeasurements] = useState<OilDataItem[]>([
    { name: "Acidità", value: "", unit: "%" },
    { name: "Perossidi", value: "", unit: "meq O2/kg" },
    { name: "Polifenoli", value: "", unit: "mg/kg" },
  ]);

  // ===== Company data (companyData) =====
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [email, setEmail] = useState("");
  const [certifiedEmail, setCertifiedEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [website, setWebsite] = useState("");

  // ===== Certification fields in requested payload =====
  const [expireDate, setExpireDate] = useState(""); // yyyy-mm-dd
  const [note, setNote] = useState("");

  // ===== Upload =====
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);

  // ===== UI state =====
  const [errors, setErrors] = useState<ErrorMap>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitOk, setSubmitOk] = useState("");
  const [submitError, setSubmitError] = useState("");

  /** Example business rule */
  const acidityBusinessError = useMemo(() => {
    if (productClass !== "extravergine") return "";
    const acidityRow = oilMeasurements.find((m) => m.name.toLowerCase().includes("acidit"));
    if (!acidityRow) return "";
    const a = Number(acidityRow.value);
    if (!Number.isFinite(a)) return "";
    if (a > 0.8) return "For extra virgin olive oil, acidity must be ≤ 0.8%";
    return "";
  }, [oilMeasurements, productClass]);

  function clearError(key: string) {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  /** ===== Build payload (EXACT requested shape) ===== */
  const payloadDraft: ApiPayload = useMemo(() => {
    return {
      oilData: oilMeasurements.map((m) => ({
        ...m,
        name: m.name.trim(),
        value: m.value.trim(),
        unit: m.unit.trim(),
      })),
      companyData: {
        companyName: companyName.trim(),
        address: address.trim(),
        zipCode: zipCode.trim(),
        city: city.trim(),
        province: province.trim(),
        vatNumber: vatNumber.trim(),
        taxCode: taxCode.trim(),
        email: email.trim(),
        certifiedEmail: certifiedEmail.trim(),
        phoneNumber: phoneNumber.trim(),
        website: website.trim(),
      },
      certificationExpireDate: toIsoDateOrEmpty(expireDate),
      certificationNote: note.trim(),
    };
  }, [
    oilMeasurements,
    companyName,
    address,
    zipCode,
    city,
    province,
    vatNumber,
    taxCode,
    email,
    certifiedEmail,
    phoneNumber,
    website,
    expireDate,
    note,
  ]);

  /** ===== Validate ===== */
  function validate(): boolean {
    const e: ErrorMap = {};

    // OilData required (as your example shows)
    const hasEmptyMeasurements = oilMeasurements.some((m) => !m.name.trim() || !m.value.trim());
    if (hasEmptyMeasurements) {
      e["oil.data"] = "Please fill in all measurement names and values or remove empty rows.";
    }

    if (acidityBusinessError) e["oil.data"] = acidityBusinessError;

    // Company data required
    if (!companyName.trim()) e["company.companyName"] = "Company name is required";
    if (!address.trim()) e["company.address"] = "Address is required";
    if (!zipCode.trim()) e["company.zipCode"] = "ZIP code is required";
    if (!city.trim()) e["company.city"] = "City is required";
    if (!province.trim()) e["company.province"] = "Province is required";
    if (!vatNumber.trim()) e["company.vatNumber"] = "VAT number is required";
    if (!taxCode.trim()) e["company.taxCode"] = "Tax code is required";

    if (!email.trim()) e["company.email"] = "Email is required";
    else if (!isEmailValid(email)) e["company.email"] = "Email is not valid";

    // Optional but recommended
    if (certifiedEmail.trim() && !isEmailValid(certifiedEmail)) {
      e["company.certifiedEmail"] = "Certified email (PEC) is not valid";
    }

    // Certification fields required by your example
    if (!expireDate.trim()) e["certification.expireDate"] = "Expire date is required";

    if (!note.trim()) e["certification.note"] = "Certification note is required";

    // Document: your payload shows a single document.
    // We enforce at least 1 file uploaded.
    if (files.length === 0) e["document"] = "Please upload at least one document";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  /** ===== Upload ===== */
  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function addFiles(newOnes: File[]) {
    setSubmitError("");
    setSubmitOk("");

    setFiles((prev) => {
      const next = [...prev];
      for (const f of newOnes) {
        if (isDuplicateFile(next, f)) continue;

        const err = validateOneFile(f);
        if (err) {
          setSubmitError(err);
          return prev;
        }
        next.push(f);
      }
      return next;
    });

    clearError("document");
  }

  function onFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length) addFiles(picked);
    e.target.value = "";
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files ?? []);
    if (dropped.length) addFiles(dropped);
  }

  /** ===== Submit ===== */
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    setSubmitOk("");

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const fd = new FormData();

      // JSON payload
      fd.append("oilData", JSON.stringify(payloadDraft.oilData));
      fd.append("companyData", JSON.stringify(payloadDraft.companyData));

      fd.append("certificationExpireDate", payloadDraft.certificationExpireDate);

      fd.append("certificationNote", JSON.stringify(payloadDraft.certificationNote));

      // "document": send the file(s) as multipart (backend treats as File/Binary)
      // If you truly want ONLY ONE, just send the first one: files[0]
      files.forEach((f) => fd.append("document", f));

      const res = await fetch(POST_URL, { method: "POST", body: fd });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        toast.error(t || `Server error (${res.status})`);
      } else {
        toast.success("Submitted successfully.");
        setFiles([]);
        setErrors({});
        navigate("/certificazioni");
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

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
        pageTitle="New Oil Certification"
        pageSubtitle="Fill in the data and upload the document"
      />

      {submitOk && (
        <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900">
          ✓ {submitOk}
        </div>
      )}
      {submitError && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-900">
          ✕ {submitError}
        </div>
      )}

      <div className="mt-6 rounded-xl bg-white p-6 md:p-10 shadow-lg border border-slate-100">
        <form className="space-y-10" onSubmit={onSubmit}>
          {/* ========= BASIC (optional UI fields you already had) ========= */}
          <section>
            <h2 className="text-xl font-semibold text-secondary pb-3 border-b-2 border-secondary">
              Basic
            </h2>

            <FieldSet className="mt-6">
              <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field>
                  <FieldLabel htmlFor="issuedAt">Issued At</FieldLabel>
                  <Input
                    id="issuedAt"
                    type="date"
                    value={issuedAt}
                    onChange={(e) => setIssuedAt(e.target.value)}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="scheme">Scheme</FieldLabel>
                  <Select value={scheme} onValueChange={(v) => setScheme(v as Scheme)}>
                    <SelectTrigger id="scheme">
                      <SelectValue placeholder="Select scheme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EVOO">EVOO</SelectItem>
                      <SelectItem value="BIO">BIO</SelectItem>
                      <SelectItem value="DOP">DOP</SelectItem>
                      <SelectItem value="IGP">IGP</SelectItem>
                      <SelectItem value="ALTRO">OTHER</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="productClass">Product Class</FieldLabel>
                  <Select
                    value={productClass}
                    onValueChange={(v) => setProductClass(v as ProductClass)}
                  >
                    <SelectTrigger id="productClass">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="extravergine">Extra Virgin</SelectItem>
                      <SelectItem value="vergine">Virgin</SelectItem>
                      <SelectItem value="biologico">Organic</SelectItem>
                      <SelectItem value="dop">DOP</SelectItem>
                      <SelectItem value="igp">IGP</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>
            </FieldSet>
          </section>

          {/* ========= OIL DATA ========= */}
          <section>
            <div className="flex justify-between items-center pb-3 border-b-2 border-secondary">
              <h2 className="text-xl font-semibold text-secondary">Oil data</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-primary-green border-primary-green hover:bg-primary-green/5 gap-2"
                onClick={() => {
                  setOilMeasurements((prev) => [...prev, { name: "", value: "", unit: "" }]);
                }}
              >
                <Plus className="h-4 w-4" /> Add Measurement
              </Button>
            </div>

            <FieldSet className="mt-6">
              <div className="space-y-4">
                {oilMeasurements.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col md:flex-row gap-4 items-end animate-in fade-in slide-in-from-left-2 duration-300"
                  >
                    <Field className="flex-1">
                      {idx === 0 && <FieldLabel>Name *</FieldLabel>}
                      <Input
                        placeholder="e.g. Acidity"
                        value={m.name}
                        onChange={(e) => {
                          const next = [...oilMeasurements];
                          next[idx].name = e.target.value;
                          setOilMeasurements(next);
                          clearError("oil.data");
                        }}
                      />
                    </Field>
                    <Field className="w-full md:w-32">
                      {idx === 0 && <FieldLabel>Value *</FieldLabel>}
                      <Input
                        placeholder="0.4"
                        value={m.value}
                        onChange={(e) => {
                          const next = [...oilMeasurements];
                          next[idx].value = e.target.value;
                          setOilMeasurements(next);
                          clearError("oil.data");
                        }}
                      />
                    </Field>
                    <Field className="w-full md:w-32">
                      {idx === 0 && <FieldLabel>Unit</FieldLabel>}
                      <Input
                        placeholder="%"
                        value={m.unit}
                        onChange={(e) => {
                          const next = [...oilMeasurements];
                          next[idx].unit = e.target.value;
                          setOilMeasurements(next);
                        }}
                      />
                    </Field>
                    <div className={idx === 0 ? "pb-0.5" : ""}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                        onClick={() => {
                          setOilMeasurements((prev) => prev.filter((_, i) => i !== idx));
                        }}
                        disabled={oilMeasurements.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <ErrorText msg={errors["oil.data"]} />

              {acidityBusinessError && (
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 text-sm">
                  ⚠️ {acidityBusinessError}
                </div>
              )}
            </FieldSet>
          </section>

          {/* ========= COMPANY DATA ========= */}
          <section>
            <h2 className="text-xl font-semibold text-secondary pb-3 border-b-2 border-secondary">
              Company data
            </h2>

            <FieldSet className="mt-6">
              <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field>
                  <FieldLabel htmlFor="companyName">Company name *</FieldLabel>
                  <Input
                    id="companyName"
                    placeholder="Oleificio Rossi S.r.l."
                    value={companyName}
                    onChange={(e) => {
                      setCompanyName(e.target.value);
                      clearError("company.companyName");
                    }}
                  />
                  <ErrorText msg={errors["company.companyName"]} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="vatNumber">VAT number *</FieldLabel>
                  <Input
                    id="vatNumber"
                    placeholder="IT12345678901"
                    value={vatNumber}
                    onChange={(e) => {
                      setVatNumber(e.target.value);
                      clearError("company.vatNumber");
                    }}
                  />
                  <ErrorText msg={errors["company.vatNumber"]} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="taxCode">Tax code *</FieldLabel>
                  <Input
                    id="taxCode"
                    placeholder="12345678901"
                    value={taxCode}
                    onChange={(e) => {
                      setTaxCode(e.target.value);
                      clearError("company.taxCode");
                    }}
                  />
                  <ErrorText msg={errors["company.taxCode"]} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="email">Email *</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="info@oleificiorossi.it"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearError("company.email");
                    }}
                  />
                  <ErrorText msg={errors["company.email"]} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="certifiedEmail">Certified email (PEC)</FieldLabel>
                  <Input
                    id="certifiedEmail"
                    type="email"
                    placeholder="amministrazione@pec.oleificiorossi.it"
                    value={certifiedEmail}
                    onChange={(e) => {
                      setCertifiedEmail(e.target.value);
                      clearError("company.certifiedEmail");
                    }}
                  />
                  <ErrorText msg={errors["company.certifiedEmail"]} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="phoneNumber">Phone number</FieldLabel>
                  <Input
                    id="phoneNumber"
                    placeholder="+39 055 1234567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="website">Website</FieldLabel>
                  <Input
                    id="website"
                    placeholder="https://www.oleificiorossi.it"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </Field>

                <Field className="md:col-span-2">
                  <FieldLabel htmlFor="address">Address *</FieldLabel>
                  <Input
                    id="address"
                    placeholder="Via delle Olive 42"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      clearError("company.address");
                    }}
                  />
                  <ErrorText msg={errors["company.address"]} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="zipCode">ZIP code *</FieldLabel>
                  <Input
                    id="zipCode"
                    placeholder="50100"
                    value={zipCode}
                    onChange={(e) => {
                      setZipCode(e.target.value);
                      clearError("company.zipCode");
                    }}
                  />
                  <ErrorText msg={errors["company.zipCode"]} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="city">City *</FieldLabel>
                  <Input
                    id="city"
                    placeholder="Firenze"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      clearError("company.city");
                    }}
                  />
                  <ErrorText msg={errors["company.city"]} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="province">Province *</FieldLabel>
                  <Input
                    id="province"
                    placeholder="FI"
                    value={province}
                    onChange={(e) => {
                      setProvince(e.target.value);
                      clearError("company.province");
                    }}
                  />
                  <ErrorText msg={errors["company.province"]} />
                </Field>
              </FieldGroup>
            </FieldSet>
          </section>

          {/* ========= CERTIFICATION META ========= */}
          <section>
            <h2 className="text-xl font-semibold text-secondary pb-3 border-b-2 border-secondary">
              Certification details
            </h2>

            <FieldSet className="mt-6">
              <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field>
                  <FieldLabel htmlFor="expireDate">Certification expire date *</FieldLabel>
                  <Input
                    id="expireDate"
                    type="date"
                    value={expireDate}
                    onChange={(e) => {
                      setExpireDate(e.target.value);
                      clearError("certification.expireDate");
                    }}
                  />
                  <ErrorText msg={errors["certification.expireDate"]} />
                </Field>

                <Field className="md:col-span-2">
                  <FieldLabel htmlFor="note">Certification note *</FieldLabel>
                  <Textarea
                    id="note"
                    className="min-h-[120px]"
                    placeholder="e.g. Extra virgin quality certification - Lot A123"
                    value={note}
                    onChange={(e) => {
                      setNote(e.target.value);
                      clearError("certification.note");
                    }}
                  />
                  <ErrorText msg={errors["certification.note"]} />
                </Field>
              </FieldGroup>
            </FieldSet>
          </section>

          {/* ========= DOCUMENT ========= */}
          <section>
            <h2 className="text-xl font-semibold text-secondary pb-3 border-b-2 border-secondary">
              Document
            </h2>

            <FieldSet className="mt-6">
              <FieldGroup className="grid grid-cols-1 gap-6">
                <Field>
                  <FieldLabel htmlFor="attachments">Upload document *</FieldLabel>

                  <div
                    onClick={openFilePicker}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                    className={[
                      "rounded-lg border-2 border-dashed p-8 text-center transition cursor-pointer",
                      dragOver
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-slate-200 bg-slate-50 hover:border-emerald-400 hover:bg-white",
                    ].join(" ")}
                  >
                    <div className="text-3xl mb-2">📎</div>
                    <div className="text-sm text-slate-600">
                      <strong className="text-emerald-700">Click to upload</strong> or drag & drop
                      <br />
                      <span className="text-xs text-slate-500">
                        PDF, JPG, PNG (Max {MAX_FILE_MB}MB)
                      </span>
                    </div>

                    {files.length > 0 && (
                      <div className="mt-4 text-left">
                        <p className="text-xs font-semibold text-slate-700 mb-2">
                          Selected files ({files.length})
                        </p>

                        <ul className="space-y-2">
                          {files.map((f, idx) => (
                            <li
                              key={`${f.name}-${f.size}-${f.lastModified}`}
                              className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm text-slate-800">{f.name}</p>
                                <p className="text-xs text-slate-500">
                                  {(f.size / (1024 * 1024)).toFixed(2)} MB — {f.type || "unknown"}
                                </p>
                              </div>

                              <Button
                                type="button"
                                variant="outline"
                                className="h-8 px-3"
                                onClick={(ev) => {
                                  ev.stopPropagation();
                                  removeFile(idx);
                                }}
                              >
                                Remove
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    id="attachments"
                    type="file"
                    multiple
                    accept={ACCEPT_ATTR}
                    className="hidden"
                    onChange={onFileInputChange}
                  />

                  <ErrorText msg={errors["document"]} />
                </Field>
              </FieldGroup>
            </FieldSet>
          </section>

          {/* ========= Actions ========= */}
          <div className="flex flex-col md:flex-row gap-3 justify-end pt-8 border-t border-slate-200">
            <Button asChild variant="outline" className="h-11 px-6">
              <Link to="/certificazioni">Cancel</Link>
            </Button>

            <Button
              type="submit"
              className="h-11 px-6 bg-emerald-700 hover:bg-emerald-800"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
