import { SlOrganization } from "react-icons/sl";
import { GiWizardStaff } from "react-icons/gi";
import Sidebar from "@/components/ui/Sidebar";
import { RiDashboardFill } from "react-icons/ri";
import useToggleSidebar from "@/hooks/use-toggle-sidebar";
import { Outlet } from "react-router";
import { useSelector } from "react-redux";
import { RootState } from "@/states/store";

export default function Dashboard() {
  const { isOpen, toggle } = useToggleSidebar(true);

  return (
    <div className="flex max-h-screen">
      <Sidebar
        isOpen={isOpen}
        toggle={toggle}
        mainHeader={<MainHeader />}
      >
        <Sidebar.Item
          icon={<RiDashboardFill />}
          href="/dashboard/profile"
          text="Profile"
          isOpen={isOpen}
        />

        <Sidebar.Item
          icon={<GiWizardStaff />}
          href="/dashboard/staff"
          text="Staff"
          isOpen={isOpen}
        />

        <Sidebar.Item
          icon={<SlOrganization />}
          href="/dashboard/tenants"
          text="Tenants"
          isOpen={isOpen}
        />
      </Sidebar>

      <div className="flex-1 max-h-screen overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}

/**
 * The tenant selector should exists in the main header.
 * 
 * @returns 
 */
function MainHeader() {
  const { profile } = useSelector((state: RootState) => state.profile);

  if (!profile) {
    return null;
  }

  return (
    <div>
      <pre>
        {JSON.stringify(profile, null, 2)}
      </pre>
    </div>
  )
}
