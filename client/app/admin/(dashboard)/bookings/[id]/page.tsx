"use client";

import { use } from "react";
import dynamic from "next/dynamic";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, MapPin, Users, Clock, ExternalLink, Receipt, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { adminFetch } from "@/lib/admin/api";
import { adminKeys } from "@/lib/admin/query-keys";
import { StatusBadge } from "../../../_components/status-badge";

const BookingPinMap = dynamic(() => import("../../../_components/booking-pin-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-50 text-xs text-gray-400">
      Loading map…
    </div>
  ),
});

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();

  const { data: booking, isLoading } = useQuery({
    queryKey: adminKeys.booking(id),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryFn: () => adminFetch<any>(`/admin/bookings/${id}`),
  });

  const { data: receipt } = useQuery({
    queryKey: ["admin", "booking-receipt", id],
    queryFn: () => adminFetch<{ receipt_url: string }>(`/admin/bookings/${id}/receipt`),
    enabled: !!booking && booking.status === "confirmed",
  });

  const refundMutation = useMutation({
    mutationFn: () =>
      adminFetch<{ detail: string; amount_refunded: number }>(
        `/admin/bookings/${id}/refund`,
        { method: "POST", body: JSON.stringify({ confirm: true }) },
      ),
    onSuccess: (res) => {
      toast.success(`Refunded £${res.amount_refunded.toFixed(2)}`);
      queryClient.invalidateQueries({ queryKey: adminKeys.booking(id) });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Refund failed"),
  });

  if (isLoading || !booking) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5A1F1F]/20 border-t-[#5A1F1F]" /></div>;
  }

  const isConfirmed = booking.status === "confirmed";

  return (
    <div>
      <Link href="/admin/bookings" className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#5A1F1F]">
        <ArrowLeft size={14} /> Back to bookings
      </Link>

      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Booking #{String(booking.id).slice(0, 8)}</h1>
        <StatusBadge status={booking.status as string} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Event Details</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2"><Clock size={14} className="text-gray-400" /> <span className="font-medium">{new Date(booking.date as string).toLocaleDateString("en-GB")}</span> {booking.timing_start as string} – {booking.timing_end as string}</div>
            <div className="flex items-center gap-2"><Users size={14} className="text-gray-400" /> {booking.num_guests as number} guests</div>
            <div className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 text-gray-400" /> <span className="text-gray-600">{booking.location_address as string || "—"}</span></div>
            {typeof booking.distance_miles === "number" && <p className="text-xs text-gray-400 pl-[22px]">{booking.distance_miles.toFixed(0)} miles from Cambridge</p>}
            {typeof booking.location_lat === "number" && typeof booking.location_lng === "number" && (
              <div className="pl-[22px] space-y-1 pt-1">
                <p className="text-xs font-mono text-gray-500">
                  {(booking.location_lat as number).toFixed(6)}, {(booking.location_lng as number).toFixed(6)}
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${booking.location_lat},${booking.location_lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#5A1F1F] hover:underline"
                >
                  Open in Google Maps <ExternalLink size={10} />
                </a>
              </div>
            )}
          </div>
          {booking.notes && (
            <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">{booking.notes as string}</div>
          )}
          {typeof booking.location_lat === "number" && typeof booking.location_lng === "number" && (
            <div className="mt-4 h-56 overflow-hidden rounded-lg border border-gray-100">
              <BookingPinMap lat={booking.location_lat as number} lng={booking.location_lng as number} />
            </div>
          )}
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Customer</h2>
          <p className="font-medium text-gray-800">{booking.customer_name as string}</p>
          <p className="text-sm text-gray-500">{booking.customer_email as string}</p>
          {booking.customer_phone && <p className="text-sm text-gray-500">{booking.customer_phone as string}</p>}
          <div className="mt-4 border-t border-gray-100 pt-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total</span>
            <p className="mt-1 text-2xl font-bold text-gray-900">£{booking.price as string}</p>
          </div>

          {isConfirmed && (
            <div className="mt-5 flex flex-col gap-2 border-t border-gray-100 pt-4 sm:flex-row">
              {receipt?.receipt_url && (
                <a
                  href={receipt.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#5A1F1F] bg-white px-3 py-2 text-xs font-semibold text-[#5A1F1F] hover:bg-[#5A1F1F]/5"
                >
                  <Receipt size={13} /> View receipt
                </a>
              )}
              <button
                type="button"
                disabled={refundMutation.isPending}
                onClick={() => {
                  if (confirm(`Refund £${booking.price} to the customer? This cannot be undone.`)) {
                    refundMutation.mutate();
                  }
                }}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <Undo2 size={13} /> {refundMutation.isPending ? "Refunding…" : "Refund booking"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
