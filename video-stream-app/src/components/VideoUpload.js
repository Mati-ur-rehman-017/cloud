
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
      const formData = new FormData();
      formData.append("file", file);
      formData.append("event", "upload");
      const sessionToken = await fetchToken();
      if (!sessionToken) {
        console.error("No session token available.");
        toast.error("Authentication failed.");
        setIsUploading(false);
        return;
      }
      console.log("Session Token: ", sessionToken);

      const response = await fetch("http://localhost:3000/controller", {
        method: "POST",
        headers: {
            // Only include Authorization header
            Authorization: `Bearer ${sessionToken}`
            // Don't set Content-Type - browser will set it automatically
        },
        body: formData,
    });
      console.log("jwww");
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

      if (response.ok) {
        console.log("File uploaded successfully.");

        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000); // Show success message
        fetchUpdatedVideos();
        setFile(null);
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
