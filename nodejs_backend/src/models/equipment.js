class Equipment {
    constructor(equipmentID, equipment_name, description = null, price = 0.0) {
        this.equipmentID = equipmentID;
        this.equipment_name = equipment_name;
        this.description = description;
        this.price = price;
    }

    static fromRow(row) {
        return new Equipment(
            row.equipmentID,
            row.equipment_name,
            row.description || null,
            parseFloat(row.price || 0.0)
        );
    }

    getId() { return this.equipmentID; }
    getName() { return this.equipment_name; }
    getDescription() { return this.description; }
    getPrice() { return this.price; }

    toArray() {
        return {
            equipmentID: this.equipmentID,
            equipment_name: this.equipment_name,
            description: this.description,
            price: this.price.toFixed(2)
        };
    }
}

module.exports = Equipment;
