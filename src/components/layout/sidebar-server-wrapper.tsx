import { Sidebar } from "./sidebar";
import { getUserRole } from "@/utils/rbac-server";

export async function SidebarServerWrapper() {
  const role = await getUserRole();
  return <Sidebar role={role} />;
}
