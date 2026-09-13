import React, { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { slugify } from "./lib/slugify";
import { Navbar } from "./components/layout/Navbar";
import { Sidebar, ActiveTab } from "./components/layout/Sidebar";
import { DashboardView } from "./components/dashboard/DashboardView";
import { CalendarView } from "./components/calendar/CalendarView";
import { CourtManagement } from "./components/courts/CourtManagement";
import { CustomerManagement } from "./components/customers/CustomerManagement";
import { WaitlistManagement } from "./components/waitlist/WaitlistManagement";
import { PaymentManagement } from "./components/payments/PaymentManagement";
import { ReportsView } from "./components/reports/ReportsView";
import { SettingsView } from "./components/settings/SettingsView";
import { AuditLogsView } from "./components/audit/AuditLogsView";
import { PublicPortalView } from "./components/public/PublicPortalView";
import { SuperAdminPanel } from "./components/superadmin/SuperAdminPanel";
import { SuperAdminStandaloneView } from "./components/superadmin/SuperAdminStandaloneView";
import { SuperAdminStandaloneLoginPage } from "./components/superadmin/SuperAdminStandaloneLoginPage";
import { LicenseLockScreen } from "./components/superadmin/LicenseLockScreen";
import { SuperAdminLoginModal } from "./components/superadmin/SuperAdminLoginModal";
import { BookingModal } from "./components/calendar/BookingModal";
import { CancelBookingModal } from "./components/calendar/CancelBookingModal";
import { GlobalSearchModal } from "./components/common/GlobalSearchModal";
import { Booking } from "./types";
import { ShieldCheck, Zap, ArrowRight } from "lucide-react";

const MainLayout: React.FC = () => {
  const {
    bookings,
    isLicenseActive,
    remainingLicenseDays,
    isSuperAdmin,
    settings,
    complexes,
    activeComplexId,
    switchComplex,
    activateLicense30Days,
  } = useApp();

  // Sidebar Mobile Toggle State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Active Tab State
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");

  // Super Admin Login Modal trigger
  const [isSuperAdminLoginOpen, setIsSuperAdminLoginOpen] = useState(false);

  // Search Modal State
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Booking Modal State (Create / Edit)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [initialCourtId, setInitialCourtId] = useState<string | undefined>(
    undefined,
  );
  const [initialDate, setInitialDate] = useState<string | undefined>(undefined);
  const [initialStartTime, setInitialStartTime] = useState<string | undefined>(
    undefined,
  );

  // Cancellation Modal State
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(
    null,
  );

  const handleOpenNewBooking = (
    courtId?: string,
    date?: string,
    startTime?: string,
  ) => {
    setEditingBooking(null);
    setInitialCourtId(courtId);
    setInitialDate(date);
    setInitialStartTime(startTime);
    setIsBookingModalOpen(true);
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setIsBookingModalOpen(true);
  };

  const handleSelectBookingToCancel = (bookingId: string) => {
    setCancellingBookingId(bookingId);
  };

  // Helper to check if current URL points to client standalone portal
  const checkIsPortalUrl = () => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    const path = window.location.pathname.toLowerCase();

    return (
      params.get("view") === "portal" ||
      params.get("portal") === "true" ||
      params.get("portal") === "1" ||
      params.get("mode") === "portal" ||
      params.get("public") === "1" ||
      params.get("public") === "true" ||
      hash === "#portal" ||
      hash === "#public" ||
      path.includes("/portal")
    );
  };

  // Helper to check if current URL points to standalone SuperAdmin page (/superadmin or ?view=superadmin)
  const checkIsSuperAdminUrl = () => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash.toLowerCase();
    const path = window.location.pathname.toLowerCase();

    return (
      params.get("view") === "superadmin" ||
      params.get("page") === "superadmin" ||
      params.get("mode") === "superadmin" ||
      params.get("tab") === "superadmin" ||
      params.get("admin") === "super" ||
      hash === "#superadmin" ||
      hash === "#/superadmin" ||
      path === "/superadmin" ||
      path === "/superadmin/" ||
      path.endsWith("/superadmin") ||
      path.endsWith("/superadmin/") ||
      path.includes("/superadmin")
    );
  };

  const [isStandalonePortal, setIsStandalonePortal] =
    useState<boolean>(checkIsPortalUrl);
  const [isStandaloneSuperAdmin, setIsStandaloneSuperAdmin] =
    useState<boolean>(checkIsSuperAdminUrl);

  // Listen to popstate, hash changes and complex parameter in URL
  React.useEffect(() => {
    const handleLocationChange = () => {
      setIsStandalonePortal(checkIsPortalUrl());
      setIsStandaloneSuperAdmin(checkIsSuperAdminUrl());
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const requestedSlug =
          params.get("c") || params.get("complex") || params.get("slug");
        if (requestedSlug && complexes && complexes.length > 0) {
          const cleanParam = decodeURIComponent(requestedSlug).trim().toLowerCase();
          const paramSlug = slugify(cleanParam);
          const match = complexes.find((c) => {
            const cId = (c.id || "").toLowerCase();
            const cSlug = (c.slug || "").toLowerCase();
            const cNameSlug = slugify(c.name || "");
            const cSettingsNameSlug = slugify(c.settings?.complexName || "");
            const cCustom = (c.settings?.customPortalUrl || "").toLowerCase().trim();
            const cCustomSlug = slugify(cCustom);

            return (
              cId === cleanParam ||
              cSlug === cleanParam ||
              cSlug === paramSlug ||
              cNameSlug === cleanParam ||
              cNameSlug === paramSlug ||
              cSettingsNameSlug === cleanParam ||
              cSettingsNameSlug === paramSlug ||
              cCustom === cleanParam ||
              cCustomSlug === paramSlug
            );
          });
          if (match && match.id !== activeComplexId) {
            switchComplex(match.id);
          }
        }
      }
    };

    handleLocationChange();
    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("hashchange", handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("hashchange", handleLocationChange);
    };
  }, [complexes, activeComplexId, switchComplex]);

  // Navigate to independent SuperAdmin standalone page (/superadmin)
  const handleOpenSuperAdminPage = () => {
    setIsStandaloneSuperAdmin(true);
    if (window.history.pushState) {
      const rootPath =
        window.location.pathname
          .replace(/\/superadmin\/?$/i, "")
          .replace(/\/portal\/?$/i, "") || "";
      const cleanRoot = rootPath.replace(/\/+$/, "");
      const newUrl = `${window.location.origin}${cleanRoot}/superadmin`;
      window.history.pushState({ path: newUrl }, "", newUrl);
    }
  };

  // Exit standalone SuperAdmin back to active complex admin dashboard
  const handleExitSuperAdmin = () => {
    setIsStandaloneSuperAdmin(false);
    setActiveTab("dashboard");
    if (window.history.pushState) {
      const rootPath =
        window.location.pathname
          .replace(/\/superadmin\/?$/i, "")
          .replace(/\/portal\/?$/i, "") || "/";
      const newUrl = `${window.location.origin}${rootPath.endsWith("/") ? rootPath : rootPath + "/"}`;
      window.history.pushState({ path: newUrl }, "", newUrl);
    }
  };

  // Exit standalone portal back to admin dashboard
  const handleExitStandalonePortal = () => {
    setIsStandalonePortal(false);
    setActiveTab("dashboard");
    if (window.history.pushState) {
      const rootPath =
        window.location.pathname
          .replace(/\/superadmin\/?$/i, "")
          .replace(/\/portal\/?$/i, "") || "/";
      const newUrl = `${window.location.origin}${rootPath.endsWith("/") ? rootPath : rootPath + "/"}`;
      window.history.pushState({ path: newUrl }, "", newUrl);
    }
  };

  const cancellingBooking =
    bookings.find((b) => b.id === cancellingBookingId) || null;

  // Independent Standalone SuperAdmin Page (?view=superadmin)
  if (isStandaloneSuperAdmin) {
    if (!isSuperAdmin) {
      return (
        <SuperAdminStandaloneLoginPage
          onExit={handleExitSuperAdmin}
          onSuccess={() => {}}
        />
      );
    }
    return <SuperAdminStandaloneView onExit={handleExitSuperAdmin} />;
  }

  // Standalone Client View (Opened directly via client link ?view=portal or #portal)
  if (isStandalonePortal) {
    return (
      <PublicPortalView
        isStandalone={true}
        onReturnToAdmin={handleExitStandalonePortal}
      />
    );
  }

  // License Guard: If license is expired/blocked and user is not SuperAdmin, show lock screen
  if (!isLicenseActive && !isSuperAdmin) {
    return (
      <LicenseLockScreen
        onOpenPortal={() => setIsStandalonePortal(true)}
      />
    );
  }

  // Admin Internal Preview View
  if (activeTab === "public_portal") {
    return (
      <PublicPortalView
        isStandalone={false}
        onReturnToAdmin={() => setActiveTab("dashboard")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Fixed Navbar */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenPublicPortal={() => setActiveTab("public_portal")}
        onOpenSuperAdminLogin={() => setIsSuperAdminLoginOpen(true)}
        onNavigate={(tab) => {
          if (tab === "superadmin") {
            if (isSuperAdmin) {
              handleOpenSuperAdminPage();
            }
          } else {
            setActiveTab(tab);
          }
        }}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab === "superadmin") {
              if (isSuperAdmin) {
                handleOpenSuperAdminPage();
              }
            } else {
              setActiveTab(tab);
            }
          }}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onOpenNewBookingModal={() => handleOpenNewBooking()}
          onOpenSuperAdminLogin={() => setIsSuperAdminLoginOpen(true)}
        />

        {/* Main Content Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === "dashboard" && (
              <DashboardView
                onNavigate={setActiveTab}
                onOpenNewBookingModal={() => handleOpenNewBooking()}
                onSelectBookingToEdit={handleEditBooking}
                onSelectBookingToCancel={handleSelectBookingToCancel}
              />
            )}

            {activeTab === "calendar" && (
              <CalendarView
                onOpenNewBookingModal={handleOpenNewBooking}
                onSelectBookingToEdit={handleEditBooking}
                onSelectBookingToCancel={handleSelectBookingToCancel}
              />
            )}

            {activeTab === "courts" && <CourtManagement />}

            {activeTab === "customers" && <CustomerManagement />}

            {activeTab === "waitlist" && <WaitlistManagement />}

            {activeTab === "payments" && <PaymentManagement />}

            {activeTab === "reports" && <ReportsView />}

            {activeTab === "settings" && (
              <SettingsView
                onOpenPublicPortal={() => setActiveTab("public_portal")}
              />
            )}

            {activeTab === "audit" && <AuditLogsView />}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <SuperAdminLoginModal
        isOpen={isSuperAdminLoginOpen}
        onClose={() => setIsSuperAdminLoginOpen(false)}
        onSuccess={() => {
          handleOpenSuperAdminPage();
        }}
      />
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        initialCourtId={initialCourtId}
        initialDate={initialDate}
        initialStartTime={initialStartTime}
        editingBooking={editingBooking}
      />

      <CancelBookingModal
        isOpen={!!cancellingBookingId}
        onClose={() => setCancellingBookingId(null)}
        booking={cancellingBooking}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectBooking={(b) => {
          handleEditBooking(b);
          setActiveTab("calendar");
        }}
        onSelectCustomer={() => {
          setActiveTab("customers");
        }}
      />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;
