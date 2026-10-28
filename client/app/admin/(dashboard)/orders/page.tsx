"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import { adminFetch } from "@/lib/admin/api";
import { adminKeys } from "@/lib/admin/query-keys";
import { StatusBadge } from "../../_components/status-badge";
import { ADMIN_PAGE_SIZE, Pagination } from "../../_components/pagination";

interface OrderListItem {
  id: string;
  short_id: string;
  customer_name: string;
  customer_email: string;
  status: string;
  total: string;
  created_at: string;
  item_count: number;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
}

const STATUSES = ["", "pending", "paid", "shipped", "delivered", "cancelled"];

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const params: Record<string, string> = { page: String(page) };
  if (statusFilter) params.status = statusFilter;
  if (search) params.search = search;

  const { data, isLoading } = useQuery({
    queryKey: adminKeys.orders(params),
    queryFn: () => {
      const qs = new URLSearchParams();
      qs.set("page", String(page));
      if (statusFilter) qs.set("status", statusFilter);
      if (search) qs.set("search", search);
      return adminFetch<{ count: number; next: string | null; previous: string | null; results: OrderListItem[] }>(
        `/admin/orders?${qs.toString()}`,
      );
    },
    placeholderData: keepPreviousData,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminFetch(`/admin/orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      toast.success("Order status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Orders</h1>

      {/* Status filter tabs */}
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
          placeholder="Search by name or email..."
          className="w-full max-w-xs rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-[#5A1F1F] focus:outline-none focus:ring-4 focus:ring-[#5A1F1F]/10"
        />
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-4 py-3 font-semibold text-gray-500">Order</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Customer</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Ship to</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Items</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Total</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="py-12 text-center text-gray-400">Loading...</td></tr>
            ) : !data || data.results.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-gray-400">No orders found</td></tr>
            ) : (
              data.results.map((order) => (
                <tr key={order.id} className="border-b border-gray-50 transition-colors hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="font-mono text-xs font-semibold text-[#5A1F1F] hover:underline">
                      #{order.short_id}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{order.customer_name || "Guest"}</p>
                    <p className="text-xs text-gray-400">{order.customer_email}</p>
                  </td>
                  <td className="px-4 py-3">
                    {order.shipping_city ? (
                      <p className="text-sm text-gray-700">{order.shipping_city}, {order.shipping_postal_code}<br /><span className="text-xs text-gray-400">{order.shipping_country}</span></p>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{order.item_count}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">£{order.total}</td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(e) => statusMutation.mutate({ id: order.id, status: e.target.value })}
                      disabled={order.status === "cancelled"}
                      title={order.status === "cancelled" ? "Refunded orders are locked" : undefined}
                      className="rounded-md border-0 bg-transparent py-0 text-xs font-semibold focus:ring-2 focus:ring-[#5A1F1F]/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {STATUSES.filter(Boolean).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(order.created_at).toLocaleDateString("en-GB")}
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
