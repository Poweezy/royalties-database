
const fs = require('fs');
const path = require('path');

// Simulate the window and dcodeIO environment
const context = {
    window: {},
    self: {},
    dcodeIO: {}
};
context.window = context;

const bcryptCode = fs.readFileSync(path.join(__dirname, 'js/bcrypt.min.js'), 'utf8');

// Use a function constructor to isolate the environment and avoid redeclaration issues with 'var'
try {
    const fn = new Function('dcodeIO', 'window', 'self', bcryptCode + '\nreturn dcodeIO.bcrypt;');
    const bcrypt = fn(context.dcodeIO, context.window, context.self);

    if (!bcrypt) {
        // Fallback check if the script didn't attach to dcodeIO as expected in this context
        console.error("Bcrypt not found in dcodeIO after evaluation.");
        process.exit(1);
    }

    const passwords = ["admin123", "auditor123", "manager123"];

    console.log("Generating fresh hashes for demo users:");
    const results = {};
    passwords.forEach(pw => {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(pw, salt);
        results[pw] = hash;
        console.log(`${pw}: ${hash}`);
    });

    const adminMatch = bcrypt.compareSync("admin123", results["admin123"]);
    console.log("\nVerification test (admin123):", adminMatch ? "SUCCESS ✅" : "FAILED ❌");
} catch (e) {
    console.error("Error during bcrypt evaluation:", e);
    process.exit(1);
}
