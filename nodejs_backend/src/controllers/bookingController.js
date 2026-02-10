const BookingService = require('../services/bookingService');

class BookingController {

    // GET /bookings (ADMIN)
    static async findAll(req, res) {
        try {
            const data = await BookingService.getAll();
            res.json({ bookings: data.map(b => b.toArray ? b.toArray() : b) });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    // GET /bookings/details (PROJECT MANAGER)
    static async getWithDetails(req, res) {
        try {
            const data = await BookingService.getAllWithDetails();
            res.json({ bookings: data });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    // GET /bookings/{id}
    static async findOne(req, res) {
        const id = parseInt(req.params.id);
        try {
            const item = await BookingService.getById(id);
            if (!item) {
                return res.status(404).json({ error: 'Not found' });
            }
            res.json({ booking: item.toArray ? item.toArray() : item });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    // GET /bookings/me
    static async getMyBookings(req, res) {
        try {
            const user = req.user;
            if (!user) return res.status(401).json({ error: 'Unauthorized' });

            const bookings = await BookingService.getByUserId(user.id);
            res.json({ bookings });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    // GET /bookings/public
    static async getPublicSchedule(req, res) {
        try {
            const data = await BookingService.getPublicSchedule();
            res.json({ bookings: data });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    // POST /bookings
    static async create(req, res) {
        try {
            const data = req.body;
            const user = req.user;

            if (!user) return res.status(401).json({ error: 'Unauthorized' });

            // Enforce ownership
            data.userID = user.id;

            // Prevent client from forcing system fields
            delete data.created_at;

            const item = await BookingService.create(data);
            res.status(201).json({ booking: item.toArray ? item.toArray() : item });
        } catch (e) {
            res.status(400).json({ error: e.message });
        }
    }

    // PUT /bookings/{id}
    static async update(req, res) {
        const id = parseInt(req.params.id);
        try {
            const data = req.body;
            const user = req.user;

            delete data.created_at;

            const item = await BookingService.update(id, data, user);

            if (!item) {
                return res.status(400).json({ error: 'Update failed' });
            }

            res.json({ booking: item.toArray ? item.toArray() : item });
        } catch (e) {
            res.status(400).json({ error: e.message });
        }
    }

    // GET /bookings/{id}/history
    static async getHistory(req, res) {
        const id = parseInt(req.params.id);
        try {
            const history = await BookingService.getApprovalHistory(id);
            res.json({ history });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    // GET /admin/approvals
    static async getApprovalsReport(req, res) {
        try {
            const rows = await BookingService.getAllApprovals();
            res.json({ approvals: rows });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    // DELETE /bookings/{id}
    static async delete(req, res) {
        const id = parseInt(req.params.id);
        try {
            const success = await BookingService.delete(id);
            if (!success) return res.status(404).json({ error: 'Delete failed' });
            res.json({ message: 'Deleted successfully' });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    // GET /bookings/{id}/billing-context (Custom helper)
    static async getBillingContext(req, res) {
        const id = parseInt(req.params.id);
        try {
            const item = await BookingService.getBillingContext(id);
            if (!item) return res.status(404).json({ error: 'Booking not found' });
            res.json(item);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
}

module.exports = BookingController;
