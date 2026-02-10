class Room {
    constructor(roomID, room_name, capacity = null, price = 0.0) {
        this.roomID = roomID;
        this.room_name = room_name;
        this.capacity = capacity;
        this.price = price;
    }

    static fromRow(row) {
        return new Room(
            row.roomID,
            row.room_name,
            row.capacity ? parseInt(row.capacity) : null,
            parseFloat(row.price || 0.0)
        );
    }

    getId() { return this.roomID; }
    getName() { return this.room_name; }
    getCapacity() { return this.capacity; }
    getPrice() { return this.price; }

    toArray() {
        return {
            roomID: this.roomID,
            room_name: this.room_name,
            capacity: this.capacity,
            price: this.price.toFixed(2)
        };
    }
}

module.exports = Room;
