"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, ChevronDown, ChevronRight, Search, Star, X } from "lucide-react";
import { adminFetch } from "@/lib/admin/api";
import { adminKeys } from "@/lib/admin/query-keys";
import { ADMIN_PAGE_SIZE, Pagination } from "../../_components/pagination";

interface ReviewItem {
  id: number;
  product: number;
  product_name: string;
  author_name: string;
  author_email: string;
  rating: number;
  title: string;
  text: string;
  is_approved: boolean;
  created_at: string;
}

const FILTERS = ["", "pending", "approved"];

export default function ReviewsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const params: Record<string, string> = { page: String(page) };
  if (filter === "pending") params.is_approved = "false";
  if (filter === "approved") params.is_approved = "true";
  if (search) params.search = search;

  const { data, isLoading } = useQuery({
    queryKey: adminKeys.reviews(params),
    queryFn: () => {
      const qs = new URLSearchParams(params).toString();
      return adminFetch<{ count: number; next: string | null; previous: string | null; results: ReviewItem[] }>(
        `/admin/reviews?${qs}`,
      );
    },
    placeholderData: keepPreviousData,
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => adminFetch(`/admin/reviews/${id}/approve`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
      toast.success("Review approved");
    },
    onError: () => toast.error("Failed to approve review"),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => adminFetch(`/admin/reviews/${id}/reject`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
      toast.success("Review rejected");
    },
    onError: () => toast.error("Failed to reject review"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminFetch(`/admin/reviews/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
      toast.success("Review deleted");
    },
    onError: () => toast.error("Failed to delete review"),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => { setFilter(f); setPage(1); }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                filter === f ? "bg-[#5A1F1F] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f || "All"}
            </button>
          ))}
        </div>

        <div className="relative ml-auto">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search reviews..."
            className="w-64 rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm placeholder:text-gray-400 focus:border-[#5A1F1F] focus:outline-none focus:ring-4 focus:ring-[#5A1F1F]/10"
          />
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {isLoading ? (
          <div className="py-12 text-center text-gray-400">Loading...</div>
        ) : !data || data.results.length === 0 ? (
          <div className="py-12 text-center text-gray-400">No reviews found</div>
        ) : (
          data.results.map((review) => {
            const isExpanded = expandedId === review.id;
            return (
              <div key={review.id} className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : review.id)}
                  className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-gray-50/50"
                >
                  {isExpanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}

                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} size={13} fill={i < review.rating ? "#ECD691" : "none"} stroke={i < review.rating ? "#ECD691" : "#d1d5db"} strokeWidth={1.5} />
                    ))}
                  </div>

                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">
                    {review.author_name}
                    <span className="ml-2 text-xs font-normal text-gray-400">on {review.product_name}</span>
                  </span>

                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    review.is_approved ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                  }`}>
                    {review.is_approved ? "Approved" : "Pending"}
                  </span>

                  <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString("en-GB")}</span>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-50 bg-gray-50/30 px-4 py-4 pl-12">
                    <p className="text-xs text-gray-400">{review.author_email}</p>
                    {review.title && <p className="mt-2 text-sm font-semibold text-gray-800">{review.title}</p>}
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">{review.text}</p>

                    <div className="mt-4 flex gap-2">
                      {!review.is_approved && (
                        <button
                          type="button"
                          onClick={() => approveMutation.mutate(review.id)}
                          disabled={approveMutation.isPending}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                        >
                          <Check size={13} /> Approve
                        </button>
                      )}
                      {review.is_approved && (
                        <button
                          type="button"
                          onClick={() => rejectMutation.mutate(review.id)}
                          disabled={rejectMutation.isPending}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-50"
                        >
                          <X size={13} /> Reject
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => { if (confirm("Delete this review permanently?")) deleteMutation.mutate(review.id); }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
        {data && (
          <Pagination
            page={page}
            totalCount={data.count}
            pageSize={ADMIN_PAGE_SIZE}
            hasNext={Boolean(data.next)}
            hasPrev={Boolean(data.previous)}
            onChange={setPage}
            className="mt-2 rounded-xl border border-gray-100 bg-white"
          />
        )}
      </div>
    </div>
  );
}
