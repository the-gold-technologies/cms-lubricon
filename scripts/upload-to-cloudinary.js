require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const publicDir = path.join(__dirname, '..', 'public');

async function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === '.DS_Store') continue;
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      await getAllFiles(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

async function uploadAll() {
  const allFiles = await getAllFiles(publicDir);
  console.log(`Found ${allFiles.length} files to upload to Cloudinary...`);

  const urlMap = {};

  for (const filePath of allFiles) {
    const relFromPublic = path.relative(publicDir, filePath);
    // Relative web path (e.g. /images/logo.png, /favicon.png)
    const webPath = '/' + relFromPublic.replace(/\\/g, '/');
    const fileNameWithoutExt = path.basename(filePath, path.extname(filePath))
      .replace(/[^a-zA-Z0-9_-]/g, '_');

    const subfolder = path.dirname(relFromPublic) === '.' ? '' : path.dirname(relFromPublic).replace(/\\/g, '/');
    const cloudinaryFolder = subfolder ? `lubricon/${subfolder}` : 'lubricon';

    console.log(`Uploading: ${webPath}...`);
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: cloudinaryFolder,
        public_id: fileNameWithoutExt,
        overwrite: true,
        resource_type: 'auto',
      });
      console.log(`✓ ${webPath} -> ${result.secure_url}`);
      urlMap[webPath] = result.secure_url;
    } catch (err) {
      console.error(`✗ Error uploading ${webPath}:`, err.message);
    }
  }

  // Also map /favicon.ico to favicon.png URL if favicon.ico doesn't exist separately
  if (urlMap['/favicon.png'] && !urlMap['/favicon.ico']) {
    urlMap['/favicon.ico'] = urlMap['/favicon.png'];
  }

  const mapPath = path.join(__dirname, 'cloudinary-url-map.json');
  fs.writeFileSync(mapPath, JSON.stringify(urlMap, null, 2));
  console.log(`\nAll uploads completed! URL map saved to ${mapPath}`);
}

uploadAll().catch(console.error);
