export default function Teams() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-red-600">Not Authorized</h1>
        <p className="text-lg text-gray-300 mb-8">
          You do not have the necessary permissions to access this page.
        </p>
        <button
          onClick={() => window.history.back()}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
