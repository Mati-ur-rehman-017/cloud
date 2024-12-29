const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const express = require('express');

const JWT_SECRET = "APAAr/1/sEIVyc+/j/HtgpTVhZD/UXNjyVym0tZbMZM=";

// Multer Setup (memory storage for Cloud Functions)
const upload = multer({ storage: multer.memoryStorage() });

// Logging Utility Function
const logEvent = async (event, status, userId, fileName = null) => {
//   const maxRetries = 3;
//   const retryDelay = 1000; // 1 second

//   for (let attempt = 1; attempt <= maxRetries; attempt++) {
//     try {
//       const response = await fetch(`https://us-central1-logs-project-445110.cloudfunctions.net/logging`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           event,
//           status,
//           timestamp: new Date().toISOString(),
//           user_id: userId,
//           fileName,
//         }),
//       });

//       if (response.ok) {
//         return true;
//       }
//     } catch (error) {
//       console.log(`Logging attempt ${attempt} failed:`, error.message);
//       if (attempt < maxRetries) {
//         await new Promise((resolve) => setTimeout(resolve, retryDelay));
//       }
//     }
//   }
//   return false;
};

// Token Verification Middleware for Cloud Functions
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token missing or malformed' });
  }

  const token = authHeader.split(' ')[1]; // Extract the token

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // Verify and decode the token
    req.user = decoded; // Attach user info to the request
    next();  // Proceed to the route handler
  } catch (err) {
    console.error('Token verification failed:', err);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const handleUpload = async (req, res) => {
    const { userId } = req.user;  // Assuming the user info is stored in req.user after token verification
    const fileSizeMB = req.file.size / (1024 * 1024); // Calculate file size in MB
  
    try {
        console.log("jer")
      // Check if file is provided
      if (!req.file) {
        return res.status(400).json({ error: "File is required" });
      }
        // const usageResponse = await fetch('http://localhost:8081/usage', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({ userId, fileSizeMB }),
        // });
    
        // const usageData = await usageResponse.json();
    
        // if (usageData.response !== 0) {
        //   return res.status(400).json({
        //     error: Upload limit exceeded. Current usage: ${usageData.response},
        //   });
        // }
  
      // Prepare the request body as FormData
      const formData = new FormData();
      formData.append("file", req.file.buffer, req.file.originalname);  // Send the file buffer and original name
      formData.append("clerk_client_id", userId);  // Send the user ID as a header
  
      // Send the POST request to your /upload endpoint
      const uploadResponse = await fetch('http://localhost:8081/upload', {
        method: 'POST',
        headers: {
          // Setting Content-Type is not necessary for FormData, it will be automatically set
          'Content-Type': 'multipart/form-data',  
        },
        body: formData,
      });
  
      // Handle errors from the upload API
      if (!uploadResponse.ok) {
        throw new Error(`Upload API error: ${uploadResponse.statusText}`);
      }
  
      const uploadResponseData = await uploadResponse.json();
  
      // Check for errors in the upload response data
      if (uploadResponseData.error) {
        throw new Error(`Failed to upload: ${uploadResponseData.error}`);
      }
  
      // Return the upload result to the client
      return res.json({
        uploadResult: uploadResponseData,
      });
    } catch (err) {
      console.error("Error processing upload:", err);
      return res.status(500).json({ error: "Failed to process upload" });
    }
  };
  

// Handle Get All Videos
const handleGetAllVideos = async (req, res) => {
  const { userId } = req.auth;
  try {
    const response = await fetch(`http://localhost:8080/all_name?name=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    console.log("get all videos : ", data);

    // Log completion
    if (response.ok) {
      logEvent("get-all-videos", "success", userId).catch((err) => console.log("Warning: Logging failed:", err.message));
    } else {
      logEvent("get-all-videos", "failed", userId).catch((err) => console.log("Warning: Logging failed:", err.message));
    }

    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch videos" });
  }
};

// Handle Stream Video
const handleStream = async (req, res) => {
  const { fileName } = req.body;  // Extract the fileName from the request body

  try {
    const response = await fetch(`http://localhost:8081/stream?fileName=${fileName}`);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.signedUrl) {
      console.log('Stream URL:', data.signedUrl);

      // Send back the signed URL as a response
      return res.json({
        status: "success",
        signedUrl: data.signedUrl
      });
    } else {
      console.error('Error: No signed URL received');
      return res.json({
        status: "error",
        message: "No signed URL received from the server."
      });
    }
  } catch (err) {
    console.error('Error streaming video:', err);
    return res.json({
      status: "error",
      message: `Failed to fetch signed URL: ${err.message}`
    });
  }
};

// Handle Monitoring Resource Usage
const handleMonitoring = async (req, res) => {
  const { userId } = req.user;

  try {
    await logEvent("request-resource-monitor", "success", userId).catch((err) => console.log("Warning: Logging failed:", err.message));

    const response = await fetch(`https://us-central1-resource-monitor-service.cloudfunctions.net/resource-monitor/usage?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const msg = await response.json();
    return res.json(msg);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch resource usage data" });
  }
};

// Main handler for Cloud Function
const handleRequest = async (req, res) => {
  switch (req.method) {
    case 'POST':
      if (req.path === '/upload') {
        upload.single('file')(req, res, () => handleUpload(req, res));
      } else if (req.path === '/stream') {
        return handleStream(req, res);
      } else {
        return res.status(404).json({ error: 'Endpoint not found' });
      }
      break;
    case 'GET':
      if (req.path === '/get-all-videos') {
        return handleGetAllVideos(req, res);
      } else if (req.path === '/monitoring') {
        return handleMonitoring(req, res);
      } else {
        return res.status(404).json({ error: 'Endpoint not found' });
      }
      break;
    case 'DELETE':
      if (req.path === '/delete') {
        return handleDelete(req, res);
      } else {
        return res.status(404).json({ error: 'Endpoint not found' });
      }
      break;
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
};

// Exporting a single function for Cloud Function deployment
exports.api = [verifyToken, handleRequest];
