const express = require('express');
const bodyParser = require('body-parser');
const { Storage } = require('@google-cloud/storage');
const multer = require('multer');
const fetch = require("node-fetch");
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const jwt = require("jsonwebtoken");
const projectId = "cloud-446119 "; // Replace with your Google Cloud Project ID
const location = "asia-south1"; // Nearest Google Cloud Transcoder API region for Pakistan


// Middleware to handle file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, 
});

const app = express();
// Middleware to enable CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE'); // Allowed methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allowed headers
  if (req.method === 'OPTIONS') {
      // Respond to preflight request
      return res.status(204).send('');
  }
  next();
});

const port = 8080;


const JWT_SECRET ="APAAr/1/sEIVyc+/j/HtgpTVhZD/UXNjyVym0tZbMZM=";

app.use(bodyParser.json());
require('dotenv').config(); 

process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS; // Assuming this is set in your .env file

// Initialize Google Cloud Storage
const storage = new Storage();
const bucket = storage.bucket('granger01'); // Replace with your actual bucket name

const bucketName='granger01';
/**
 * Route: List all objects in a specific folder in the bucket
 * Method: GET
 */
app.get('/all_name', async (req, res) => {
  const { name } = req.query;
  console.log("here");
  if (!name) {
    return res.status(400).json({ error: 'Folder name is required' });
  }

  try {
    const folderPath = `${name}/`;
    const [files] = await storage.bucket(bucketName).getFiles({ prefix: folderPath });

    const fileDetails = await Promise.all(files.map(async (file) => {
      const [metadata] = await file.getMetadata();

      return {
        name: metadata.metadata?.originalName || 'Unknown', // Original file name
        storedName: file.name, // Name with which the file is stored
        size: parseInt(metadata.size), // File size in bytes
        sizeInMB: (parseInt(metadata.size) / (1024 * 1024)).toFixed(2) + ' MB', // File size in MB
        uploadedAt: metadata.metadata?.uploadedAt || metadata.timeCreated, // Upload timestamp
        contentType: metadata.contentType, // MIME type
        fileId: metadata.metadata?.fileId || 'no-id', // Custom UUID if available
        generation: metadata.generation, // GCP's unique identifier
      };
    }));

    res.json({ objects: fileDetails });
  } catch (err) {
    console.error('Error listing objects in folder:', err);
    res.status(500).json({ error: 'Error listing objects in folder' });
  }
});




app.get('/stream', async (req, res) => {
  const { fileName } = req.query; // Get the file name (including folder name) from query params

  if (!fileName) {
    return res.status(400).json({ error: 'FileName is required' });
  }

  try {
    // Extract the folder name and file name (UUID) from the fileName string
    const [folderName, fileId] = fileName.split('/');

    if (!folderName || !fileId) {
      return res.status(400).json({ error: 'Invalid file name format. Expecting folderName/uuid.' });
    }

    // Construct the full path in Cloud Storage
    const fullFilePath = `${folderName}/${fileId}`;

    // Retrieve files from the Cloud Storage bucket using the folder prefix
    const [files] = await storage.bucket(bucketName).getFiles({ prefix: fullFilePath });

    // Find the file with the exact path
    const matchingFile = files.find((file) => file.name === fullFilePath);

    if (!matchingFile) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Generate a signed URL for the matching file
    const options = {
      version: 'v4',
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    };

    const [signedUrl] = await matchingFile.getSignedUrl(options);

    res.json({ signedUrl }); // Return the signed URL
  } catch (error) {
    console.error('Error finding or streaming video:', error);
    res.status(500).json({ error: 'Failed to process the request' });
  }
});


app.post("/upload", upload.single("file"), async (req, res) => {
  const file = req.file;  // Access file correctly from req.file

  try {
    const { clerk_client_id } = req.headers;
    if (!clerk_client_id || !file) {
      console.log(req.body, req.headers, file); // Log for debugging
      return res.status(400).json({ error: "User ID and file are required" });
    }
    // console.log(file);

    const folderPath = `${clerk_client_id}/`; // Using the client ID as part of the path
    const fileSizeMB = file.size / (1024 * 1024); // Size in MB

    // Generate a UUID for the file name
    const uuid = uuidv4();
    const destination = `${folderPath}${uuid}`; // Destination path in your bucket

    const cloudFile = bucket.file(destination); // The cloud storage file reference

    // Add metadata with the original name and other details
    const metadata = {
      metadata: {
        contentType: file.mimetype,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        fileId: uuid,
        originalName: file.originalname,
      },
    };

    // Save the file to Google Cloud Storage with metadata
    await cloudFile.save(file.buffer, { metadata });

    // Return a success response
    return res.status(200).json({
      message: `File uploaded successfully with UUID: ${uuid}`,
      fileId: uuid,
    });

  } catch (error) {
    console.error("Error processing upload:", error);
    return res.status(500).json({ error: "Failed to upload file" });
  }
});


