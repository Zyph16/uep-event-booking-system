class Notification {
    constructor(notifID, userID, phone, message, type, status, sent_at) {
        this.notifID = notifID;
        this.userID = userID;
        this.phone = phone;
        this.message = message;
        this.type = type;
        this.status = status;
        this.sent_at = sent_at;
    }

    static fromRow(row) {
        return new Notification(
            row.notifID,
            row.userID,
            row.phone || null,
            row.message,
            row.type,
            row.status,
            row.sent_at
        );
    }

    getNotifID() { return this.notifID; }
    getUserID() { return this.userID; }
    getPhone() { return this.phone; }
    getMessage() { return this.message; }
    getType() { return this.type; }
    getStatus() { return this.status; }
    getSentAt() { return this.sent_at; }

    toArray() {
        return {
            notifID: this.notifID,
            userID: this.userID,
            phone: this.phone,
            message: this.message,
            type: this.type,
            status: this.status,
            sent_at: this.sent_at
        };
    }
}

module.exports = Notification;
