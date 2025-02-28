import Sidebar from "@/components/ui/Sidebar";
import useToggleSidebar from "@/hooks/use-toggle-sidebar";
import { Outlet } from "react-router";
import { useSelector } from "react-redux";
import { RootState } from "@/states/store";
import { ROUTES } from "@/constants/routes";

export default function Dashboard() {
  const { isOpen, toggle } = useToggleSidebar(true);

  return (
    <div className="flex h-screen overflow-y-auto">
      <Sidebar
        isOpen={isOpen}
        toggle={toggle}
        mainHeader={<MainHeader isOpen={isOpen} />}
      >
        {[
          ROUTES.PROFILE,
          ROUTES.STAFF,
          ROUTES.TENANTS,
          ROUTES.ACCOUNTS,
          ROUTES.GUEST_ROLES,
          ROUTES.ERROR_CODES,
          ROUTES.WEBHOOKS,
        ].map(route => (
          <Sidebar.Item
            key={route.path}
            icon={route.icon}
            href={route.path}
            text={route.name}
            isOpen={isOpen}
          />
        ))}
      </Sidebar>

      <div className="flex-1 overflow-y-auto">
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
