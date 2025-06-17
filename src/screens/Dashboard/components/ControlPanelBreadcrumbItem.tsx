import { IoHomeSharp } from "react-icons/io5";
import PageBody from "@/components/ui/PageBody";

export default function ControlPanelBreadcrumbItem() {
  return (
    <PageBody.Breadcrumb.Item href="/dashboard/profile" icon={IoHomeSharp}>
      Control panel
    </PageBody.Breadcrumb.Item>
  );
}
