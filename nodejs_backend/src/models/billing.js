class Billing {
    constructor(billingId, bookingId, issuedBy, facilityFee, equipmentFee, totalAmount, status, createdAt) {
        this.billingId = billingId;
        this.bookingId = bookingId;
        this.issuedBy = issuedBy;
        this.facilityFee = facilityFee;
        this.equipmentFee = equipmentFee;
        this.totalAmount = totalAmount;
        this.status = status;
        this.createdAt = createdAt;
    }

    static fromRow(row) {
        return new Billing(
            row.billing_id,
            row.booking_id,
            row.issued_by,
            parseFloat(row.facility_fee),
            parseFloat(row.equipment_fee),
            parseFloat(row.total_amount),
            row.status,
            row.created_at
        );
    }

    toArray() {
        return {
            billing_id: this.billingId,
            booking_id: this.bookingId,
            issued_by: this.issuedBy,
            facility_fee: this.facilityFee,
            equipment_fee: this.equipmentFee,
            total_amount: this.totalAmount,
            status: this.status,
            created_at: this.createdAt
        };
    }
}

module.exports = Billing;
