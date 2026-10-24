import NavBar from "../nav-bar";
import "../learn/learning.css";
export const dynamic = "force-dynamic";
export default function PagesLayout({ children }) {
  return (
    <>
      <NavBar />
      {children}
    </>
  );
}
