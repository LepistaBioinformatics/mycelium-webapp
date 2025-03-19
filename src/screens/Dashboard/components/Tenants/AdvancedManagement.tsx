import { useEffect } from "react";
import { useParams } from "react-router";

export default function AdvancedManagement() {
  const params = useParams();

  useEffect(() => {
    if (!params.tenantId) return;

    console.log(params.tenantId);
  }, [params.tenantId]);

  return (
    <div>
      <h1>Advanced Management</h1>
    </div>
  )
}
