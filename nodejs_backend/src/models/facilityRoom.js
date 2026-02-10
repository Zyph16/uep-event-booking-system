class FacilityRoom {
    constructor(facilityID, roomID) {
        this.facilityID = facilityID;
        this.roomID = roomID;
    }

    static fromRow(row) {
        return new FacilityRoom(
            row.facilityID,
            row.roomID
        );
    }

    getFacilityId() { return this.facilityID; }
    getRoomId() { return this.roomID; }

    toArray() {
        return {
            facilityID: this.facilityID,
            roomID: this.roomID
        };
    }
}

module.exports = FacilityRoom;
