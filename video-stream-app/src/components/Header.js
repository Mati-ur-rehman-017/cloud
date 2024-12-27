import { useUser } from "@clerk/clerk-react";
import "./../index.css";

const Header = ({ activeTab, setActiveTab }) => {
  const { user } = useUser(); // Destructure the `user` object from `useUser`

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {user?.firstName || "Guest"}!
        </h1>
        <nav className="mt-4">
          <ul className="flex space-x-4">
            {["dashboard", "upload"].map((tab) => (
              <li key={tab}>
                <button
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === tab
                      ? "bg-gray-900 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
