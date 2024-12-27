import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";

export default function DashboardVideos() {
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [videoName, setVideoName] = useState([]);
  const [JWTStreamToken, setJWTStreamToken] = useState("");
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john@example.com",
  });

  const fetchToken = async () => {
    try {
      const token = await getToken();
      console.log("Session Token:", token);
      return token;
    } catch (error) {
      console.error("Error fetching token:", error);
    }
  };

  const fetchVideos = async () => {
    try {
      console.log("Fetching videos from the server...");
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
        console.log("Fetched videos from server:", data);

        const videoDetails = data.objects.map((obj) => {
          const parts = obj.name.split("/");
          console.log("Processing video:", obj.name);
          return {
            videoName: parts[1],
            size: obj.size,
            sizeInMB: obj.sizeInMB,
            uploadedAt: obj.uploadedAt,
            contentType: obj.contentType,
            fileId: obj.fileId,
            generation: obj.generation,
          };
        });

        console.log("Updating state with server-provided videos.");
        setVideoName(videoDetails);
      } else {
        console.error("Failed to fetch videos from server.");
      }
    } catch (e) {
      console.error("Error fetching videos from server:", e);
    }
  };

  const deleteVideoHandler = (vidName) => {
    console.log("Deleting video:", vidName);

    // Instantly update the UI
    setVideoName((prev) => prev.filter((video) => video.videoName !== vidName));

    // Proceed with the backend call
    fetchToken().then((sessionToken) => {
      fetch(
        "https://us-central1-controller-445319.cloudfunctions.net/controller-service/controller",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ event: "delete", fileName: vidName }),
        }
      )
        .then((response) => {
          if (response.ok) {
            console.log(`Video successfully deleted from server: ${vidName}`);
          } else {
            console.error(
              "Failed to delete video from server:",
              response.statusText
            );
          }
        })
        .catch((error) => {
          console.error("Error deleting video from server:", error);
        });
    });
  };

  const [error, setError] = useState(null);
    
  const playVideo = async (videoName, generation) => {
    try {
        // Define the streaming endpoint with the generation parameter
        const streamEndpoint = `http://localhost:8080/stream-video/${videoName}?generation=${generation}`;
        console.log('Attempting to play video:', videoName, 'with generation:', generation);

        // Open a new window for the video player
        const videoWindow = window.open('', '_blank');
        if (!videoWindow) {
            throw new Error("Failed to open new window. Please allow popups.");
        }

        // Write the HTML content for the new window
        videoWindow.document.write(`
           <!DOCTYPE html>
<html>
<head>
    <title>Shaka Player Video Streaming</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.3.6/controls.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.3.6/shaka-player.min.js"></script>
    <style>
        body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #000;
        }
        #video {
            width: 80%;
            height: auto;
        }
    </style>
</head>
<body>
    <video id="video" controls autoplay></video>

    <script>
        document.addEventListener('DOMContentLoaded', async () => {
            const video = document.getElementById('video');
            const streamEndpoint = "${streamEndpoint}";
            const jwtToken = "${JWTStreamToken}";

            // Initialize Shaka Player
            const player = new shaka.Player(video);

            // Listen for Shaka Player errors
            player.addEventListener('error', (event) => {
                console.error('Shaka Player Error:', event.detail);
            });

            try {
                // Set up headers for the request
                const headers = new Headers();
                headers.append('Authorization', 'Bearer ' + jwtToken);

                // Fetch initial video URL or manifest
                const response = await fetch(streamEndpoint, { headers });
                if (!response.ok) {
                    throw new Error('Failed to fetch video stream: ' + response.statusText);
                }

                const manifestUrl = response.url; // If streamEndpoint provides a manifest
                console.log('Manifest URL:', manifestUrl);

                // Load the video manifest (e.g., DASH or HLS) into Shaka Player
                await player.load(manifestUrl);

                console.log('Shaka Player loaded video successfully.');
            } catch (error) {
                console.error('Error loading video with Shaka Player:', error);
                alert('Failed to load video. Please try again.');
            }
        });
    </script>
</body>
</html>

        `);
    } catch (error) {
        console.error("Error playing video:", error);
    }
};

  useEffect(() => {
    const fetchData = async () => {
      console.log("Fetching JWT token and videos on mount...");
      const sessionToken = await fetchToken();

      const response = await fetch(
        "https://us-central1-controller-445319.cloudfunctions.net/controller-service/controller",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ event: "stream" }),
        }
      );

      const data = await response.json();
      console.log("JWT Stream Token:", data.token);
      setJWTStreamToken(data.token);

      fetchVideos();
    };

    fetchData();
  }, []);

  return (
    <div id="video-list-container" className="p-4 min-h-screen">
      {videoName.length === 0 ? ( // Check if the videoName array is empty
        <div className="text-center mt-8">
          <p className="text-gray-700 text-lg font-semibold">
            No Videos Uploaded Yet
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4 justify-center">
          {videoName.map((video) => (
            <div
              key={video.videoName}
              className="bg-gray-100 shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px] rounded-lg p-4 m-2 text-center w-full md:w-1/4 hover:bg-gray-200 transition-transform transform hover:scale-105 relative"
            >
              <p className="font-semibold text-md text-gray-900 mb-2 truncate">
                {video.videoName}
              </p>
              <button
                onClick={() =>
                  playVideo(video.videoName,video.generation)
                }
                className="bg-gray-800 text-white px-3 py-1 rounded-full hover:bg-gray-700 transition duration-300 m-1"
              >
                Play
              </button>
              <button
                onClick={() => deleteVideoHandler(video.videoName)}
                className="bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-400 transition duration-300 m-1"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
