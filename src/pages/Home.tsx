import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  FileCheck2,
  ShieldCheck,
  ScanSearch,
  UploadCloud,
  Link2,
} from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] ">
      {/* HERO */}
      <section className="mx-auto max-w-[1100px] px-4 pt-10 pb-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-10 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-[680px]">
              <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                <ShieldCheck className="h-4 w-4" />
                Trust & Traceability
              </p>

              <h1 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
                Notarized quality certifications
              </h1>

              <p className="mt-3 text-slate-600 leading-relaxed">
                Manage and monitor all quality certifications, attach documents
                (e.g. lab reports) and create immutable proof: the backend builds
                the hash and notarizes it on the ledger.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button
                  asChild
                  className="h-11 px-6 bg-emerald-700 hover:bg-emerald-800"
                >
                  <Link to="/new-certificazione">
                    New certification <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

               
              </div>
            </div>

            {/* Right mini panel */}
            <div className="w-full md:w-[360px]">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Total</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">10</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Pending</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">5</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Notarized</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">2</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Last update</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">17/02/2026</p>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                <span className="font-semibold">Tip:</span> whenever you attach a
                report, its hash is computed and “linked” to the certificate.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-[1100px] px-4 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-100 p-2">
                <FileCheck2 className="h-5 w-5 text-slate-700" />
              </div>
              <h3 className="font-semibold text-slate-900">Structured data</h3>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Clear fields for lot, origin, analytical parameters and audit:
              less ambiguity, more verifiability.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-100 p-2">
                <UploadCloud className="h-5 w-5 text-slate-700" />
              </div>
              <h3 className="font-semibold text-slate-900">Attachments & hash</h3>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Upload PDFs/images, the backend generates SHA-256 and associates it
              to the certificate: tamper-evident proof.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-100 p-2">
                <ScanSearch className="h-5 w-5 text-slate-700" />
              </div>
              <h3 className="font-semibold text-slate-900">Easy verification</h3>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Anyone receiving the certificate can verify that the payload and
              documents match the notarized hash.
            </p>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-2">
              <Link2 className="h-5 w-5 text-emerald-700" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">How it works</h2>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                step: "1",
                title: "Fill in",
                desc: "Enter certification, lot, origin and analysis data.",
              },
              {
                step: "2",
                title: "Attach",
                desc: "Upload reports and documents (PDF/JPG/PNG).",
              },
              {
                step: "3",
                title: "Hash & Notarize",
                desc: "The backend canonicalizes the payload and notarizes the hash.",
              },
              {
                step: "4",
                title: "Verify",
                desc: "Anyone can verify integrity and matching data.",
              },
            ].map((x) => (
              <div
                key={x.step}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-700 text-white text-sm font-semibold">
                    {x.step}
                  </div>
                  <p className="font-semibold text-slate-900">{x.title}</p>
                </div>
                <p className="mt-2 text-sm text-slate-600">{x.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Ready to create your first certification?
              </p>
              <p className="text-sm text-slate-600">
                Create a complete record and attach the documents right away.
              </p>
            </div>

            <Button
              asChild
              className="h-11 px-6 bg-emerald-700 hover:bg-emerald-800"
            >
              <Link to="/certificazioni">
                Start now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
