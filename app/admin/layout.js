import NavBar from "../nav-bar";
import AdminNavigation from "./admin-navigation";
import "../learn/learning.css";
export const dynamic = "force-dynamic";
export default function AdminLayout({ children }) {
  return (
    <>
      <NavBar />
      <div className="wrap">
        <AdminNavigation />
      </div>
      {children}
    </>
  );
}
