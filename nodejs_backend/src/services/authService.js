const UserEntityRepository = require('../repositories/userEntityRepository');
const RefreshTokenRepository = require('../repositories/refreshTokenRepository');
const Jwt = require('../core/jwt');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

class AuthService {
    static async login(username, password) {
        // 1. Verify User
        // Note: PHP Service was accepting email/password but UserEntityService used username.
        // The PHP code had hardcoded check for 'admin@test.com'.
        // We should probably check username OR email if possible, but let's stick to username as per UserEntityRepository.

        const user = await UserEntityRepository.findByUsername(username);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            throw new Error('Invalid credentials');
        }

        // 2. Create JWT
        const token = Jwt.sign({
            sub: user.id,
            username: user.username,
            role: user.roleName
        });

        // 3. Create Refresh Token
        const refreshToken = crypto.randomBytes(32).toString('hex');
        const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');

        // 4. Store Refresh Token (30 days)
        // MySQL datetime format: YYYY-MM-DD HH:MM:SS
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        // Format for MySQL
        const expiresAtStr = expiresAt.toISOString().slice(0, 19).replace('T', ' ');

        await RefreshTokenRepository.store(user.id, refreshToken, hash, expiresAtStr);

        return {
            user: user.toPublicArray ? user.toPublicArray() : user,
            token,
            refresh_token: refreshToken
        };
    }

    static async refresh(refreshToken) {
        const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');

        const stored = await RefreshTokenRepository.findValid(hash);
        if (!stored) {
            throw new Error('Invalid refresh token');
        }

        // Rotate token
        await RefreshTokenRepository.revoke(stored.id);

        const newRefreshToken = crypto.randomBytes(32).toString('hex');
        const newHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        const expiresAtStr = expiresAt.toISOString().slice(0, 19).replace('T', ' ');

        await RefreshTokenRepository.store(stored.user_id, newRefreshToken, newHash, expiresAtStr);

        // Issue new JWT
        const user = await UserEntityRepository.findById(stored.user_id);
        if (!user) throw new Error('User not found');

        const token = Jwt.sign({
            sub: user.id,
            username: user.username,
            role: user.roleName
        });

        return {
            token,
            refresh_token: newRefreshToken
        };
    }
}

module.exports = AuthService;
