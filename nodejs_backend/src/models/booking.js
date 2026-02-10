class Booking {
    // Booking Status Constants
    static get STATUS_PENDING() { return 'Pending'; }
    static get STATUS_REVIEWED() { return 'President Reviewed - Awaiting Billing'; } // Step 3 Done
    static get STATUS_PRE_APPROVED() { return 'Billing Generated - Awaiting Signature'; } // Step 4 Done
    static get STATUS_AWAITING_PAYMENT() { return 'Billing Signed - Awaiting Payment'; } // Step 5 Done
    static get STATUS_PAYMENT_CONFIRMED() { return 'Payment Confirmed'; } // Optional intermediate
    static get STATUS_APPROVED() { return 'Approved'; } // Step 7 Done
    static get STATUS_REJECTED() { return 'Rejected'; }
    static get STATUS_CANCELLED() { return 'Cancelled'; }

    constructor(
        bookingID, userID, facilityID, organization, purpose, date_requested,
        date_start, date_end, time_start, time_end, status, created_at,
        facility_fee = 0.0, equipment_fee = 0.0,
        setup_date_start = null, setup_date_end = null,
        setup_time_start = null, setup_time_end = null
    ) {
        this.bookingID = bookingID;
        this.userID = userID;
        this.facilityID = facilityID;
        this.organization = organization;
        this.purpose = purpose;
        this.date_requested = date_requested;
        this.date_start = date_start;
        this.date_end = date_end;
        this.time_start = time_start;
        this.time_end = time_end;
        this.status = status;
        this.created_at = created_at;
        this.facility_fee = facility_fee;
        this.equipment_fee = equipment_fee;
        this.setup_date_start = setup_date_start;
        this.setup_date_end = setup_date_end;
        this.setup_time_start = setup_time_start;
        this.setup_time_end = setup_time_end;
        this.schedule = [];
    }

    static fromRow(row) {
        return new Booking(
            row.bookingID,
            row.userID,
            row.facilityID,
            row.organization,
            row.purpose,
            row.date_requested,
            row.date_start || null,
            row.date_end || null,
            row.time_start,
            row.time_end,
            row.status,
            row.created_at,
            parseFloat(row.facility_fee || 0.0),
            parseFloat(row.equipment_fee || 0.0),
            row.setup_date_start || null,
            row.setup_date_end || null,
            row.setup_time_start || null,
            row.setup_time_end || null
        );
    }

    // Getters (mapped)
    getBookingID() { return this.bookingID; }
    getUserID() { return this.userID; }
    getFacilityID() { return this.facilityID; }
    getOrganization() { return this.organization; }
    getPurpose() { return this.purpose; }
    getDateRequested() { return this.date_requested; }
    getDateStart() { return this.date_start; }
    getDateEnd() { return this.date_end; }
    getTimeStart() { return this.time_start; }
    getTimeEnd() { return this.time_end; }
    getStatus() { return this.status; }
    getCreatedAt() { return this.created_at; }
    getFacilityFee() { return this.facility_fee; }
    getEquipmentFee() { return this.equipment_fee; }
    getSetupDateStart() { return this.setup_date_start; }
    getSetupDateEnd() { return this.setup_date_end; }
    getSetupTimeStart() { return this.setup_time_start; }
    getSetupTimeEnd() { return this.setup_time_end; }

    setSchedule(schedule) { this.schedule = schedule; }
    getSchedule() { return this.schedule; }

    toArray() {
        return {
            bookingID: this.bookingID,
            userID: this.userID,
            facilityID: this.facilityID,
            organization: this.organization,
            purpose: this.purpose,
            date_requested: this.date_requested,
            date_start: this.date_start,
            date_end: this.date_end,
            time_start: this.time_start,
            time_end: this.time_end,
            status: this.status,
            created_at: this.created_at,
            facility_fee: this.facility_fee,
            equipment_fee: this.equipment_fee,
            setup_date_start: this.setup_date_start,
            setup_date_end: this.setup_date_end,
            setup_time_start: this.setup_time_start,
            setup_time_end: this.setup_time_end,
            has_billing: (this.facility_fee + this.equipment_fee) > 0,
            schedule: this.schedule
        };
    }
}

module.exports = Booking;
