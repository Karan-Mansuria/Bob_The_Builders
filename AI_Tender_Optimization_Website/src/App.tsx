import { useState } from "react";
import { AuthPageNeo } from "./components/auth-page-neo";
import { DashboardPageFinal } from "./components/dashboard-page-final";
import { UploadPageFinal } from "./components/upload-page-final";

type Page = "auth" | "dashboard" | "upload";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("auth");
  const [userEmail, setUserEmail] = useState("");

  const handleLogin = (email: string) => {
    setUserEmail(email);
    setCurrentPage("dashboard");
  };

  const handleNavigateToUpload = () => {
    setCurrentPage("upload");
  };

  const handleNavigateToDashboard = () => {
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    setUserEmail("");
    setCurrentPage("auth");
  };

  return (
    <>
      {currentPage === "auth" && <AuthPageNeo onLogin={handleLogin} />}
      {currentPage === "dashboard" && (
        <DashboardPageFinal
          userEmail={userEmail}
          onNavigateToUpload={handleNavigateToUpload}
          onLogout={handleLogout}
        />
      )}
      {currentPage === "upload" && (
        <UploadPageFinal
          userEmail={userEmail}
          onNavigateToDashboard={handleNavigateToDashboard}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}
