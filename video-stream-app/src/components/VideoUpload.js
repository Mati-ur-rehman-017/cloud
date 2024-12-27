// // import React, { useState, useCallback } from "react";
// // import { useDropzone } from "react-dropzone";
// // import { toast } from "react-toastify";
// // import { useAuth, useUser } from "@clerk/clerk-react"; // Add Clerk import for user context
// // import "./../index.css";
// // import { SignInButton } from "@clerk/clerk-react";
// // import Server from "../server/server";

// // export default function VideoUpload({ onUploadSuccess }) {
// //   const { getToken } = useAuth();

// //   const { isSignedIn } = useUser(); // Check if the user is logged in
// //   const [uploadProgress, setUploadProgress] = useState(0);
// //   const [file, setFile] = useState(null);

// //   // const onDrop = useCallback((acceptedFiles) => {
// //   //   const file = acceptedFiles[0];
// //   //   if (file) {
// //   //     uploadFile(file);
// //   //   }
// //   // }, []);

// //   // const { getRootProps, getInputProps, isDragActive } = useDropzone({
// //   //   onDrop,
// //   //   accept: {
// //   //     "video/mp4": [".mp4"],
// //   //     "video/quicktime": [".mov"],
// //   //     "video/x-msvideo": [".avi"],
// //   //   },
// //   // });

// //   const uploadFile = (file) => {
// //     const reader = new FileReader();
// //     reader.onprogress = (event) => {
// //       if (event.lengthComputable) {
// //         const percentCompleted = Math.round((event.loaded * 100) / event.total);
// //         setUploadProgress(percentCompleted);
// //       }
// //     };
// //     reader.onload = () => {
// //       setTimeout(() => {
// //         setUploadProgress(100);
// //         toast.success("Video uploaded successfully");
// //         onUploadSuccess({
// //           id: Date.now(),
// //           title: file.name,
// //           url: URL.createObjectURL(file),
// //           thumbnail: "/placeholder.svg?height=150&width=250",
// //           size: file.size,
// //           uploadDate: new Date().toISOString(),
// //         });
// //         setUploadProgress(0);
// //       }, 1500);
// //     };
// //     reader.readAsArrayBuffer(file);
// //   };

// //   if (!isSignedIn) {
// //     return (
// //       <>
// //         <p className="text-lg text-gray-700 mb-4">
// //           Please login to upload a video.
// //         </p>
// //         <SignInButton>Sign In</SignInButton>
// //       </>
// //     );
// //   }

// //   const fetchToken = async () => {
// //     try {
// //       const token = await getToken(); // Call getToken() to get the session token
// //       console.log("Session Token:", token);
// //       return token;
// //     } catch (error) {
// //       console.error("Error fetching token:", error);
// //     }
// //   };

// //   async function handleUpload(e) {
// //     e.preventDefault();

// //     try {
// //       const sessionToken = await fetchToken();
// //       console.log("Session Token: ", sessionToken);
// //       const formData = new FormData();
// //       formData.append("file", file);

// //       const response = await fetch(
// //         "https://us-central1-controller-445319.cloudfunctions.net/controller-service/controller",
// //         {
// //           method: "POST",
// //           headers: {
// //             Authorization: `Bearer ${sessionToken}`, // Add the token to the Authorization header
// //             "Content-Type": "application/json", // Add Content-Type header if necessary
// //           },
// //           body: JSON.stringify({ event: "upload" }),
// //         }
// //       );
// //       if (response.ok) {
// //         const { token } = await response.json();
// //         // console.log("Upload successful:", token);
// //         const responseUpload = await fetch(
// //           "https://storage-service-796253357501.us-central1.run.app/upload",
// //           {
// //             method: "POST",
// //             headers: {
// //               Authorization: `Bearer ${token}`, // Add the token to the Authorization header

// //             },
// //             body: formData,
// //           }
// //         );
// //         if (responseUpload.ok) {
// //           const resultUpload = await responseUpload.json();
// //           console.log("Upload Success: ", resultUpload);
// //         }
// //       } else {
// //         console.error("Upload failed:", response.status, response.statusText);
// //       }
// //     } catch (e) {
// //       console.error("Error during upload:", e);
// //     }
// //   }

// //   const handleFileChange = (e) => {
// //     setFile(e.target.files[0]);
// //   };
// //   return (
// //     <div className="mt-8">
// //       {/* <div
// //         {...getRootProps()}
// //         className={`border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer ${
// //           isDragActive ? "border-blue-500 bg-blue-50" : ""
// //         }`}
// //       >
// //         <input {...getInputProps()} />
// //         {isDragActive ? (
// //           <p className="text-lg text-blue-500">Drop the video here...</p>
// //         ) : (
// //           <p className="text-lg text-gray-500">
// //             Drag and drop a video here, or click to select a file
// //           </p>
// //         )}
// //         <p className="mt-2 text-sm text-gray-500">
// //           Supported formats: .mp4, .mov, .avi
// //         </p> */}
// //       <form onSubmit={handleUpload}>
// //         <input type="file" onChange={handleFileChange} />
// //         <button onClick={handleUpload}>Submit</button>
// //       </form>
// //       {/* <button type="submit">onClick</button> */}
// //       {/* </div> */}
// //       {uploadProgress > 0 && (
// //         <>
// //           <div className="mt-4">
// //             <div className="bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
// //               <div
// //                 className="bg-blue-600 h-2.5 rounded-full"
// //                 style={{ width: `${uploadProgress}%` }}
// //               ></div>
// //             </div>
// //             <p className="mt-2 text-sm text-gray-500 text-center">
// //               {uploadProgress}% uploaded
// //             </p>
// //           </div>
// //         </>
// //       )}
// //     </div>
// //   );
// // }

