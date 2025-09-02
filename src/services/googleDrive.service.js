const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');

class GoogleDriveService {
  constructor() {
    this.drive = null;
    this.auth = null;
    this.isConnected = false;
  }

  async authenticate(credentials) {
    try {
      const { client_id, client_secret, redirect_uri } = credentials;
      
      this.auth = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uri
      );

      const authUrl = this.auth.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/drive.file']
      });

      return { authUrl };
    } catch (error) {
      console.error('Google Drive authentication error:', error);
      throw error;
    }
  }

  async setTokens(tokens) {
    try {
      this.auth.setCredentials(tokens);
      this.drive = google.drive({ version: 'v3', auth: this.auth });
      this.isConnected = true;
      
      // Save tokens for future use
      await this.saveTokens(tokens);
      
      return { success: true };
    } catch (error) {
      console.error('Error setting tokens:', error);
      throw error;
    }
  }

  async saveTokens(tokens) {
    const tokensPath = path.join(__dirname, '../config/google-tokens.json');
    await fs.writeFile(tokensPath, JSON.stringify(tokens, null, 2));
  }

  async loadSavedTokens() {
    try {
      const tokensPath = path.join(__dirname, '../config/google-tokens.json');
      const tokensData = await fs.readFile(tokensPath, 'utf8');
      const tokens = JSON.parse(tokensData);
      
      if (tokens.refresh_token) {
        await this.setTokens(tokens);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async uploadBackup(filePath, fileName) {
    if (!this.isConnected) {
      throw new Error('Google Drive not connected');
    }

    try {
      // Check if backup file already exists
      const existingFile = await this.findBackupFile(fileName);
      
      const fileMetadata = {
        name: fileName,
        parents: ['appDataFolder'] // Store in app-specific folder
      };

      const media = {
        mimeType: 'application/octet-stream',
        body: require('fs').createReadStream(filePath)
      };

      let result;
      if (existingFile) {
        // Update existing file
        result = await this.drive.files.update({
          fileId: existingFile.id,
          media: media
        });
      } else {
        // Create new file
        result = await this.drive.files.create({
          resource: fileMetadata,
          media: media,
          fields: 'id'
        });
      }

      return {
        success: true,
        fileId: result.data.id,
        action: existingFile ? 'updated' : 'created'
      };
    } catch (error) {
      console.error('Google Drive upload error:', error);
      throw error;
    }
  }

  async findBackupFile(fileName) {
    try {
      const response = await this.drive.files.list({
        q: `name='${fileName}' and parents in 'appDataFolder'`,
        spaces: 'appDataFolder',
        fields: 'files(id, name)'
      });

      return response.data.files.length > 0 ? response.data.files[0] : null;
    } catch (error) {
      console.error('Error finding backup file:', error);
      return null;
    }
  }

  async downloadBackup(fileName, downloadPath) {
    if (!this.isConnected) {
      throw new Error('Google Drive not connected');
    }

    try {
      const file = await this.findBackupFile(fileName);
      if (!file) {
        throw new Error('Backup file not found');
      }

      const response = await this.drive.files.get({
        fileId: file.id,
        alt: 'media'
      });

      await fs.writeFile(downloadPath, response.data);
      return { success: true, path: downloadPath };
    } catch (error) {
      console.error('Google Drive download error:', error);
      throw error;
    }
  }

  async listBackups() {
    if (!this.isConnected) {
      throw new Error('Google Drive not connected');
    }

    try {
      const response = await this.drive.files.list({
        q: "parents in 'appDataFolder'",
        spaces: 'appDataFolder',
        fields: 'files(id, name, createdTime, modifiedTime, size)'
      });

      return response.data.files;
    } catch (error) {
      console.error('Error listing backups:', error);
      throw error;
    }
  }

  async deleteBackup(fileId) {
    if (!this.isConnected) {
      throw new Error('Google Drive not connected');
    }

    try {
      await this.drive.files.delete({
        fileId: fileId
      });
      return { success: true };
    } catch (error) {
      console.error('Error deleting backup:', error);
      throw error;
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      hasAuth: !!this.auth
    };
  }
}

module.exports = new GoogleDriveService();