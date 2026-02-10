class UserEntity {
    constructor(id, username, roleId, passwordHash, createdAt = '', updatedAt = '', email = null) {
        this.id = id;
        this.username = username;
        this.role_id = roleId; // Using snake_case for DB fields compatibility or mapping? PHP used roleId but DB row is role_id.
        // PHP: private int $roleId; but constructor uses $roleId. toPublicArray uses 'role_id'.
        // Let's use camelCase for properties but map from DB.
        this.roleId = roleId;
        this.passwordHash = passwordHash;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.email = email;
        this.firstName = null;
        this.lastName = null;
        this.middleName = null;
        this.roleName = null;
    }

    static fromRow(row) {
        const user = new UserEntity(
            row.id,
            row.username,
            row.role_id,
            row.password_hash,
            row.created_at || '',
            row.updated_at || '',
            row.email || null
        );
        user.roleName = row.role_name || null;
        user.firstName = row.fname || null;
        user.lastName = row.lname || null;
        user.middleName = row.mname || null;
        return user;
    }

    // Getters are not strictly needed in JS as properties are public, but for compatibility...
    getId() { return this.id; }
    getUsername() { return this.username; }
    getRoleId() { return this.roleId; }
    getPasswordHash() { return this.passwordHash; }
    getCreatedAt() { return this.createdAt; }
    getUpdatedAt() { return this.updatedAt; }
    getRoleName() { return this.roleName; }
    getEmail() { return this.email; }

    toPublicArray() {
        return {
            id: this.id,
            username: this.username,
            role_id: this.roleId,
            role_name: this.roleName,
            email: this.email,
            created_at: this.createdAt,
            created_at: this.createdAt,
            updated_at: this.updatedAt,
            first_name: this.firstName,
            last_name: this.lastName,
            middle_name: this.middleName
        };
    }
}

module.exports = UserEntity;
