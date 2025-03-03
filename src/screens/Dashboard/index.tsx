import Sidebar from "@/components/ui/Sidebar";
import useToggleSidebar from "@/hooks/use-toggle-sidebar";
import { Outlet } from "react-router";
import { useSelector } from "react-redux";
import { RootState } from "@/states/store";
import { ROUTES } from "@/constants/routes";
import { useAuth0 } from "@auth0/auth0-react";
import Typography from "@/components/ui/Typography";
import Button from "@/components/ui/Button";
import { useState } from "react";
import Modal from "@/components/ui/Modal";

export default function Dashboard() {
  const { isOpen, toggle } = useToggleSidebar(true);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const logout = () => {
    setShowLogoutModal(true);
  }

  return (
    <div className="flex h-screen overflow-y-auto">
      <Sidebar
        isOpen={isOpen}
        toggle={toggle}
        mainHeader={<MainHeader isOpen={isOpen} />}
        logout={logout}
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

      <LogoutModal show={showLogoutModal} setShow={setShowLogoutModal} />
    </div>
  );
}

function LogoutModal({
  show,
  setShow
}: {
  show: boolean,
  setShow: (show: boolean) => void
}) {
  const { logout: auth0Logout } = useAuth0();

  return (
    <Modal open={show}>
      <Modal.Header handleClose={() => setShow(false)}>
        <Typography as="h2">Logout</Typography>
      </Modal.Header>

      <Modal.Body>
        <div className="flex flex-col justify-center items-center gap-2 w-full">
          <div>
            <Typography center>
              Are you sure you want to logout?
            </Typography>
          </div>

          <div className="flex justify-end gap-2">
            <Button onClick={() => setShow(false)}>Cancel</Button>
            <Button intent="warning" onClick={auth0Logout}>Logout</Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  )
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
    <div className="flex justify-center items-center gap-2 text-slate-800 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 bg-opacity-50 dark:bg-opacity-50 backdrop-blur-sm border border-blue-500 dark:border-lime-500 rounded-full p-2">
      {isOpen ? tenantInfo.name : tenantShortName()}
    </div>
  )
}
