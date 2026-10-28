"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  PoundSterling,
  Mail,
  ShoppingCart,
  Users,
} from "lucide-react";
import Link from "next/link";
import { adminFetch } from "@/lib/admin/api";
import { adminKeys } from "@/lib/admin/query-keys";
import { StatCard } from "../_components/stat-card";
import { StatusBadge } from "../_components/status-badge";

interface DashboardData {
  total_orders: number;
  total_revenue: number;
  pending_bookings: number;
  confirmed_bookings: number;
  unread_messages: number;
  subscriber_count: number;
  recent_orders: Array<{
    id: string;
    customer_name: string;
    status: string;
    total: string;
    created_at: string;
  }>;
  recent_bookings: Array<{
    id: string;
    date: string;
    customer_name: string;
    status: string;
    price: string;
    num_guests: number;
  }>;
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: adminKeys.dashboard(),
    queryFn: () => adminFetch<DashboardData>("/auth/dashboard"),
  });

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5A1F1F]/20 border-t-[#5A1F1F]" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">Overview of your business</p>

      {/* Stat cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Orders"
          value={data.total_orders}
          icon={<ShoppingCart size={18} />}
          color="maroon"
        />
        <StatCard
          label="Revenue"
          value={`£${data.total_revenue.toFixed(2)}`}
          icon={<PoundSterling size={18} />}
          color="gold"
        />
        <StatCard
          label="Bookings"
          value={data.confirmed_bookings}
          icon={<Calendar size={18} />}
          color="sage"
        />
        <StatCard
          label="Unread"
          value={data.unread_messages}
          icon={<Mail size={18} />}
          color="ink"
        />
        <StatCard
          label="Subscribers"
          value={data.subscriber_count}
          icon={<Users size={18} />}
          color="sage"
        />
      </div>

      {/* Recent tables */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs font-medium text-[#5A1F1F] hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {data.recent_orders.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-400">No orders yet</p>
            ) : (
              data.recent_orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {order.customer_name || "Guest"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} />
                    <span className="text-sm font-semibold text-gray-800">£{order.total}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent bookings */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Recent Bookings</h2>
            <Link href="/admin/bookings" className="text-xs font-medium text-[#5A1F1F] hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {data.recent_bookings.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-400">No bookings yet</p>
            ) : (
              data.recent_bookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/admin/bookings/${booking.id}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {booking.customer_name || "Guest"}
                    </p>
                    <p className="text-xs text-gray-400">{new Date(booking.date).toLocaleDateString("en-GB")} · {booking.num_guests} guests</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={booking.status} />
                    {booking.price && (
                      <span className="text-sm font-semibold text-gray-800">£{booking.price}</span>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
