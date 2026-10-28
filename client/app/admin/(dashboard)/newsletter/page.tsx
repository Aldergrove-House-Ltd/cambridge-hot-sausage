"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminFetch } from "@/lib/admin/api";
import { adminKeys } from "@/lib/admin/query-keys";

interface SubscriberListItem {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
}

export default function NewsletterPage() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const params: Record<string, string> = {};
  if (search) params.search = search;

  const { data, isLoading } = useQuery({
    queryKey: adminKeys.subscribers(Object.keys(params).length > 0 ? params : undefined),
    queryFn: () => {
      const qs = new URLSearchParams();
      if (search) qs.set("search", search);
      const queryString = qs.toString();
      return adminFetch<{ count: number; results: SubscriberListItem[] }>(
        `/admin/subscribers${queryString ? `?${queryString}` : ""}`,
      );
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      adminFetch(`/admin/subscribers/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_active }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "subscribers"] });
      toast.success("Subscriber updated");
    },
    onError: () => toast.error("Failed to update subscriber"),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Newsletter Subscribers</h1>

      {/* Search input */}
      <div className="mt-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-full max-w-xs rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-[#5A1F1F] focus:outline-none focus:ring-4 focus:ring-[#5A1F1F]/10"
        />
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-4 py-3 font-semibold text-gray-500">Email</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Active</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Subscribed</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={3} className="py-12 text-center text-gray-400">Loading...</td></tr>
            ) : !data || data.results.length === 0 ? (
              <tr><td colSpan={3} className="py-12 text-center text-gray-400">No subscribers found</td></tr>
            ) : (
              data.results.map((sub) => (
                <tr key={sub.id} className="border-b border-gray-50 transition-colors hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-800">{sub.email}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleMutation.mutate({ id: sub.id, is_active: !sub.is_active })}
                      disabled={toggleMutation.isPending}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${
                        sub.is_active ? "bg-green-500" : "bg-gray-300"
                      }`}
                      role="switch"
                      aria-checked={sub.is_active}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 translate-y-0.5 rounded-full bg-white shadow-sm ring-0 transition-transform ${
                          sub.is_active ? "translate-x-4" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(sub.created_at).toLocaleDateString("en-GB")}
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
