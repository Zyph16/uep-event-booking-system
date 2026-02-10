const BillingRepository = require('../repositories/billingRepository');
const BookingRepository = require('../repositories/bookingRepository');
const NotificationService = require('./notificationService');
const Booking = require('../models/booking');

class BillingService {
    static async createBilling(data) {
        const id = await BillingRepository.create(data);

        // Update Booking Status to Billing Generated (Pre-Approved)
        const bookingId = parseInt(data.booking_id);
        await BookingRepository.update(bookingId, { status: Booking.STATUS_PRE_APPROVED });

        // 🔔 Notify User
        try {
            // Fetch detailed context
            const bookingDetails = await BookingRepository.getBillingContext(bookingId);

            if (bookingDetails) {
                const facilityName = bookingDetails.facility_name || 'Unknown Facility';

                const dateRequested = new Date(bookingDetails.date_requested);
                const timeStart = new Date(`1970-01-01T${bookingDetails.time_start}`);

                // Formatting function locally since we don't have PHP's date()
                const optionsDate = { year: 'numeric', month: 'long', day: 'numeric' };
                const optionsTime = { hour: 'numeric', minute: '2-digit', hour12: true };

                const dateStr = dateRequested.toLocaleDateString('en-US', optionsDate) +
                    ' at ' +
                    timeStart.toLocaleTimeString('en-US', optionsTime).toLowerCase();

                const totalFormatted = parseFloat(data.total_amount).toFixed(2);

                await NotificationService.create({
                    userID: bookingDetails.userID,
                    phone: '',
                    message: `A new billing statement has been issued for your booking for ${facilityName} on ${dateStr}. Total: ${totalFormatted}`,
                    type: 'BILLING',
                    status: 'UNREAD'
                });
            }
        } catch (e) {
            console.error("Billing Notification failed:", e);
            // In production, consider logging to a file or monitoring service
        }

        return id;
    }

    static async getBillingByBooking(bookingId) {
        const billing = await BillingRepository.findByBookingId(bookingId);
        if (billing) {
            const fname = (billing.issuer_full_name || '').trim();
            billing.issuer_name = fname || billing.issuer_username || 'Admin';
        }
        return billing;
    }

    static async getIncomeStats(period, facilityId) {
        // Validation could go here
        return await BillingRepository.getIncomeStats(period, facilityId);
    }
}

module.exports = BillingService;
