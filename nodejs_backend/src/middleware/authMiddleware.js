const Jwt = require('../core/jwt');
const { pool } = require('../core/database');
const UserEntity = require('../models/userEntity');

// We might move this to a Repository later, but for Middleware independence we can query here 
// or require the repository if we are strict about layering. 
// Given the migration plan, let's keep it self-contained or use a service helper if needed.
// For now, direct query to ensure it works without waiting for Repository migration.

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing Bearer token', received: authHeader });
    }

    const token = authHeader.substring(7).trim();

    try {
        const payload = Jwt.verify(token);

        // Payload has sub (userId) and role
        const userId = payload.sub;
        const role = payload.role;

        if (!userId || !role) {
            return res.status(401).json({ error: 'Invalid token payload' });
        }

        // Check if user exists and get details
        // PHP logic: $this->userRepo->findById($userId);
        // We replicate the query here:
        const [rows] = await pool.query(
            `SELECT u.*, r.name AS role_name
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.id = ?`,
            [userId]
        );

        if (rows.length === 0) {
            console.warn(`[AuthMiddleware] User not found in DB for ID: ${userId}`);
            return res.status(404).json({ error: 'User not found' });
        }

        const user = UserEntity.fromRow(rows[0]);

        console.log(`[AuthMiddleware] User found: ${user.id}, RoleID: ${user.role_id}, RoleName: ${user.roleName}`);

        // Attach to request
        req.user = user;
        req.userId = userId;
        req.role = role; // This is the role from the token, not necessarily the DB role_name

        next();

    } catch (error) {
        console.error('[AuthMiddleware] Token verification failed or other error:', error.message, { token: token ? token.substring(0, 10) + '...' : 'empty' });
        return res.status(401).json({
            error: 'Unauthorized',
            detail: error.message
        });
    }
};

module.exports = authMiddleware;
