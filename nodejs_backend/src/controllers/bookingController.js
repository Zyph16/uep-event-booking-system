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

            // Ownership Check
            const user = req.user;
            const privilegedRoles = [1, 2, 3]; // Admin, President, PM
            if (!privilegedRoles.includes(parseInt(user.role_id)) && item.user_id !== user.id) {
                return res.status(403).json({ error: 'Forbidden' });
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

            // Note: BookingService.update might already handle some logic, but usually controllers enforce ownership BEFORE calling service
            // However, update often involves status changes which might be done by admins/PMs.
            // The service or existing logic might handle role-based updates.
            // But let's verify ownership for CLIENTS.

            // Fetch existing to check owner if not privileged
            const privilegedRoles = [1, 2, 3];
            if (!privilegedRoles.includes(parseInt(user.role_id))) {
                const existing = await BookingService.getById(id);
                if (!existing) return res.status(404).json({ error: 'Not found' });

                if (existing.user_id !== user.id) {
                    return res.status(403).json({ error: 'Forbidden' });
                }
            }

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
            // Ownership Check (Duplicate logic, consider helper if repeating often, but inline for now)
            const user = req.user;
            const privilegedRoles = [1, 2, 3];

            // We need to fetch booking to check owner.
            const booking = await BookingService.getById(id);
            if (!booking) return res.status(404).json({ error: 'Not found' });

            if (!privilegedRoles.includes(parseInt(user.role_id)) && booking.user_id !== user.id) {
                return res.status(403).json({ error: 'Forbidden' });
            }

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

            // Ownership check
            const user = req.user;
            const privilegedRoles = [1, 2, 3];
            // item likely contains booking details including user_id? 
            // getBillingContext usually joins data. Let's assume item.booking.user_id or similar.
            // If structure is unknown, safer to fetch booking separately or inspect item.
            // Given getBillingContext output usually includes booking details...

            // Let's rely on BookingService.getById for ownership check to be safe, 
            // OR check if item has user_id.
            // To be safe and consistent:
            const booking = await BookingService.getById(id);
            if (booking && !privilegedRoles.includes(parseInt(user.role_id)) && booking.user_id !== user.id) {
                return res.status(403).json({ error: 'Forbidden' });
            }

            res.json(item);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
}

module.exports = BookingController;