// import React, { useState } from "react";
// import { useAuth, useUser, SignInButton } from "@clerk/clerk-react";
// import { toast } from "react-toastify";
// import "./../index.css";

// export default function VideoUpload({ onUploadSuccess }) {
//   const { getToken } = useAuth();
//   const { isSignedIn } = useUser(); // Check if the user is logged in
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [file, setFile] = useState(null);
//   const [showSuccessMessage, setShowSuccessMessage] = useState(false);

//   // Fetch the session token
//   const fetchToken = async () => {
//     try {
//       const token = await getToken();
//       console.log("Session Token:", token);
//       return token;
//     } catch (error) {
//       console.error("Error fetching token:", error);
//       toast.error("Authentication failed.");
//     }
//   };

//   // Handle the file upload
//   const handleUpload = async (e) => {
//     e.preventDefault();

//     if (!file) {
//       console.error("No file selected for upload.");
//       toast.error("Please select a file to upload.");
//       return;
//     }

//     try {
//       const sessionToken = await fetchToken();
//       if (!sessionToken) {
//         console.error("No session token available.");
//         toast.error("Authentication failed.");
//         return;
//       }
//       console.log("Session Token: ", sessionToken);

//       // First POST request to initiate upload and get token
//       const response = await fetch(
//         "https://us-central1-controller-445319.cloudfunctions.net/controller-service/controller",
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${sessionToken}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ event: "upload" }),
//         }
//       );

//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error(
//           "Upload initiation failed:",
//           response.status,
//           response.statusText,
//           errorText
//         );
//         toast.error("Failed to initiate upload.");
//         return;
//       }

//       const { token } = await response.json();
//       console.log("Upload Token:", token);

//       // Prepare FormData for file upload
//       const formData = new FormData();
//       formData.append("file", file);

