import { useState } from "react";
import "./../index.css";
import { useAuth } from "@clerk/clerk-react";

export default function SearchFilter() {
  const { getToken } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [userResponse, setUserResponse] = useState(null); // State to capture the user's response

  const fetchToken = async () => {
    try {
      const token = await getToken(); // Call getToken() to get the session token
      console.log("Session Token:", token);
      return token;
    } catch (error) {
      console.error("Error fetching token:", error);
    }
  };

  const askUserAllDelete = (response) => {
    setShowModal(false); // Close the modal
    setUserResponse(response); // Capture the user's response
    console.log("User response:", response);
    if (response === "Confirm") {
      deleteAllHandler();
    }
  };

  const deleteAllHandler = async () => {
    console.log("Inside del Handler");
    try {
      const token = await fetchToken();
      const response = await fetch(
        "https://us-central1-controller-445319.cloudfunctions.net/controller-service/controller",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            // "Content-Type": "application/json",
          },
          body: JSON.stringify({ event: "delete-all" }),
        }
      );

      const resultDeleteAll = await response.json();
      console.log("Delete-all res: ", resultDeleteAll);
    } catch (e) {
      console.log("Error: ", e);
    }
  };
  return (
    <>
      {/* Delete All Button */}
      <button
        onClick={() => setShowModal(true)}
        className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
      >
        Delete All
      </button>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-bold text-gray-900">
              Are you sure you want to delete all items?
            </h2>
            <p className="text-gray-600 mt-2">
              This action cannot be undone. Please confirm your choice.
            </p>

            {/* Modal Actions */}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => askUserAllDelete("Cancel")}
                className="px-4 py-2 mr-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={() => askUserAllDelete("Confirm")}
                className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-600 transition duration-300"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
