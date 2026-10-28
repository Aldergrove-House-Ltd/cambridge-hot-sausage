"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminFetch } from "@/lib/admin/api";
import { adminKeys } from "@/lib/admin/query-keys";

interface BlockedDate {
  id: number;
  date: string;
  reason: string;
}

export default function BlockedDatesPage() {
  const queryClient = useQueryClient();
  const [newDate, setNewDate] = useState("");
  const [newReason, setNewReason] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: adminKeys.blockedDates(),
    queryFn: async () => {
      const res = await adminFetch<{ results: BlockedDate[] } | BlockedDate[]>("/admin/blocked-dates");
      return Array.isArray(res) ? res : res.results;
    },
  });

  const addMutation = useMutation({
    mutationFn: (payload: { date: string; reason: string }) =>
      adminFetch("/admin/blocked-dates", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "blocked-dates"] });
      setNewDate("");
      setNewReason("");
      toast.success("Date blocked");
    },
    onError: () => toast.error("Failed to block date"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      adminFetch(`/admin/blocked-dates/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "blocked-dates"] });
      toast.success("Date unblocked");
    },
    onError: () => toast.error("Failed to unblock date"),
  });

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newDate) return;
    addMutation.mutate({ date: newDate, reason: newReason });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Blocked Dates</h1>

      {/* Add form */}
      <form onSubmit={handleAdd} className="mt-6 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Add Blocked Date</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="blocked-date" className="mb-1 block text-xs font-medium text-gray-500">Date</label>
            <input
              id="blocked-date"
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              required
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#5A1F1F] focus:ring-2 focus:ring-[#5A1F1F]/20"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="blocked-reason" className="mb-1 block text-xs font-medium text-gray-500">Reason</label>
            <input
              id="blocked-reason"
              type="text"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              placeholder="Optional reason"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#5A1F1F] focus:ring-2 focus:ring-[#5A1F1F]/20"
            />
          </div>
          <button
            type="submit"
            disabled={addMutation.isPending}
            className="rounded-lg bg-[#5A1F1F] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#5A1F1F]/90 disabled:opacity-50"
          >
            {addMutation.isPending ? "Adding..." : "Add"}
          </button>
        </div>
      </form>

      {/* List */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-4 py-3 font-semibold text-gray-500">Date</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Reason</th>
              <th className="px-4 py-3 font-semibold text-gray-500" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={3} className="py-12 text-center text-gray-400">Loading...</td></tr>
            ) : !data || data.length === 0 ? (
              <tr><td colSpan={3} className="py-12 text-center text-gray-400">No blocked dates</td></tr>
            ) : (
              data.map((bd) => (
                <tr key={bd.id} className="border-b border-gray-50 transition-colors hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-800">{new Date(bd.date).toLocaleDateString("en-GB")}</td>
                  <td className="px-4 py-3 text-gray-600">{bd.reason || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate(bd.id)}
                      disabled={deleteMutation.isPending}
                      className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 ring-1 ring-red-200 transition-colors hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
