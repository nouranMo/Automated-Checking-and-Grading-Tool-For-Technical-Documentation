import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import LandingPage from "./components/LandingPage";
import Homepage from "./components/Homepage";
import Report from "./components/Report";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import Signup from "./components/Signup";
import UMLparsing from "./components/UMLparsing";
import SectionExtraction from "./components/sectionExtraction";
import ParsingResultPage from "./components/ParsingResultPage";
import UMLReport from "./components/UMLReport";
import { GoogleOAuthProvider } from "@react-oauth/google";

function App() {
  console.log("Client ID:", process.env.REACT_APP_GOOGLE_CLIENT_ID);
  return (
    <GoogleOAuthProvider clientId="296280424100-h6ufvnc9fqg0rco9rfql3o4ppt5tlpic.apps.googleusercontent.com">
      <Router>
        {/* <Navbar /> */}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/homepage" element={<Homepage />} />
          <Route path="/report" element={<Report />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/umlparsing" element={<UMLparsing />} />
          <Route path="/sectionextraction" element={<SectionExtraction />} />
          <Route path="/umlreport" element={<UMLReport />} />
          <Route path="/parsing-result" element={<ParsingResultPage />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
