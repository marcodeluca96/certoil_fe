import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";
import { ArrowLeft, ArrowUpDown, FileText, MoreHorizontal } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type { ColumnDef, SortingState, PaginationState } from "@tanstack/react-table";

type HistoryCertItem = CertificationHistoryResponse["data"][number];

const HistoryCertByCompanyPage = () => {
  const navigate = useNavigate();
  const { id: certificationId, companyId } = useParams();
  const [certificationHistory, setCertificationHistory] =
    useState<CertificationHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  useEffect(() => {
    setLoading(true);

    const sortBy = sorting.length > 0 ? sorting[0].id : undefined;
    const sortOrder = sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : undefined;
    const page = pagination.pageIndex + 1;
    const limit = pagination.pageSize;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (sortBy && sortOrder) {
      queryParams.append("sortBy", sortBy);
      queryParams.append("sortOrder", sortOrder);
    }

    axios
      .get(`${API_URL}/api/certifications/history/${companyId}?${queryParams.toString()}`)
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
  }, [companyId, sorting, pagination.pageIndex, pagination.pageSize]);

  const columns: ColumnDef<HistoryCertItem>[] = [
    {
      accessorKey: "certificationCode",
      header: () => <div className="font-semibold text-slate-700">Certification Code</div>,
      cell: ({ row }) => (
        <div className="font-medium text-primary-green">{row.getValue("certificationCode")}</div>
      ),
    },
    {
      accessorKey: "createdAt",
      id: "createdAt",
      accessorFn: (row) => row.certificationCreatedAt,
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-semibold text-slate-700 hover:bg-white/20 p-0 hover:text-slate-900 cursor-pointer"
          >
            Created At
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return new Date(row.getValue("createdAt")).toLocaleDateString("it-IT", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      },
    },
    {
      accessorKey: "expiryDate",
      id: "expiryDate",
      accessorFn: (row) => row.certificationExpiryDate,
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-semibold text-slate-700 hover:bg-white/20 p-0 hover:text-slate-900 cursor-pointer"
          >
            Expiry Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return new Date(row.getValue("expiryDate")).toLocaleDateString("it-IT", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      },
    },
    {
      accessorKey: "certificationNote",
      header: () => <div className="font-semibold text-slate-700">Notes</div>,
      cell: ({ row }) => {
        const note = row.getValue<string | null>("certificationNote");
        return (
          <div className="max-w-[200px] truncate" title={note || ""}>
            {note || "-"}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      header: () => <div className="font-semibold text-slate-700 text-right"></div>,
      cell: ({ row }) => {
        const cert = row.original;

        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer hover:bg-slate-100">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4 text-slate-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border-slate-200">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => window.open(cert.certificatePath, "_blank")}
                  className="cursor-pointer text-primary-green focus:bg-primary-green/10 hover:bg-[#7fa650]/5"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View Certificate
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: certificationHistory?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    manualPagination: true,
    manualSorting: true,
    state: {
      sorting,
      pagination,
    },
  });

  if (loading && !certificationHistory) {
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

  const companyName =
    certificationHistory.data?.length > 0 ? certificationHistory.data[0].companyName : "Unknown";

  const hasMoreData = certificationHistory.data?.length === pagination.pageSize;

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
        pageSubtitle={`History of certifications of the company ${companyName}`}
        actionBtns={[]}
      />

      <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 z-10 bg-white/50 flex items-center justify-center min-h-[200px]">
            <SpinnerLoading message="" />
          </div>
        )}
        <Table>
          <TableHeader className="bg-[#4a7c2c]/15">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-[#7fa650]/5 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        <div className="flex items-center justify-end space-x-2 py-4 px-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={pagination.pageIndex === 0}
            className="cursor-pointer"
          >
            Previous
          </Button>
          <span className="text-sm px-2 mt-1">Page {pagination.pageIndex + 1}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!hasMoreData}
            className="cursor-pointer"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HistoryCertByCompanyPage;
