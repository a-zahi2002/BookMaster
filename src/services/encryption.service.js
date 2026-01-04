const bcrypt = require('bcryptjs');

class EncryptionService {
    constructor() {
        this.saltRounds = 10;
    }

    /**
     * Hash a plain text string (password)
     * @param {string} text - The plain text to hash
     * @returns {Promise<string>} - The hashed string
     */
    async hash(text) {
        try {
            return await bcrypt.hash(text, this.saltRounds);
        } catch (error) {
            console.error('EncryptionService Hash Error:', error);
            throw new Error('Encryption failed');
        }
    }

    /**
     * Compare a plain text string with a hash
     * @param {string} text - The plain text
     * @param {string} hash - The hash to compare against
     * @returns {Promise<boolean>} - True if match, false otherwise
     */
    async compare(text, hash) {
        try {
            return await bcrypt.compare(text, hash);
        } catch (error) {
            console.error('EncryptionService Compare Error:', error);
            throw new Error('Comparison failed');
        }
    }
}

module.exports = new EncryptionService(); // Export singleton
