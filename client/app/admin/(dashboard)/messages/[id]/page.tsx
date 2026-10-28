"use client";

import { use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { adminFetch } from "@/lib/admin/api";
import { adminKeys } from "@/lib/admin/query-keys";
import { StatusBadge } from "../../../_components/status-badge";

interface MessageDetail {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

const STATUSES = ["new", "read", "replied", "archived"];

export default function MessageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();

  const { data: msg, isLoading } = useQuery({
    queryKey: adminKeys.message(Number(id)),
    queryFn: () => adminFetch<MessageDetail>(`/admin/messages/${id}`),
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) =>
      adminFetch(`/admin/messages/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "message", Number(id)] });
      queryClient.invalidateQueries({ queryKey: ["admin", "messages"] });
    },
  });

  if (isLoading || !msg) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5A1F1F]/20 border-t-[#5A1F1F]" />
      </div>
    );
  }

  return (
    <div>
      <Link href="/admin/messages" className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#5A1F1F]">
        <ArrowLeft size={14} /> Back to messages
      </Link>

      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">{msg.subject}</h1>
        <StatusBadge status={msg.status} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Contact Info</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium text-gray-800">{msg.name}</span></p>
            <p className="text-gray-500">{msg.email}</p>
            {msg.phone && <p className="text-gray-500">{msg.phone}</p>}
          </div>
          <div className="mt-4 border-t border-gray-100 pt-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Received</span>
            <p className="mt-1 text-sm text-gray-600">
              {new Date(msg.created_at).toLocaleString("en-GB")}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Status</h2>
          <select
            value={msg.status}
            onChange={(e) => statusMutation.mutate(e.target.value)}
            disabled={statusMutation.isPending}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium capitalize focus:border-[#5A1F1F] focus:ring-2 focus:ring-[#5A1F1F]/20"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Message</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{msg.message}</p>
        </div>
      </div>
    </div>
  );
}
