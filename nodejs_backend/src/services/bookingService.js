const BookingRepository = require('../repositories/bookingRepository');
const BookingApprovalRepository = require('../repositories/bookingApprovalRepository');
const UserEntityRepository = require('../repositories/userEntityRepository');
const NotificationService = require('./notificationService');
const Booking = require('../models/booking');
const { pool } = require('../core/database');

class BookingService {
    // ✅ Get all bookings (ADMIN)
    static async getAll() {
        return BookingRepository.findAll();
    }

    // ✅ Get all bookings with user and facility details (PROJECT MANAGER)
    static async getAllWithDetails() {
        return BookingRepository.getAllWithDetails();
    }

    // ✅ Get booking by ID
    static async getById(id) {
        return BookingRepository.findById(id);
    }

    // ✅ Get bookings by user ID
    static async getByUserId(userId) {
        return BookingRepository.findByUserId(userId);
    }

    // ✅ Create booking
    static async create(data) {
        if (!data.status) {
            data.status = Booking.STATUS_PENDING;
        }

        const dStart = data.date_start || data.date_requested;
        const dEnd = data.date_end || dStart;
        const isSchedule = data.schedule && Array.isArray(data.schedule) && data.schedule.length > 0;

        // Helper: Adjust Time by Hours
        const adjustTime = (time, hours) => {
            if (!time) return time;
            const [h, m] = time.split(':').map(Number);
            let date = new Date();
            date.setHours(h, m, 0, 0);
            date.setHours(date.getHours() + hours);
            // Return in HH:MM format
            const hh = String(date.getHours()).padStart(2, '0');
            const mm = String(date.getMinutes()).padStart(2, '0');
            return `${hh}:${mm}`;
        };

        // 0. VALIDATE PAST DATES
        // Create today date in "YYYY-MM-DD" format based on server time (assuming server is set to correct locale/timezone or UTC)
        // For simplicity, we use the simple string comparison of YYYY-MM-DD
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        const isPast = (d) => {
            // d is likely YYYY-MM-DD string
            return d < todayStr;
        };

        if (isSchedule) {
            for (const day of data.schedule) {
                if (isPast(day.date)) {
                    throw new Error(`Cannot book dates in the past (${day.date}).`);
                }
            }
        } else {
            if (isPast(dStart)) {
                throw new Error(`Cannot book dates in the past (${dStart}).`);
            }
        }

        // 1. VALIDATE AVAILABILITY (Prevent overlapping with Approved/Setup)

        let validationOverlaps = [];

        if (isSchedule) {
            for (const day of data.schedule) {
                // Buffer: -1 hour start, +1 hour end
                const bufferedStart = adjustTime(day.time_start, -1);
                const bufferedEnd = adjustTime(day.time_end, 1);

                const dayOverlaps = await BookingRepository.findOverlaps(
                    data.facilityID,
                    day.date,
                    day.date,
                    bufferedStart,
                    bufferedEnd,
                    data.setup_date_start,
                    data.setup_date_end,
                    data.setup_time_start,
                    data.setup_time_end
                );
                validationOverlaps = validationOverlaps.concat(dayOverlaps);
            }
        } else {
            // Buffer: -1 hour start, +1 hour end
            const bufferedStart = adjustTime(data.time_start, -1);
            const bufferedEnd = adjustTime(data.time_end, 1);

            validationOverlaps = await BookingRepository.findOverlaps(
                data.facilityID,
                dStart,
                dEnd,
                bufferedStart,
                bufferedEnd,
                data.setup_date_start,
                data.setup_date_end,
                data.setup_time_start,
                data.setup_time_end
            );
        }

        // Check for hard conflicts
        for (const ov of validationOverlaps) {
            const s = (ov.status || '').toLowerCase();
            const isHardConflict =
                ov.conflict_type === 'Setup' ||
                s.includes('approved') ||
                s.includes('reviewed') ||
                s.includes('billing') ||
                s === 'confirmed';

            if (isHardConflict) {
                throw new Error(`The selected dates align with an existing ${ov.conflict_type === 'Setup' ? 'Setup' : 'Approved Event'} (ID #${ov.bookingID}). Please choose another schedule.`);
            }
        }

        const booking = await BookingRepository.create(data);

        // 🔔 Notify Project Managers
        this.notifyProjectManagers(`New booking request for ${data.purpose || 'Event'}.`);

        // 2. CHECK PRIORITY CONFLICTS
        try {
            const creator = await UserEntityRepository.findById(data.userID);
            const role = creator ? (creator.roleName || creator.role_name || '').toUpperCase() : '';
            const isPriority = role.includes('DEAN') || role.includes('COUNCIL');

            if (isPriority) {
                const schedule = booking.schedule || [];
                let overlaps = [];

                if (schedule.length > 0) {
                    for (const day of schedule) {
                        const dayOverlaps = await BookingRepository.findOverlaps(
                            booking.facilityID,
                            day.date,
                            day.date,
                            day.time_start,
                            day.time_end,
                            booking.setup_date_start,
                            booking.setup_date_end,
                            booking.setup_time_start,
                            booking.setup_time_end
                        );
                        overlaps = overlaps.concat(dayOverlaps);
                    }
                } else {
                    const dStart = booking.date_start || booking.date_requested;
                    const dEnd = booking.date_end || dStart;

                    overlaps = await BookingRepository.findOverlaps(
                        booking.facilityID,
                        dStart,
                        dEnd,
                        booking.time_start,
                        booking.time_end,
                        booking.setup_date_start,
                        booking.setup_date_end,
                        booking.setup_time_start,
                        booking.setup_time_end
                    );
                }

                for (const ov of overlaps) {
                    if (ov.bookingID === booking.bookingID) continue; // Skip self

                    const conflictRole = (ov.user_role || '').toUpperCase();
                    const isConflictProtected = conflictRole.includes('ADMIN') ||
                        conflictRole.includes('MANAGER') ||
                        conflictRole.includes('PRESIDENT') ||
                        conflictRole.includes('DEAN') ||
                        conflictRole.includes('COUNCIL');

                    if (!isConflictProtected) {
                        const msg = `PRIORITY ALERT: Priority Booking #${booking.bookingID} (by ${role}) has been booked over Client Booking #${ov.bookingID}. Please reschedule the client.`;
                        this.notifyProjectManagers(msg);
                        this.notifyPresident(msg);
                        break;
                    }
                }
            }
        } catch (e) {
            console.error("Priority Check Failed:", e);
        }

        return booking;
    }

