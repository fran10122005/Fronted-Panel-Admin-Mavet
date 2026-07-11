import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import { TourProvider } from "../context/TourContext";
import WelcomeTourModal from "../components/WelcomeTourModal";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

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
          <Outlet />
        </div>
      </div>
      <WelcomeTourModal />
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

