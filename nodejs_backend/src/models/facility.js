class Facility {
    constructor(facilityID, facility_name, location, capacity, price, status, imagepath, equipment = null, rooms = null, equipment_names = null, room_names = null, equipment_details = [], room_details = [], albums = []) {
        this.facilityID = facilityID;
        this.facility_name = facility_name;
        this.location = location;
        this.capacity = capacity;
        this.price = price;
        this.status = status;
        this.imagepath = imagepath;
        this.equipment = equipment;
        this.rooms = rooms;
        this.equipment_names = equipment_names;
        this.room_names = room_names;
        this.equipment_details = equipment_details;
        this.room_details = room_details;
        this.albums = albums;
    }

    static fromRow(row) {
        return new Facility(
            row.facilityID,
            row.facility_name,
            row.location,
            row.capacity,
            parseFloat(row.price || 0.0),
            row.status,
            row.imagepath || null,
            row.equipment || null,
            row.rooms || null,
            row.equipment_names || null,
            row.room_names || null,
            row.equipment_details || [],
            row.room_details || [],
            row.albums || []
        );
    }

    getId() { return this.facilityID; }
    getName() { return this.facility_name; }
    getLocation() { return this.location; }
    getCapacity() { return this.capacity; }
    getPrice() { return this.price; }
    getStatus() { return this.status; }
    getImagePath() { return this.imagepath; }
    getEquipment() { return this.equipment; }
    getRooms() { return this.rooms; }

    toArray() {
        return {
            facilityID: this.facilityID,
            facility_name: this.facility_name,
            location: this.location,
            capacity: this.capacity,
            price: this.price.toFixed(2),
            status: this.status,
            imagepath: this.imagepath,
            equipment: this.equipment,
            rooms: this.rooms,
            equipment_names: this.equipment_names,
            room_names: this.room_names,
            equipment_details: this.equipment_details,
            room_details: this.room_details,
            albums: this.albums
        };
    }
}

module.exports = Facility;