    // ✅ Update booking with RBAC and Audit Logging
    static async update(id, data, user = null) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const booking = await BookingRepository.findById(id, connection);
            if (!booking) {
                await connection.rollback();
                return null;
            }

            // Status Change Logic
            if (data.status) {
                const newStatus = await this.processStatusChange(booking, data.status, user, data.remarks, connection);

                if (newStatus && newStatus !== booking.status) {
                    const oldStatus = booking.status;
                    const success = await BookingRepository.updateStatus(id, newStatus, oldStatus, connection);

                    if (!success) {
                        throw new Error("Booking status was changed by another user. Please refresh and try again.");
                    }

                    // Notify User
                    try {
                        const bookingDetails = await BookingRepository.getBillingContext(id, connection);
                        const facilityName = bookingDetails.facility_name || 'Unknown Facility';

                        // Date formatting helpers
                        const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                        const fmtTime = (t) => new Date(`1970-01-01T${t}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();

                        const startDate = bookingDetails.date_start || bookingDetails.date_requested;
                        const endDate = bookingDetails.date_end || startDate;
                        const startTime = bookingDetails.time_start || '00:00:00';
                        const endTime = bookingDetails.time_end || '00:00:00';

                        let dateStr;
                        if (startDate === endDate) {
                            dateStr = `${fmtDate(startDate)} from ${fmtTime(startTime)} to ${fmtTime(endTime)}`;
                        } else {
                            dateStr = `from ${fmtDate(startDate)} ${fmtTime(startTime)} to ${fmtDate(endDate)} ${fmtTime(endTime)}`;
                        }

                        await NotificationService.create({
                            userID: booking.userID,
                            phone: '',
                            message: `Your booking for ${facilityName} on ${dateStr} has been ${newStatus}`,
                            type: 'STATUS_UPDATE',
                            status: 'UNREAD'
                        });

                        // Notify PMs
                        let pmMsg = "";
                        const ns = newStatus;
                        // Determine PM Notification
                        if (ns === Booking.STATUS_REVIEWED) {
                            pmMsg = `Booking #${id} (${facilityName}) has been reviewed by the President. Please generate billing.`;
                        } else if (ns === Booking.STATUS_AWAITING_PAYMENT) {
                            pmMsg = `Booking #${id} (${facilityName}) billing has been signed by the President. Awaiting client payment.`;
                        } else if (ns === Booking.STATUS_APPROVED) {
                            pmMsg = `Booking #${id} (${facilityName}) is fully Approved.`;
                        } else {
                            pmMsg = `Booking #${id} (${facilityName}) status updated to ${ns}.`;
                        }

                        if (pmMsg) this.notifyProjectManagers(pmMsg);

                        // Notify President
                        if (ns === Booking.STATUS_PENDING) {
                            this.notifyPresident(`New Booking #${id} (${facilityName}) requires your initial review.`);
                        } else if (ns === Booking.STATUS_PRE_APPROVED) { // Billing Generated
                            this.notifyPresident(`Billing for Booking #${id} (${facilityName}) has been generated and awaits your signature.`);
                        }

                    } catch (e) {
                        console.error("Notification failed:", e);
                    }
                }
                delete data.status; // Prevent redundant update
            }

