const AuthService = require('../services/authService');

class AuthController {
    static async login(req, res) {
        try {
            const { username, password } = req.body;
            const result = await AuthService.login(username, password);
            res.json(result);
        } catch (e) {
            if (e.message === 'Invalid credentials') {
                res.status(401).json({ error: e.message });
            } else {
                res.status(500).json({ error: e.message });
            }
        }
    }

    static async refresh(req, res) {
        try {
            const { refresh_token } = req.body;
            const result = await AuthService.refresh(refresh_token);
            res.json(result);
        } catch (e) {
            res.status(401).json({ error: e.message });
        }
    }
}

module.exports = AuthController;