// // Helper function to check resource limits
// async function fetchResourceMonitor(userId, fileSizeMB) {
//   try {
//     const response = await fetch("https://us-central1-resource-monitor-service.cloudfunctions.net/resource-monitor/usage", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ userId, fileSizeMB }),
//     });

//     const responseData = await response.json();
//     return responseData;
//   } catch (error) {
//     console.error("Error checking resource limits:", error);
//     return { error: "Failed to check resource limits" };
//   }
// }
/**
 * Route: Delete an object from the bucket
 * Method: DELETE
 * URL: /objects?name=folderName&fileName=filename
 */
app.delete('/objects', async (req, res) => {
  const { fileName } = req.query; // Get file name (in folder/name_to_file format)

  if (!fileName) {
    return res.status(400).json({ error: 'File name is required' });
  }

  try {
    // fileName is in the format folder/name_to_file
    const file = storage.bucket(bucketName).file(fileName);

    // Get the metadata to check file size before deletion
    const [metadata] = await file.getMetadata();
    const fileSizeInMB = parseInt(metadata.size) / (1024 * 1024); // Convert bytes to MB
    console.log(`File size: ${fileSizeInMB.toFixed(2)} MB`);

    // Delete the file from the storage bucket
    await file.delete();

    // After deleting, update the usage monitoring (resource monitor service)
    const response = await fetch("https://us-central1-resource-monitor-service.cloudfunctions.net/resource-monitor/usage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileSizeMB: -fileSizeInMB // Send negative value as per the API documentation to free up the quota
      }),
    });

    await response.json(); // If return 0 then success

    // Send a success response
    res.json({ message: `File ${fileName} deleted successfully` });
  } catch (err) {
    console.error('Error deleting file:', err);
    res.status(500).json({ error: `Error deleting file: ${fileName}` });
  }
});

/**
 * Route: Delete an entire folder from the bucket
 * Method: DELETE
 * URL: /folder?name=folderName
 */
app.delete('/folder', async (req, res) => {
    const { name } = req.query; // Get the folder name from the query parameters
  
    if (!name) {
      return res.status(400).json({ error: 'Folder name is required' });
    }
  
    try {
      const folderPath = `${name}/`; // Prefix for the folder
      const bucket = storage.bucket(bucketName);
  
      // Get all files within the folder
      const [files] = await bucket.getFiles({ prefix: folderPath });
  
      if (files.length === 0) {
        return res.status(404).json({ message: `Folder ${name} is empty or does not exist` });
      }

      // Calculate total size
      let totalSizeInMB = 0;
      for (const file of files) {
        const [metadata] = await file.getMetadata();
        const fileSizeInMB = parseInt(metadata.size) / (1024 * 1024); // Convert bytes to MB
        totalSizeInMB += fileSizeInMB;
      }

      console.log(`Total folder size: ${totalSizeInMB.toFixed(2)} MB`);

      // Delete all files in the folder
      await Promise.all(files.map(file => file.delete()));

      // after deleting update the usage monitoring (call resource-monitor service)
      const response = await fetch("https://us-central1-resource-monitor-service.cloudfunctions.net/resource-monitor/usage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          fileSizeMB: -totalSizeInMB // according to api when we delete its negative value (its size should be negative otherwise if positive then it will be added to consumed instead of freeing quota of user)
        }),
      })

      await response.json(); // if return 0 then success
  
      res.json({ 
        message: `Folder ${name} and all its contents (${totalSizeInMB.toFixed(2)} MB) deleted successfully` 
      });
    } catch (err) {
      console.error('Error deleting folder:', err);
      res.status(500).json({ error: `Error deleting folder: ${name}` });
    }
  });
  
// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
