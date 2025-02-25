import Sidebar from "@/components/ui/Sidebar";
import { RiDashboardFill } from "react-icons/ri";
import useToggleSidebar from "@/hooks/use-toggle-sidebar";
import { Outlet } from "react-router";

export default function Dashboard() {
  const { isOpen, toggle } = useToggleSidebar(true);

  return (
    <div className="flex">
      <Sidebar isOpen={isOpen} toggle={toggle}>
        <Sidebar.Item
          icon={<RiDashboardFill />}
          href="/dashboard/profile"
          text="Control panel"
          isOpen={isOpen}
        />
      </Sidebar>

      <div className="flex-1 p-4">
        <Outlet />
      </div>
    </div>
  );
}
