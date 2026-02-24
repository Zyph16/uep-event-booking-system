class Role {
    constructor(id, name, roleSpecification = 'Regular Account', createdAt = '', updatedAt = '') {
        this.id = id;
        this.name = name;
        this.roleSpecification = roleSpecification;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    static fromRow(row) {
        return new Role(
            row.id,
            row.name,
            row.role_specification || 'Regular Account',
            row.created_at || '',
            row.updated_at || ''
        );
    }

    getId() { return this.id; }
    getName() { return this.name; }
    getRoleSpecification() { return this.roleSpecification; }
    getCreatedAt() { return this.createdAt; }
    getUpdatedAt() { return this.updatedAt; }

    toPublicArray() {
        return {
            id: this.id,
            name: this.name,
            role_specification: this.roleSpecification,
            created_at: this.createdAt,
            updated_at: this.updatedAt
        };
    }
}

module.exports = Role;
