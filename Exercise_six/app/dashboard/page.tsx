import { getUserInfo } from "@/server/user";
import { redirect } from "next/navigation";
// export const dynamic = "force-dynamic";
const dashboard = async () => {
  const session = await getUserInfo();
  if (!session) {
    redirect("/login");
  }
   return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {session.user.name}</p>
    </div>
  );
};

export default dashboard;
