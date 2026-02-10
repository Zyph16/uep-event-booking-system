class Role {
    constructor(id, name, createdAt = '', updatedAt = '') {
        this.id = id;
        this.name = name;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    static fromRow(row) {
        return new Role(
            row.id,
            row.name,
            row.created_at || '',
            row.updated_at || ''
        );
    }

    getId() { return this.id; }
    getName() { return this.name; }
    getCreatedAt() { return this.createdAt; }
    getUpdatedAt() { return this.updatedAt; }

    toPublicArray() {
        return {
            id: this.id,
            name: this.name,
            created_at: this.createdAt,
            updated_at: this.updatedAt
        };
    }
}

module.exports = Role;
