import AdminWorkspace from "@/components/admin-workspace";
import { currentSession } from "@/lib/session";
import { hasAdminAccess, isConfiguredAdmin, localAdminSetupState } from "@/lib/admin-security";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await currentSession();
  const user = session?.user;
  const [localSetup, emailAllowed] = await Promise.all([localAdminSetupState(), isConfiguredAdmin(user)]);
  const unlocked = Boolean(user && emailAllowed && await hasAdminAccess(user.id));
  return <AdminWorkspace
    key={`${Boolean(user)}-${emailAllowed}-${unlocked}`}
    name={user?.name ?? ""}
    email={user?.email ?? ""}
    authenticated={Boolean(user)}
    emailAllowed={emailAllowed}
    adminEmailConfigured={Boolean(process.env.ADMIN_EMAIL?.trim())}
    localOwnerSetupAllowed={localSetup.available}
    localOwnerConfigured={localSetup.ownerConfigured}
    unlocked={unlocked}
  />;
}
