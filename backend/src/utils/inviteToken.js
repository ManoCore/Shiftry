// utils/inviteToken.js
const crypto = require('crypto');

const generateInviteToken = () => {
    // Generate a random 32-byte (256-bit) token and convert to hex string
    return crypto.randomBytes(32).toString('hex');
};

module.exports = generateInviteToken;