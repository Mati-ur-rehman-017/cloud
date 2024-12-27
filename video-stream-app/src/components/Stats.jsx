import { useAuth } from "@clerk/clerk-react";
import { useState, useEffect } from "react";

export default function Stats() {
  const [storage, setStorage] = useState(0);
  const [bandwidth, setBandwidth] = useState(0);
  const { getToken } = useAuth();

  const fetchToken = async () => {
    try {
      const token = await getToken();
      console.log("Session Token:", token);
      return token;
    } catch (error) {
      console.error("Error fetching token:", error);
    }
  };

  const renderStats = async () => {
    try {
      const token = await fetchToken();
      const response = await fetch(
        "https://us-central1-controller-445319.cloudfunctions.net/controller-service/controller",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ event: "monitoring" }),
        }
      );
      if (response.ok) {
        const resultStats = await response.json();
        console.log("Result Stats API: ", resultStats);
        setStorage(resultStats.remainingStorage);
        setBandwidth(resultStats.remainingBandWidth);
      }
    } catch (e) {
      console.error("Stats API Error: ", e);
    }
  };

  useEffect(() => {
    renderStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Account Usage Stats
        </h1>
        <div className="space-y-4">
          {/* Storage Progress */}
          <div>
            <p className="text-gray-600 font-medium">Storage Usage</p>
            <div className="bg-gray-200 rounded-full h-4 w-full">
              <div
                className="bg-blue-500 h-4 rounded-full"
                style={{ width: `${(storage / 50) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {storage.toFixed(2)} MB used out of 50 MB
            </p>
          </div>

          <div>
            <p className="text-gray-600 font-medium">Bandwidth Usage</p>
            <div className="bg-gray-200 rounded-full h-4 w-full">
              <div
                className="bg-green-500 h-4 rounded-full"
                style={{ width: `${(bandwidth / 100) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {bandwidth.toFixed(2)} MB used out of 100 MB
            </p>
          </div>
        </div>
        <button
          onClick={renderStats}
          className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition duration-300"
        >
          Refresh Stats
        </button>
      </div>
    </div>
  );
}
