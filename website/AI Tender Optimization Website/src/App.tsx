import { useState } from "react";
import { AuthPageNeo } from "./components/auth-page-neo";
import { DashboardPageFinal } from "./components/dashboard-page-final";
import { UploadPageFinal } from "./components/upload-page-final";
import { ResultsPage } from "./components/results-page";

type Page = "auth" | "dashboard" | "upload" | "results";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("auth");
  const [userEmail, setUserEmail] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

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

  const handleNavigateToResults = (jobId: string) => {
    setSelectedJobId(jobId);
    setCurrentPage("results");
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
          onNavigateToResults={handleNavigateToResults}
          onLogout={handleLogout}
        />
      )}
      {currentPage === "results" && selectedJobId && (
        <ResultsPage
          userEmail={userEmail}
          jobId={selectedJobId}
          onBack={handleNavigateToDashboard}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}
