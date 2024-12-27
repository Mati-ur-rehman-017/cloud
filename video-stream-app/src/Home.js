import { SignInButton, SignUpButton } from "@clerk/clerk-react";
import backgroundImage from "./leave8.jpg"; // Import the image

export default function Home() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen text-white bg-cover bg-center"
      style={{
        backgroundImage: `url(${backgroundImage})`, // Use the imported image
      }}
    >
      <div className="text-center bg-white bg-opacity-25 backdrop-blur-md p-8 rounded-lg shadow-lg">
        {/* Title */}
        <h1 className="text-5xl font-bold mb-6 text-red-600">
          Welcome to Stream Time
        </h1>
        <p className="text-lg text-black mb-10">
          Upload, manage, and stream your videos seamlessly with our secure and
          fast platform.
        </p>

        {/* Sign In and Sign Up Buttons */}
        <div className="flex space-x-4">
          <SignInButton>
            <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton>
            <button className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
              Sign Up
            </button>
          </SignUpButton>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-sm text-gray-900">
        <p>
          &copy; {new Date().getFullYear()} Stream Time. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
