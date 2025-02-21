import PageBody from "@/components/ui/PageBody";
import Sidebar from "@/components/ui/Sidebar";
import { Link } from "react-router";

export default function Dashboard() {
  return (
    <div className="flex">
      <Sidebar />

      <PageBody padding="sm">
        <PageBody.Breadcrumb>
          <PageBody.Breadcrumb.Item>
            <Link to="/dashboard">Dashboard</Link>
          </PageBody.Breadcrumb.Item>
        </PageBody.Breadcrumb>
      </PageBody>
    </div>
  );
}
