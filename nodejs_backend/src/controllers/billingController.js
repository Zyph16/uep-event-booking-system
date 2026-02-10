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
            const billing = await BillingService.getBillingByBooking(bookingId);
            if (!billing) return res.status(404).json({ error: 'Billing not found' });
            res.json(billing);
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
