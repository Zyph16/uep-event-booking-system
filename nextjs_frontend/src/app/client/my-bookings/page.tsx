import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BookingList from "@/components/client/BookingList";

export const metadata = {
    title: "My Bookings | UEP Event Booking",
};

export default function MyBookingsPage() {
    return (
        <div className="my-bookings-container">
            <Link
                href="/client/booking"
                className="inline-flex items-center text-text-muted hover:text-primary mb-6 transition-colors"
            >
                <ArrowLeft size={18} className="mr-2" /> Back to Booking
            </Link>

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-primary">My Bookings</h1>
            </div>

            <BookingList />
        </div>
    );
}
