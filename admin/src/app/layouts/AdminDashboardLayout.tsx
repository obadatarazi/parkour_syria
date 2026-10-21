import { DashboardLayout } from "@/app/layouts/DashboardLayout";
import { UserMenu } from "@/features/auth";

export function AdminDashboardLayout() {
  return <DashboardLayout userMenu={<UserMenu />} />;
}
