import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import { TourProvider } from "../context/TourContext";
import WelcomeTourModal from "../components/WelcomeTourModal";
import Footer from "../components/Footer";
import ErrorBoundary from "../components/common/ErrorBoundary";
import { useSessionTimeout } from "../hooks/useSessionTimeout";
import SessionTimeoutModal from "../components/ui/SessionTimeoutModal";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { showWarning, extendSession, logout } = useSessionTimeout();

  return (
    <div className="min-h-screen xl:flex bg-gray-50 dark:bg-[#0c0e17] text-gray-900 dark:text-gray-100 overflow-x-hidden">
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[250px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <ErrorBoundary><Outlet /></ErrorBoundary>
          <Footer />
        </div>
      </div>
      <WelcomeTourModal />
      <SessionTimeoutModal show={showWarning} onExtend={extendSession} onLogout={logout} />
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <TourProvider>
        <LayoutContent />
      </TourProvider>
    </SidebarProvider>
  );
};

export default AppLayout;

