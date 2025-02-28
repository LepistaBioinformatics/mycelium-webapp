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
        mainHeader={<MainHeader isOpen={isOpen} />}
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
function MainHeader({ isOpen }: { isOpen: boolean }) {
  const { tenantInfo } = useSelector((state: RootState) => state.tenant);

  if (!tenantInfo) {
    return null;
  }

  const tenantShortName = () => {
    const splitted = tenantInfo.name.split(" ");

    if (splitted.length === 1) {
      return splitted[0]?.slice(0, 2).toUpperCase();
    }

    return splitted.slice(0, 2).map(name => name[0]?.toUpperCase()).join("");
  };

  return (
    <div className="flex justify-center items-center gap-2 bg-slate-100 dark:bg-slate-900 bg-opacity-50 dark:bg-opacity-50 backdrop-blur-sm border border-blue-500 dark:border-lime-500 rounded-full p-2">
      {isOpen ? tenantInfo.name : tenantShortName()}
    </div>
  )
}