            // Reschedule Check
            let isRescheduled = false;
            if (
                (data.date_start && data.date_start !== booking.date_start) ||
                (data.date_end && data.date_end !== booking.date_end) ||
                (data.time_start && data.time_start !== booking.time_start) ||
                (data.time_end && data.time_end !== booking.time_end)
            ) {
                isRescheduled = true;
            }

            // Relocation Check
            let isRelocated = false;
            let oldFacilityName = 'Facility';
            if (data.facilityID && data.facilityID !== booking.facilityID) {
                isRelocated = true;
                const oldCtx = await BookingRepository.getBillingContext(id, connection);
                oldFacilityName = (oldCtx && oldCtx.facility_name) ? oldCtx.facility_name : 'Facility';
            }

            // General Update
            if (Object.keys(data).length > 0) {
                await BookingRepository.update(id, data, connection);
            }

            const result = await BookingRepository.findById(id, connection);

            // Notify Reschedule/Relocate
            if (isRescheduled || isRelocated) {
                try {
                    const bookingDetails = await BookingRepository.getBillingContext(id, connection);
                    const fName = (bookingDetails && bookingDetails.facility_name) || 'Facility';

                    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'TBD';
                    const fmtTime = (t) => t ? new Date(`1970-01-01T${t}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase() : '';

                    // New
                    const startD = result.date_start || result.date_requested;
                    const endD = result.date_end || startD;
                    let dStr = fmtDate(startD);
                    if (startD !== endD) dStr += ' to ' + fmtDate(endD);
                    const tStr = (result.time_start && result.time_end) ? `${fmtTime(result.time_start)} - ${fmtTime(result.time_end)}` : '';
                    const dateTimeStr = `${dStr} at ${tStr}`;

                    // Old
                    const oStart = booking.date_start || booking.date_requested;
                    const odStr = fmtDate(oStart);
                    const otStr = (booking.time_start && booking.time_end) ? `${fmtTime(booking.time_start)} - ${fmtTime(booking.time_end)}` : '';
                    const origDateTimeStr = `${odStr} at ${otStr}`;

                    const subjectFacility = isRelocated ? oldFacilityName : fName;
                    let msg = "";
                    let type = "UPDATE";

                    if (isRelocated) {
                        msg = `Your booking for ${subjectFacility} on ${origDateTimeStr} has been moved to ${fName} ${dateTimeStr}.`;
                        type = "RELOCATED";
                    } else if (isRescheduled) {
                        msg = `Your booking for ${subjectFacility} on ${origDateTimeStr} has been rescheduled to ${dateTimeStr}.`;
                        type = "RESCHEDULED";
                    }

                    if (msg) {
                        await NotificationService.create({
                            userID: result.userID,
                            message: msg,
                            type: type,
                            status: 'UNREAD'
                        });
                        this.notifyProjectManagers(`Booking #${id}: ${msg}`);
                    }

                } catch (e) {
                    console.error("Update Notification failed:", e);
                }
            }

