require('dotenv').config();

class Config {
    static get(key, defaultValue = null) {
        return process.env[key] || defaultValue;
    }

    // Expose common config as properties for easier access
    static get DB_HOST() { return process.env.DB_HOST || '127.0.0.1'; }
    static get DB_PORT() { return process.env.DB_PORT || '3306'; }
    static get DB_USER() { return process.env.DB_USER || 'root'; }
    static get DB_PASS() { return process.env.DB_PASS || 'password'; }
    static get DB_NAME() { return process.env.DB_NAME || 'uep_event_booking_db'; }
    static get JWT_SECRET() { return process.env.JWT_SECRET; }
    static get JWT_ISSUER() { return process.env.JWT_ISSUER || 'user-mvc'; }
    static get JWT_EXPIRES_IN() { return process.env.JWT_EXPIRES_IN || 7200; }
}

module.exports = Config;
