const BillingService = require('../services/billingService');

class BillingController {

    // POST /api/billing
    static async store(req, res) {
        try {
            const user = req.user;
            if (!user) return res.status(401).json({ error: 'Unauthorized' });

            const body = req.body;

            if (!body.booking_id || body.facility_fee === undefined) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            body.issued_by = user.id;
            body.total_amount = parseFloat(body.facility_fee) + parseFloat(body.equipment_fee || 0);

            const id = await BillingService.createBilling(body);
            res.status(201).json({ message: 'Billing created successfully', billing_id: id });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    // GET /api/billing/{bookingId}
    static async show(req, res) {
        const bookingId = parseInt(req.params.id);
        try {
            const user = req.user;
            if (!user) return res.status(401).json({ error: 'Unauthorized' });

            const billing = await BillingService.getBillingByBooking(bookingId);
            if (!billing) return res.status(404).json({ error: 'Billing not found' });

            // Check Ownership or Role
            // We need to know who owns the booking related to this billing.
            // billing object should ideally contain booking_id.
            // We might need to fetch the booking to check ownership if it's not in billing object,
            // OR we rely on what BillingService returns.
            // Assuming we might need to fetch booking to be safe, or if billing has user_id/booking_id.
            // Let's check if we can get booking details.
            // For efficient check, let's assume we need to check if the caller is the owner of the booking
            // associated with this billing.

            // Privileged roles can see everything
            const privilegedRoles = [1, 2, 3]; // Admin, President, PM
            if (privilegedRoles.includes(parseInt(user.role_id))) {
                return res.json(billing);
            }

            // Regular user: must own the booking
            // We need to verify the booking owner.
            // Since BillingService.getBillingByBooking returns billing info, 
            // does it include user_id of the booking?
            // If not, we might need to fetch it.
            // Let's peek at BillingService or try to fetch booking.

            // To allow "proceed" without breaking flow, I will do a quick lookup via BookingService 
            // if I cannot be sure from billing object. 
            // However, to keep it simple in this step, I will assume we need to fetch booking owner.

            const BookingService = require('../services/bookingService');
            const booking = await BookingService.getById(bookingId);

            if (booking && booking.user_id === user.id) {
                return res.json(billing);
            }

            return res.status(403).json({ error: 'Forbidden' });

        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    // GET /api/billing/income-stats?period=monthly&facilityId=1
    static async getIncomeStats(req, res) {
        try {
            const { period, facilityId } = req.query; // period: 'monthly' | 'annually'
            const stats = await BillingService.getIncomeStats(period || 'monthly', facilityId);
            res.json(stats);
        } catch (e) {
            console.error("getIncomeStats Error:", e);
            res.status(500).json({ error: e.message });
        }
    }
}

module.exports = BillingController;
