import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const removePhysicalFile = (relativeFilePath) => {
  if (!relativeFilePath) return;

  // Construct absolute file path
  const absolutePath = path.join(__dirname, '..', relativeFilePath);

  fs.unlink(absolutePath, (err) => {
    if (err) {
      console.error(`⚠️ Failed to delete file at ${absolutePath}:`, err.message);
    } else {
      console.log(`🗑️ Successfully deleted orphan file: ${relativeFilePath}`);
    }
  });
};