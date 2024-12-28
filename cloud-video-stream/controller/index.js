// const CLERK_USER_ID = "usr_xxj9bjsz8i2p2w7flmda8xl3f";

// clerk client id is the virtual directory 
// so for testing i am using clerk id as test-folder 



// let CLERK_CLIENT_ID = "test-folder";

const express = require('express');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
require('dotenv/config');

const { ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node');

// const cors = require('cors');

// Add logging utility function
async function logEvent(event, status, userId, fileName=null) {
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    // logging getting filenames
    // await fetch("https://us-central1-logs-project-445110.cloudfunctions.net/logging", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       user_id: userId,
    //       event: "get_files",
    //       status: "success"

    //     }),
    //   })

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(`https://us-central1-logs-project-445110.cloudfunctions.net/logging`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    event,
                    status,
                    timestamp: new Date().toISOString(),
                    user_id: userId,
                    fileName
                })
            });
            
            if (response.ok) {
                return true;
            }
        } catch (error) {
            console.log(`Logging attempt ${attempt} failed:`, error.message);
            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
    }
    return false;
}

exports.controller = async (req, res) => {
    // console.log("METHOD " , req.method, ' URL', req.url);

    // clerk client id below (which is also the folderName of the bucket) is the virtual directory
    // so for testing i am using clerk id as test-folder
    

    const { userId } = req.auth;
    console.log("authObj: ", req.auth);
    let CLERK_CLIENT_ID = userId;

    // console.log("user id: ", userId);

    

    if (!req.auth || !req.auth.userId) {
        return res.status(401).json({ error: 'Unauthorized. Please log in.' });
      }

    const { body } = req;
    
    // here event can be "upload, get-all-videos, delete, delete-all, stream"
    const { event } = body;

    // console.log("event: ", event);

    const JWT_SECRET ="APAAr/1/sEIVyc+/j/HtgpTVhZD/UXNjyVym0tZbMZM=";
    let token;


    try {

        switch (event) {
            case "upload":
                // Upload video
                try {
                    const { userId } = req.auth; // Assuming userId comes from authenticated user
                    const fileSizeMB = req.file.size / (1024 * 1024); // Calculate file size in MB
            
                    // Check usage before proceeding with upload
                    const usageResponse = await fetch('http://localhost:8081/usage', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ userId, fileSizeMB }),
                    });
            
                    const usageData = await usageResponse.json();
            
                    // If the response from the usage API indicates that the limit is exceeded, throw an error
                    if (usageData.response !== 0) {
                        return res.status(400).json({
                            error: `Upload limit exceeded. Current usage: ${usageData.response}`,
                        });
                    }
            
                    // Now, proceed with file upload if usage check passes
                    const formData = new FormData();
                    formData.append("file", req.file); // Assuming `req.file` contains the file to be uploaded
                    formData.append("clerk_client_id", CLERK_CLIENT_ID); // Adding client ID as part of the form data
            
                    const uploadResponse = await fetch('http://localhost:8081/upload', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                        body: formData,
                    });
            
                    if (!uploadResponse.ok) {
                        throw new Error(`Upload API error: ${uploadResponse.statusText}`);
                    }
            
                    const uploadResponseData = await uploadResponse.json();
                    if (uploadResponseData.error) {
                        throw new Error(`Failed to upload: ${uploadResponseData.error}`);
                    }
            
                    // Return the generated token and upload response
                    return res.json({
                        token,
                        uploadResult: uploadResponseData, // Include the upload response (e.g., fileId)
                    });
            
                } catch (err) {
                    console.error("Error processing upload:", err);
                    return res.status(500).json({ error: "Failed to process upload" });
                }
                break;
            

            case "get-all-videos":
                // get all videos

                // Log start of operation
                // logEvent("get-all-videos", "pending", CLERK_CLIENT_ID)
                //     .catch(err => console.log("Warning: Logging failed:", err.message));

                // const response = await fetch(`https://storage-microservice-796253357501.us-central1.run.app/all_name?name=${CLERK_CLIENT_ID}`, {
                const response = await fetch(`http://localhost:8080/all_name?name=${CLERK_CLIENT_ID}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                const data = await response.json();

                console.log("get all videos : ",data);

                // Log completion
                if (response.ok) {
                    logEvent("get-all-videos", "success", CLERK_CLIENT_ID)
                        .catch(err => console.log("Warning: Logging failed:", err.message));
                } else {
                    logEvent("get-all-videos", "failed", CLERK_CLIENT_ID)
                        .catch(err => console.log("Warning: Logging failed:", err.message));
                }

                return res.json(data);

                break;

            case "delete":
                // delete video
                const {fileName} = body;

                logEvent("delete", "pending", CLERK_CLIENT_ID, fileName)
                    .catch(err => console.log("Warning: Logging failed:", err.message));

                {
                    

                    console.log("fileName: ", fileName);
                    
                    const response = await fetch(`https://storage-microservice-796253357501.us-central1.run.app/objects?name=${CLERK_CLIENT_ID}&fileName=${fileName}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });

                    const msg = await response.json();


                    // Log completion
                    if (response.ok) {
                        logEvent("delete", "success", CLERK_CLIENT_ID, fileName)
                            .catch(err => console.log("Warning: Logging failed:", err.message));
                    } else {
                        logEvent("delete", "failed", CLERK_CLIENT_ID, fileName)
                            .catch(err => console.log("Warning: Logging failed:", err.message));
                    }


                    return res.json(msg);
                }

                
                break;
            case "delete-all":
                // delete all videos

                logEvent("delete", "pending", CLERK_CLIENT_ID)
                    .catch(err => console.log("Warning: Logging failed:", err.message));

                {
                    const response = await fetch(`https://storage-microservice-796253357501.us-central1.run.app/folder?name=${CLERK_CLIENT_ID}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });

                    const msg = await response.json();

                    // Log completion
                    if (response.ok) {
                        logEvent("delete-all", "success", CLERK_CLIENT_ID)
                            .catch(err => console.log("Warning: Logging failed:", err.message));
                    } else {
                        logEvent("delete-all", "failed", CLERK_CLIENT_ID)
                            .catch(err => console.log("Warning: Logging failed:", err.message));
                    }

                    return res.json(msg);
                }

                
                
                break;
                case "stream":
                    // Stream video
                    try {
                        const response = await fetch(`http://localhost:8081/stream?fileName=${body.fileName}`);
                        if (!response.ok) {
                            throw new Error(`Error: ${response.statusText}`);
                        }
                
                        const data = await response.json();
                        if (data.signedUrl) {
                            console.log('Stream URL:', data.signedUrl);
                
                            // Send back the signed URL as a response
                            return {
                                status: "success",
                                signedUrl: data.signedUrl
                            };
                        } else {
                            console.error('Error: No signed URL received');
                            return {
                                status: "error",
                                message: "No signed URL received from the server."
                            };
                        }
                    } catch (err) {
                        console.error('Error streaming video:', err);
                        return {
                            status: "error",
                            message: `Failed to fetch signed URL: ${err.message}`
                        };
                    }
                

            case "monitoring":
                logEvent("request-resource-monitor", "success", CLERK_CLIENT_ID)
                    .catch(err => console.log("Warning: Logging failed:", err.message));

                    {const response = await fetch(`https://us-central1-resource-monitor-service.cloudfunctions.net/resource-monitor/usage?userId=${CLERK_CLIENT_ID}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });

                    const msg = await response.json();

                    return res.json(msg);
                    }

                    break;

            default:
                break;
        }
        
    } catch (error) {
        // Log error
        logEvent(event, "error", CLERK_CLIENT_ID)
            .catch(err => console.log("Warning: Logging failed:", err.message));
            
        console.log("Error in controller function: ", error);
        res.status(500).json({
            message: "Error in controller function",
            time: new Date().toISOString()
        });
    }

    // res.json({
    //     message: "controller function called",
    //     time: new Date().toISOString()
    // })

};

const app = express();

app.use(express.json());

// Add CORS middleware

// app.use(cors({
//     origin: 'http://your-frontend-domain.com',
//     credentials: true
// }));

// Middleware to verify the Clerk session


// Use the middleware

app.use(
    ClerkExpressWithAuth()
  );

app.all('/controller', exports.controller);

app.listen(3000, ()=> console.log("server running on port: 3000"));