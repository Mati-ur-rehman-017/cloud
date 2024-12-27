// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Login from "./Login";
// import Admin from "./Admin";
// import User from "./User";
// import Home from "./Home";
// import Error from "./Error";
// import ProtectedRoute from "./ProtectRoute";
// import NotAuthorized from "./NotAuthorized";
// import Loading from "./components/Loading";
// import Stats from "./components/Stats";

// import { useAuth, useUser } from "@clerk/clerk-react";
// import Navbar from "./components/Navbar";

// function App() {
//   const { user, isLoaded } = useUser();
//   if (!isLoaded) {
//     return <Loading />;
//   }

//   return (
//     <>
//       <Navbar />
//       {/* <Login />  */}
//       <Routes>
//         <Route path="/not-authorized" element={<NotAuthorized />} />
//         <Route path="/user" element={<User />} />
//         <Route path="/" element={<Home />} />
//         <Route path="/error" element={<Error />} />
//         <Route path="/stats" element={<Stats />} />
//         {/* //nested */}
//         <Route path="/teams"></Route>
//         <Route
//           path="/admin"
//           element={
//             <ProtectedRoute requiredRole="admin" redirectTo="/not-authorized">
//               <Admin />
//             </ProtectedRoute>
//           }
//         />
//       </Routes>
//     </>
//   );
// }

// export default App;

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect } from "react";
import Login from "./Login";
import Admin from "./Admin";
import User from "./User";
import Home from "./Home";
import Error from "./Error";
import ProtectedRoute from "./ProtectRoute";
import NotAuthorized from "./NotAuthorized";
import Loading from "./components/Loading";
import Stats from "./components/Stats";

import { useAuth, useUser } from "@clerk/clerk-react";
import Navbar from "./components/Navbar";

function App() {
  const { user, isLoaded, isSignedIn } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Redirect to '/user' after login only if the user is at '/'
    if (isSignedIn && location.pathname === "/") {
      navigate("/user");
    }
  }, [isSignedIn, location.pathname, navigate]);

  if (!isLoaded) {
    return <Loading />;
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/not-authorized" element={<NotAuthorized />} />
        <Route path="/user" element={<User />} />
        <Route path="/" element={<Home />} />
        <Route path="/error" element={<Error />} />
        <Route path="/stats" element={<Stats />} />
        {/* Nested */}
        <Route path="/teams"></Route>
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin" redirectTo="/not-authorized">
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