//       // Second POST request to upload the file
//       const responseUpload = await fetch(
//         "https://storage-service-796253357501.us-central1.run.app/upload",
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${token}`, // Include the token
//           },
//           body: formData,
//         }
//       );

//       if (responseUpload.ok) {
//         console.log("File uploaded successfully.");

//         // Show success message
//         setShowSuccessMessage(true);
//         setTimeout(() => setShowSuccessMessage(false), 3000); // Hide message after 3 seconds

//         // Fetch the updated list of videos from the server
//         fetchUpdatedVideos(); // This ensures the updated tiles are fetched
//         setUploadProgress(0);
//         setFile(null); // Reset the file input
//       } else {
//         const errorText = await responseUpload.text();
//         console.error(
//           "Error uploading file:",
//           responseUpload.status,
//           responseUpload.statusText,
//           errorText
//         );
//         toast.error(`Failed to upload video: ${errorText}`);
//       }
//     } catch (e) {
//       console.error("Error during upload:", e);
//       toast.error("An unexpected error occurred during upload.");
//     }
//   };

//   const fetchUpdatedVideos = async () => {
//     try {
//       const sessionToken = await fetchToken();
//       const response = await fetch(
//         "https://us-central1-controller-445319.cloudfunctions.net/controller-service/controller",
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${sessionToken}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ event: "get-all-videos" }),
//         }
//       );

//       if (response.ok) {
//         const data = await response.json();
//         console.log("Fetched updated video list: ", data);

//         // Call the parent handler to update the video list in the parent component
//         onUploadSuccess(data.objects); // Assuming `data.objects` contains the list of videos
//       } else {
//         console.error("Failed to fetch updated videos.");
//       }
//     } catch (e) {
//       console.error("Error fetching updated videos:", e);
//     }
//   };

//   // Handle file input change
//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     if (selectedFile) {
//       console.log("Selected file:", selectedFile);
//       setFile(selectedFile);
//     } else {
//       console.log("No file selected.");
//     }
//   };

//   if (!isSignedIn) {
//     return (
//       <div className="flex flex-col items-center justify-center mt-8">
//         <p className="text-lg text-gray-700 mb-4">
//           Please login to upload a video.
//         </p>
//         <SignInButton className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300">
//           Sign In
//         </SignInButton>
//       </div>
//     );
//   }

//   return (
//     <div className="mt-8 flex flex-col items-center  text-white">
//       {showSuccessMessage && (
//         <div className="bg-green-700 text-white px-6 py-3 rounded mb-6 text-center text-sm font-semibold shadow-lg">
//           Video uploaded successfully!
//         </div>
//       )}
//       <form
//         onSubmit={handleUpload}
//         className="w-full max-w-md bg-gray-900 p-6 rounded-lg shadow-lg"
//       >
//         <input
//           type="file"
//           accept="video/mp4,video/quicktime,video/x-msvideo"
//           onChange={handleFileChange}
//           className="mb-4 w-full p-3 border border-gray-700 rounded bg-gray-800 text-gray-300 placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600"
//           placeholder="Choose a file"
//         />
//         <button
//           type="submit"
//           className="bg-red-600 text-white px-4 py-2 rounded w-full hover:bg-red-700 transition duration-300 font-bold"
//         >
//           Upload Video
//         </button>
//       </form>
//       {uploadProgress > 0 && (
//         <div className="mt-6 w-full max-w-md">
//           <div className="bg-gray-700 rounded-full h-2.5">
//             <div
//               className="bg-red-600 h-2.5 rounded-full"
//               style={{ width: `${uploadProgress}%` }}
//             ></div>
//           </div>
//           <p className="mt-3 text-sm text-gray-400 text-center">
//             {uploadProgress}% uploaded
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useState } from "react";
import { useAuth, useUser, SignInButton } from "@clerk/clerk-react";
import { toast } from "react-toastify";
import "./../index.css";

export default function VideoUpload({ onUploadSuccess }) {
  const { getToken } = useAuth();
  const { isSignedIn } = useUser(); // Check if the user is logged in
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const fetchToken = async () => {
    try {
      const token = await getToken();
      console.log("Session Token:", token);
      return token;
    } catch (error) {
      console.error("Error fetching token:", error);
      toast.error("Authentication failed.");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      console.error("No file selected for upload.");
      toast.error("Please select a file to upload.");
      return;
    }

    try {
      setIsUploading(true); // Show uploading graphic
      const sessionToken = await fetchToken();
      if (!sessionToken) {
        console.error("No session token available.");
        toast.error("Authentication failed.");
        setIsUploading(false);
        return;
      }
      console.log("Session Token: ", sessionToken);

      const response = await fetch(
        "https://us-central1-controller-445319.cloudfunctions.net/controller-service/controller",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ event: "upload" }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "Upload initiation failed:",
          response.status,
          response.statusText,
          errorText
        );
        toast.error("Failed to initiate upload.");
        setIsUploading(false);
        return;
      }

      const { token } = await response.json();
      console.log("Upload Token:", token);

      const formData = new FormData();
      formData.append("file", file);

      const responseUpload = await fetch(
        "https://storage-service-796253357501.us-central1.run.app/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (responseUpload.ok) {
        console.log("File uploaded successfully.");

        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000); // Show success message
        fetchUpdatedVideos();
        setFile(null);
      } else {
        const errorText = await responseUpload.text();
        console.error(
          "Error uploading file:",
          responseUpload.status,
          responseUpload.statusText,
          errorText
        );
        toast.error(`Failed to upload video: ${errorText}`);
      }
    } catch (e) {
      console.error("Error during upload:", e);
      toast.error("An unexpected error occurred during upload.");
    } finally {
      setUploadProgress(0);
      setIsUploading(false); // Hide uploading graphic
    }
  };

  const fetchUpdatedVideos = async () => {
    try {
      const sessionToken = await fetchToken();
      const response = await fetch(
        "https://us-central1-controller-445319.cloudfunctions.net/controller-service/controller",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ event: "get-all-videos" }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched updated video list: ", data);
        onUploadSuccess(data.objects);
      } else {
        console.error("Failed to fetch updated videos.");
      }
    } catch (e) {
      console.error("Error fetching updated videos:", e);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      console.log("Selected file:", selectedFile);
      setFile(selectedFile);
    } else {
      console.log("No file selected.");
    }
  };

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center mt-8">
        <p className="text-lg text-gray-700 mb-4">
          Please login to upload a video.
        </p>
        <SignInButton className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300">
          Sign In
        </SignInButton>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col items-center  text-white">
      {isUploading && (
        <div className="bg-gray-800 text-white px-6 py-3 rounded mb-6 text-center text-sm font-semibold shadow-lg animate-bounce">
          Uploading video...
        </div>
      )}
      {showSuccessMessage && (
        <div className="bg-green-700 text-white px-6 py-3 rounded mb-6 text-center text-sm font-semibold shadow-lg">
          Video uploaded successfully!
        </div>
      )}
      <form
        onSubmit={handleUpload}
        className="w-full max-w-md bg-gray-900 p-6 rounded-lg shadow-lg"
      >
        <input
          type="file"
          accept="video/mp4,video/quicktime,video/x-msvideo"
          onChange={handleFileChange}
          className="mb-4 w-full p-3 border border-gray-700 rounded bg-gray-800 text-gray-300 placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600"
        />
        <button
          type="submit"
          className="bg-red-600 text-white px-4 py-2 rounded w-full hover:bg-red-700 transition duration-300 font-bold"
        >
          Upload Video
        </button>
      </form>
      {uploadProgress > 0 && (
        <div className="mt-6 w-full max-w-md">
          <div className="bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-red-600 h-2.5 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="mt-3 text-sm text-gray-400 text-center">
            {uploadProgress}% uploaded
          </p>
        </div>
      )}
    </div>
  );
}