            await connection.commit();
            return result;

        } catch (e) {
            await connection.rollback();
            throw e;
        } finally {
            connection.release();
        }
    }

    // ✅ Upload Receipt
    static async uploadReceipt(id, userId, receiptUrl, userRole) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const booking = await BookingRepository.findById(id, connection);
            if (!booking) {
                throw new Error("Booking not found");
            }

            // Client verifying ownership
            const privilegedRoles = [1, 2, 3];
            if (!privilegedRoles.includes(parseInt(userRole)) && parseInt(booking.userID) !== parseInt(userId)) {
                throw new Error("Forbidden");
            }

            // We only want to allow this if status is something like 'Billing Ready' / 'Awaiting Payment'
            const currentStatus = (booking.status || '').toLowerCase();
            if (!currentStatus.includes('awaiting payment') && !currentStatus.includes('billing ready') && !currentStatus.includes('billing generated')) {
                throw new Error(`Cannot upload receipt for booking in status: ${booking.status}`);
            }

            const newStatus = Booking.STATUS_PAYMENT_UNDER_REVIEW || 'Payment Under Review'; // Add this to Booking model consts if needed, or fallback string

            await BookingRepository.updateReceipt(id, receiptUrl, newStatus, connection);

            // Audit Log
            await BookingApprovalRepository.create({
                booking_id: id,
                approver_id: userId,
                approval_stage: 'Payment Submission',
                approver_role: 'CLIENT',
                decision: 'Uploaded Receipt',
                remarks: 'Client uploaded payment receipt for review'
            }, connection);

            // Notify PMs that a receipt was uploaded
            const bookingDetails = await BookingRepository.getBillingContext(id, connection);
            const facilityName = bookingDetails ? bookingDetails.facility_name : 'Facility';
            this.notifyProjectManagers(`Client uploaded a payment receipt for Booking #${id} (${facilityName}). Please review.`);

            await connection.commit();
            return await BookingRepository.findById(id);

        } catch (e) {
            await connection.rollback();
            throw e;
        } finally {
            connection.release();
        }
    }

    // --- Helpers ---

    static async processStatusChange(booking, requestedAction, user, remarks, connection = null) {
        if (!user) return requestedAction; // Or throw error

        const currentStatus = booking.status;
        const rawRole = (user.roleName || user.role_name || '');
        const role = rawRole.toUpperCase().trim();

        const action = requestedAction.toLowerCase();

        let targetStatus = null;
        let stage = '';
        let decision = '';

        if (action === 'approved' || action === 'approve') {
            // Workflow:
            // 1. Pending -> Reviewed (President)
            // 2. Reviewed -> Billing Generated (Project Manager)
            // 3. Billing Generated -> Awaiting Payment (President Signs)
            // 4. Awaiting Payment -> Approved (Project Manager Confirms Payment)

            if (['UNIVERSITY PRESIDENT', 'PRESIDENT'].includes(role)) {
                if (currentStatus.toLowerCase() === Booking.STATUS_PENDING.toLowerCase()) {
                    // Step 3: President Initial Review
                    targetStatus = Booking.STATUS_REVIEWED; // "President Reviewed - Awaiting Billing"
                    stage = 'President Initial Review';
                    decision = 'Approved for Billing';
                } else if (currentStatus === Booking.STATUS_PRE_APPROVED) {
                    // Step 5: President Signs Billing
                    targetStatus = Booking.STATUS_AWAITING_PAYMENT; // "Billing Signed - Awaiting Payment"
                    stage = 'Billing Signature';
                    decision = 'Signed Billing';
                } else {
                    throw new Error(`University President cannot approve booking in status: ${currentStatus}.`);
                }
            } else if (role === 'PROJECT MANAGER') {
                if (currentStatus === Booking.STATUS_REVIEWED) {
                    // Step 4: PM Generates Billing
                    targetStatus = Booking.STATUS_PRE_APPROVED; // "Billing Generated - Awaiting Signature"
                    stage = 'Billing Generation';
                    decision = 'Billing Sent to President';
                } else if (currentStatus === Booking.STATUS_AWAITING_PAYMENT || currentStatus.toLowerCase().includes('payment under review')) {
                    // Step 7: PM Confirms Payment & Approves
                    targetStatus = Booking.STATUS_APPROVED;
                    stage = 'Final Approval';
                    decision = 'Payment Confirmed & Approved';
                } else {
                    throw new Error(`Project Manager cannot approve/advance booking in status: ${currentStatus}.`);
                }
            } else {
                throw new Error(`You are not authorized to approve bookings. (Your role: ${role || 'None'})`);
            }
        } else if (action === 'rejected' || action === 'reject') {
            targetStatus = Booking.STATUS_REJECTED;
            decision = 'Rejected';

            if (role === 'PROJECT MANAGER' || ['UNIVERSITY PRESIDENT', 'PRESIDENT'].includes(role)) {
                stage = 'Rejection';
            } else {
                throw new Error("You are not authorized to reject bookings.");
            }
        } else {
            return requestedAction;
        }

        // Audit Log
        if (targetStatus && stage) {
            await BookingApprovalRepository.create({
                booking_id: booking.bookingID,
                approver_id: user.id,
                approval_stage: stage,
                approver_role: user.roleName || user.role_name,
                decision: decision,
                remarks: remarks
            }, connection);
        }

        return targetStatus;
    }

    static async getApprovalHistory(bookingId) {
        return BookingApprovalRepository.findByBookingId(bookingId);
    }

    static async getAllApprovals() {
        return BookingApprovalRepository.findAll();
    }

    static async getPublicSchedule() {
        return BookingRepository.getPublicSchedule();
    }

    static async delete(id) {
        return BookingRepository.delete(id);
    }

    static async getBillingContext(id) {
        return BookingRepository.getBillingContext(id);
    }

    static async notifyProjectManagers(message) {
        try {
            const pms = await UserEntityRepository.findByRole('PROJECT MANAGER');
            for (const pm of pms) {
                await NotificationService.create({
                    userID: pm.id,
                    phone: '',
                    message: message,
                    type: 'SYSTEM_ALERT',
                    status: 'UNREAD'
                });
            }
        } catch (e) {
            console.error("PM Notification failed:", e);
        }
    }

    static async notifyPresident(message) {
        try {
            let presidents = await UserEntityRepository.findByRole('UNIVERSITY PRESIDENT');
            if (presidents.length === 0) {
                presidents = await UserEntityRepository.findByRole('PRESIDENT');
            }
            for (const p of presidents) {
                await NotificationService.create({
                    userID: p.id,
                    phone: '',
                    message: message,
                    type: 'For Approval',
                    status: 'UNREAD'
                });
            }
        } catch (e) {
            console.error("President Notification failed:", e);
        }
    }
}

module.exports = BookingService;
