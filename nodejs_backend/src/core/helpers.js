const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class Helpers {
    static validate(data, rules) {
        const errors = {};
        for (const [field, rule] of Object.entries(rules)) {
            const value = data[field];
            const constraints = rule.split('|');

            for (const constraint of constraints) {
                if (constraint === 'required') {
                    if (value === undefined || value === null || value === '') {
                        if (!errors[field]) errors[field] = [];
                        errors[field].push('is required');
                    }
                }
                if (constraint === 'email') {
                    if (value && !emailRegex.test(value)) {
                        if (!errors[field]) errors[field] = [];
                        errors[field].push('must be a valid email');
                    }
                }
                if (constraint.startsWith('min:')) {
                    const min = parseInt(constraint.substring(4));
                    if (typeof value === 'string' && value.length < min) {
                        if (!errors[field]) errors[field] = [];
                        errors[field].push(`must be at least ${min} characters`);
                    }
                }
            }
        }
        return Object.keys(errors).length > 0 ? errors : null;
    }
}

module.exports = Helpers;
