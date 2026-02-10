const { pool } = require('../core/database');

class RefreshTokenRepository {
    static async store(userId, token, tokenHash, expiresAt) {
        await pool.query(
            `INSERT INTO refresh_tokens (user_id, token, token_hash, expires_at)
       VALUES (?, ?, ?, ?)`,
            [userId, token, tokenHash, expiresAt]
        );
    }

    static async findValid(tokenHash) {
        const [rows] = await pool.query(
            `SELECT * FROM refresh_tokens
       WHERE token_hash = ?
         AND revoked = 0
         AND expires_at > NOW()
       LIMIT 1`,
            [tokenHash]
        );
        return rows.length ? rows[0] : null;
    }

    static async revoke(id) {
        await pool.query('UPDATE refresh_tokens SET revoked = 1 WHERE id = ?', [id]);
    }
}

module.exports = RefreshTokenRepository;
