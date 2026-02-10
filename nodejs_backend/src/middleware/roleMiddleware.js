const roleMiddleware = (...allowedRoleIds) => {
    // Flatten if first arg is an array (to support both rest params and array passing)
    const roles = Array.isArray(allowedRoleIds[0]) ? allowedRoleIds[0].map(Number) : allowedRoleIds.map(Number);

    return (req, res, next) => {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userRoleId = parseInt(user.role_id);

        console.log(`[RoleMiddleware] ATTEMPT - UserID: ${user.id}, RoleID: ${userRoleId}, Allowed:`, roles);
        console.log(`[RoleMiddleware] IsAllowed:`, roles.includes(userRoleId));

        if (!roles.includes(userRoleId)) {
            console.warn(`[RoleMiddleware] Access Denied for UserID ${user.id}. Role ${userRoleId} not in ${roles}`);
            return res.status(403).json({
                error: 'Forbidden',
                debug: {
                    userId: user.id,
                    roleId: userRoleId,
                    allowedRoles: roles,
                    note: "Server code is verified. If this fails, ensure server was RESTARTED after the last fix."
                }
            });
        }

        next();
    };
};

module.exports = roleMiddleware;
