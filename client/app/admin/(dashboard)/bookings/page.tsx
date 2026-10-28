"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import { adminFetch } from "@/lib/admin/api";
import { adminKeys } from "@/lib/admin/query-keys";
import { StatusBadge } from "../../_components/status-badge";
import { ADMIN_PAGE_SIZE, Pagination } from "../../_components/pagination";

interface BookingListItem {
  id: string;
  short_id: string;
  date: string;
  status: string;
  customer_name: string;
  customer_email: string;
  num_guests: number;
  distance_miles: number | null;
  price: string | null;
  created_at: string;
}

const STATUSES = ["", "held", "confirmed", "cancelled"];

export default function BookingsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const params: Record<string, string> = { page: String(page) };
  if (statusFilter) params.status = statusFilter;
  if (search) params.search = search;

  const { data, isLoading } = useQuery({
    queryKey: adminKeys.bookings(params),
    queryFn: () => {
      const qs = new URLSearchParams();
      qs.set("page", String(page));
      if (statusFilter) qs.set("status", statusFilter);
      if (search) qs.set("search", search);
      return adminFetch<{ count: number; next: string | null; previous: string | null; results: BookingListItem[] }>(
        `/admin/bookings?${qs.toString()}`,
      );
    },
    placeholderData: keepPreviousData,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminFetch(`/admin/bookings/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
      toast.success("Booking status updated");
    },
    onError: () => toast.error("Failed to update"),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Event Bookings</h1>

      <div className="mt-4 flex gap-1.5">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              statusFilter === s
                ? "bg-[#5A1F1F] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {/* Search input */}
      <div className="mt-4">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by customer name..."
          className="w-full max-w-xs rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-[#5A1F1F] focus:outline-none focus:ring-4 focus:ring-[#5A1F1F]/10"
        />
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-4 py-3 font-semibold text-gray-500">ID</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Date</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Customer</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Guests</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Distance</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Price</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="py-12 text-center text-gray-400">Loading...</td></tr>
            ) : !data || data.results.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-gray-400">No bookings found</td></tr>
            ) : (
              data.results.map((b) => (
                <tr key={b.id} className="border-b border-gray-50 transition-colors hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/bookings/${b.id}`} className="font-mono text-xs font-semibold text-[#5A1F1F] hover:underline">
                      #{b.short_id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">{new Date(b.date).toLocaleDateString("en-GB")}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{b.customer_name || "—"}</p>
                    <p className="text-xs text-gray-400">{b.customer_email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{b.num_guests ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{b.distance_miles ? `${b.distance_miles.toFixed(0)} mi` : "—"}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{b.price ? `£${b.price}` : "—"}</td>
                  <td className="px-4 py-3">
                    <select
                      value={b.status}
                      onChange={(e) => statusMutation.mutate({ id: b.id, status: e.target.value })}
                      disabled={b.status === "cancelled"}
                      title={b.status === "cancelled" ? "Refunded bookings are locked" : undefined}
                      className="rounded-md border-0 bg-transparent py-0 text-xs font-semibold focus:ring-2 focus:ring-[#5A1F1F]/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {STATUSES.filter(Boolean).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {data && (
          <Pagination
            page={page}
            totalCount={data.count}
            pageSize={ADMIN_PAGE_SIZE}
            hasNext={Boolean(data.next)}
            hasPrev={Boolean(data.previous)}
            onChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
