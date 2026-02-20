import PageHeader from "@/components/PageHeader";
import { Link } from "react-router-dom";

import { FieldGroup, FieldSet, Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

import { useMemo, useRef, useState } from "react";

/** =======================
 *  Config
 *  ======================= */
const POST_URL = "http://localhost:3005/api/certifications";
const MAX_FILE_MB = 10;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;
const ACCEPTED_MIME = ["application/pdf", "image/jpeg", "image/png"] as const;
const ACCEPT_ATTR = ".pdf,.jpg,.jpeg,.png";

type Scheme = "EVOO" | "BIO" | "DOP" | "IGP" | "ALTRO";
type ProductClass = "extravergine" | "vergine" | "biologico" | "dop" | "igp";

type OilDataItem = {
  name: "Acidità" | "Perossidi" | "Polifenoli";
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
  return list.some((x) => x.name === f.name && x.size === f.size && x.lastModified === f.lastModified);
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

  // ===== (You still have these, UI can keep them; not sent in new payload) =====
  const [scheme, setScheme] = useState<Scheme>("EVOO");
  const [productClass, setProductClass] = useState<ProductClass>("extravergine");
  const [issuedAt, setIssuedAt] = useState(todayYYYYMMDD());

  // ===== Oil analysis (used for oilData) =====
  const [acidityPct, setAcidityPct] = useState("");
  const [peroxides, setPeroxides] = useState("");
  const [polyphenols, setPolyphenols] = useState("");

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
    const a = Number(acidityPct);
    if (!Number.isFinite(a)) return "";
    if (a > 0.8) return "For extra virgin olive oil, acidity must be ≤ 0.8%";
    return "";
  }, [acidityPct, productClass]);

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
    const oilData: OilDataItem[] = [
      { name: "Acidità", value: acidityPct.trim(), unit: "%" },
      { name: "Perossidi", value: peroxides.trim(), unit: "meq O2/kg" },
      { name: "Polifenoli", value: polyphenols.trim(), unit: "mg/kg" },
    ];

    return {
      oilData,
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
    acidityPct,
    peroxides,
    polyphenols,
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
    if (!acidityPct.trim()) e["oil.acidity"] = "Acidity is required";
    if (!peroxides.trim()) e["oil.peroxides"] = "Peroxides are required";
    if (!polyphenols.trim()) e["oil.polyphenols"] = "Polyphenols are required";

    if (acidityBusinessError) e["oil.acidity"] = acidityBusinessError;

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

      fd.append("certificationExpireDate", (payloadDraft.certificationExpireDate));

      fd.append("certificationNote", JSON.stringify(payloadDraft.certificationNote));

      // "document": send the file(s) as multipart (backend treats as File/Binary)
      // If you truly want ONLY ONE, just send the first one: files[0]
      files.forEach((f) => fd.append("document", f));

      const res = await fetch(POST_URL, { method: "POST", body: fd });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `Server error (${res.status})`);
      }

      setSubmitOk("Submitted successfully.");
      setFiles([]);
      setErrors({});
      // Optionally reset fields:
      // setAcidityPct(""); setPeroxides(""); setPolyphenols(""); ...
    } catch (err: unknown) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader pageTitle="New Oil Certification" pageSubtitle="Fill in the data and upload the document" />

      <div className="mx-auto max-w-[980px] px-4 pb-10">
        <Link
          to="/certificazioni"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-700 transition-colors"
        >
          <span className="text-base">←</span> Back to certifications
        </Link>

        {submitOk && (
          <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900">
            ✓ {submitOk}
          </div>
        )}
        {submitError && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-900">✕ {submitError}</div>
        )}

        <div className="mt-6 rounded-xl bg-white p-6 md:p-10 shadow-lg border border-slate-100">
          <form className="space-y-10" onSubmit={onSubmit}>
            {/* ========= BASIC (optional UI fields you already had) ========= */}
            <section>
              <h2 className="text-xl font-semibold text-emerald-900 pb-3 border-b-2 border-emerald-200">Basic</h2>

              <FieldSet className="mt-6">
                <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field>
                    <FieldLabel htmlFor="issuedAt">Issued At</FieldLabel>
                    <Input id="issuedAt" type="date" value={issuedAt} onChange={(e) => setIssuedAt(e.target.value)} />
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
                    <Select value={productClass} onValueChange={(v) => setProductClass(v as ProductClass)}>
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
              <h2 className="text-xl font-semibold text-emerald-900 pb-3 border-b-2 border-emerald-200">Oil data</h2>

              <FieldSet className="mt-6">
                <FieldGroup className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Field>
                    <FieldLabel htmlFor="acidityPct">Acidity (%) *</FieldLabel>
                    <Input
                      id="acidityPct"
                      type="number"
                      step="0.01"
                      placeholder="0.4"
                      value={acidityPct}
                      onChange={(e) => {
                        setAcidityPct(e.target.value);
                        clearError("oil.acidity");
                      }}
                    />
                    <ErrorText msg={errors["oil.acidity"]} />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="peroxides">Peroxides (meq O2/kg) *</FieldLabel>
                    <Input
                      id="peroxides"
                      type="number"
                      step="0.1"
                      placeholder="5.2"
                      value={peroxides}
                      onChange={(e) => {
                        setPeroxides(e.target.value);
                        clearError("oil.peroxides");
                      }}
                    />
                    <ErrorText msg={errors["oil.peroxides"]} />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="polyphenols">Polyphenols (mg/kg) *</FieldLabel>
                    <Input
                      id="polyphenols"
                      type="number"
                      step="1"
                      placeholder="350"
                      value={polyphenols}
                      onChange={(e) => {
                        setPolyphenols(e.target.value);
                        clearError("oil.polyphenols");
                      }}
                    />
                    <ErrorText msg={errors["oil.polyphenols"]} />
                  </Field>
                </FieldGroup>

                {acidityBusinessError && (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 text-sm">
                    ⚠️ {acidityBusinessError}
                  </div>
                )}
              </FieldSet>
            </section>

            {/* ========= COMPANY DATA ========= */}
            <section>
              <h2 className="text-xl font-semibold text-emerald-900 pb-3 border-b-2 border-emerald-200">Company data</h2>

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
              <h2 className="text-xl font-semibold text-emerald-900 pb-3 border-b-2 border-emerald-200">
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
              <h2 className="text-xl font-semibold text-emerald-900 pb-3 border-b-2 border-emerald-200">Document</h2>

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
                        <span className="text-xs text-slate-500">PDF, JPG, PNG (Max {MAX_FILE_MB}MB)</span>
                      </div>

                      {files.length > 0 && (
                        <div className="mt-4 text-left">
                          <p className="text-xs font-semibold text-slate-700 mb-2">Selected files ({files.length})</p>

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

              <Button type="submit" className="h-11 px-6 bg-emerald-700 hover:bg-emerald-800" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
