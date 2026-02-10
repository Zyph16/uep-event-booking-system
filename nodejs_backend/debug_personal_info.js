const PersonalInfoService = require('./src/services/personalInfoService');

async function debug() {
    try {
        console.log("Fetching PersonalInfo for User ID 20 (President)...");
        const info = await PersonalInfoService.getByUserId(20);
        console.log("Service Result:", info);
        if (info) {
            console.log("ToArray:", info.toArray ? info.toArray() : "No toArray method");
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

debug();
