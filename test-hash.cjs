global.window = global;
global.self = global;
const bcrypt = require('./js/bcrypt.min.js');
const hash = "$2a$10$cyE37fP/7BPpcc5wwiq8wOcAnFeCyMzuBRs/eiFkPRkP275q9y2Ci";
const passwords = ["admin123", "auditor123", "manager123", "password123", "admin", "finance"];

console.log("Checking passwords against hash:", hash);
for (const pw of passwords) {
    try {
        const match = bcrypt.compareSync(pw, hash);
        console.log(`- ${pw}: ${match ? "MATCH ✅" : "NO MATCH ❌"}`);
    } catch (e) {
        console.log(`- ${pw}: ERROR ⚠️ (${e.message})`);
    }
}
