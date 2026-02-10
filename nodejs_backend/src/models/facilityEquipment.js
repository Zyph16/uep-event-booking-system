class FacilityEquipment {
    constructor(facilityID, equipmentID, quantity = 1) {
        this.facilityID = facilityID;
        this.equipmentID = equipmentID;
        this.quantity = quantity;
    }

    static fromRow(row) {
        return new FacilityEquipment(
            row.facilityID,
            row.equipmentID,
            parseInt(row.quantity || 1)
        );
    }

    getFacilityId() { return this.facilityID; }
    getEquipmentId() { return this.equipmentID; }
    getQuantity() { return this.quantity; }

    toArray() {
        return {
            facilityID: this.facilityID,
            equipmentID: this.equipmentID,
            quantity: this.quantity
        };
    }
}

module.exports = FacilityEquipment;
