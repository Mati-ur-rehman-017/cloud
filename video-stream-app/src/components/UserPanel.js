import "./../index.css";

import React, { useState, useEffect } from "react";
import Header from "./Header";
import VideoUpload from "./VideoUpload";
import VideoGrid from "./VideoGrid";
import SearchFilter from "./SearchFilter";
import Settings from "./Settings";
import ErrorPage from "./ErrorPage";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "@clerk/clerk-react";
import DashboardVideos from "./DashboardVideos";

export default function UserPanel() {
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [videoName, setVideoName] = useState([]);
  const [JWTStreamToken, setJWTStreamToken] = useState("");
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john@example.com",
  });

  // const fetchToken = async () => {
  //   try {
  //     const token = await getToken(); // Call getToken() to get the session token
  //     console.log("Session Token:", token);
  //     return token;
  //   } catch (error) {
  //     console.error("Error fetching token:", error);
  //   }
  // };

  // useEffect(() => {
  //   const fetchObjects = async () => {
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
  //       const data = await response.json();
  //       console.log("Response:", data);

  //       // Extract userID and video names
  //       let userID = "";
  //       let videoNames = [];

  //       data.objects.forEach((url) => {
  //         const parts = url.split("/");
  //         if (!userID) {
  //           userID = parts[0]; // Extract the user ID from the first part of the URL
  //         }
  //         videoNames.push(parts[1]); // Extract the video name from the second part of the URL
  //       });
  //       console.log(userID);
  //       console.log("inside first useEffect: ", videoNames);
  //       setVideoName(videoNames);
  //     } catch (e) {
  //       console.log("Error: ", e);
  //     }
  //   };

  //   fetchObjects();

  //   const getJwtTokenForStream = async () => {
  //     const sessionToken = await fetchToken();

  //     const response = await fetch(
  //       "https://us-central1-controller-445319.cloudfunctions.net/controller-service/controller",
  //       {
  //         method: "POST",
  //         headers: {
  //           Authorization: `Bearer ${sessionToken}`,
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ event: "stream" }),
  //       }
  //     );
  //     const data = await response.json();
  //     setJWTStreamToken(data.token);
  //     // console.log("data token when mounted::", data.token);
  //   };
  //   getJwtTokenForStream();
  // }, []);

  // useEffect(() => {
  //   const renderVideoCards = () => {
  //     const container = document.getElementById("video-name-cards");

  //     container.innerHTML = "";

  //     videoName.forEach((vid) => {
  //       const card = document.createElement("div");
  //       card.className =
  //         "bg-white shadow-md rounded-lg p-4 m-2 text-center cursor-pointer w-full md:w-1/2 hover:bg-blue-100 transition"; // Adjust width for 2-column grid
  //       card.textContent = `Play ${vid}`;
  //       card.onclick = () => {
  //         console.log(`clicked on ${vid}`);
  //         videoClickHandler(vid);
  //       };
  //       container.appendChild(card);
  //     });
  //     // Apply flexbox grid layout to the container
  //     container.className = "flex flex-wrap justify-center gap-1 mt-2";

  //     const videoClickHandler = async (vidName) => {
  //       try {
  //         // const sessionToken = await fetchToken();

  //         // const response = await fetch(
  //         //   "https://us-central1-controller-445319.cloudfunctions.net/controller-service/controller",
  //         //   {
  //         //     method: "POST",
  //         //     headers: {
  //         //       Authorization: `Bearer ${sessionToken}`,
  //         //       "Content-Type": "application/json",
  //         //     },
  //         //     body: JSON.stringify({ event: "stream" }),
  //         //   }
  //         // );

  //         // const data = await response.json();

  //         // console.log("Video Token::", data);

  //         // if (response.ok) {
  //         // console.log(vidName);
  //         try {
  //           const video = await fetch(
  //             `https://storage-service-796253357501.us-central1.run.app/stream-video/${vidName}`,
  //             {
  //               method: "GET",
  //               headers: {
  //                 Authorization: `Bearer ${JWTStreamToken}`,
  //               },
  //             }
  //           );
  //           // if (video) {
  //           //   console.log("Video mil gai");

  //           // }
  //           if (video.ok) {
  //             const videoBlob = await video.blob(); // Convert the response to a Blob
  //             const videoUrl = URL.createObjectURL(videoBlob); // Create a URL for the Blob

  //             // Open a new window and embed the video
  //             const newWindow = window.open();
  //             if (newWindow) {
  //               newWindow.document.write(`
  //                 <html>
  //                   <head>
  //                     <title>Video Player</title>
  //                   </head>
  //                   <body style="margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #000;">
  //                     <video controls autoplay style="max-width: 100%; max-height: 100%;">
  //                       <source src="${videoUrl}" type="video/mp4">
  //                       Your browser does not support the video tag.
  //                     </video>
  //                   </body>
  //                 </html>
  //               `);
  //             } else {
  //               console.error("Unable to open new window.");
  //             }
  //           } else {
  //             console.error(
  //               "Error fetching video:",
  //               video.status,
  //               video.statusText
  //             );
  //           }
  //         } catch (e) {
  //           console.log("Error_2", e);
  //         }
  //         // }
  //       } catch (e) {
  //         console.log("Error_2", e);
  //       }
  //     };
  //   };

  //   renderVideoCards();
  // }, [videoName]);

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUploadSuccess = (newVideo) => {
    setVideos((prevVideos) => [newVideo, ...prevVideos]);
  };

  const handleDeleteVideo = (videoId) => {
    setVideos((prevVideos) =>
      prevVideos.filter((video) => video.id !== videoId)
    );
    toast.success("Video deleted successfully");
  };

  const handleUpdateProfile = (updatedUser) => {
    setUser(updatedUser);
    toast.success("Profile updated successfully");
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  if (error) return <ErrorPage message={error} />;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header user={user} activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="container mx-auto px-4 py-8">
        {activeTab === "dashboard" && (
          <>
            <SearchFilter videos={videos} setVideos={setVideos} />

            {/* Conditionally render the "Delete All" button */}
            {videoName.length > 0 && (
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleDeleteVideo}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
                >
                  Delete All
                </button>
              </div>
            )}

            <DashboardVideos />
            <VideoGrid videos={videos} onDeleteVideo={handleDeleteVideo} />
          </>
        )}
        {activeTab === "upload" && (
          <VideoUpload onUploadSuccess={handleUploadSuccess} />
        )}
      </main>
      <ToastContainer position="bottom-right" />
    </div>
  );
}
