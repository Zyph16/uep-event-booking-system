const jwt = require('jsonwebtoken');
const config = require('./config');

class Jwt {
    static sign(payload) {
        const now = Math.floor(Date.now() / 1000);
        const fullPayload = {
            iss: config.JWT_ISSUER,
            iat: now,
            nbf: now,
            exp: now + parseInt(config.JWT_EXPIRES_IN),
            ...payload
        };
        return jwt.sign(fullPayload, config.JWT_SECRET);
    }

    static verify(token) {
        try {
            // verify throws error if invalid
            return jwt.verify(token, config.JWT_SECRET, {
                issuer: config.JWT_ISSUER
            });
        } catch (error) {
            throw new Error('Invalid or expired token: ' + error.message);
        }
    }
}

module.exports = Jwt;
