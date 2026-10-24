import NavBar from "../nav-bar";
import "./learning.css";
export const dynamic = "force-dynamic";
export default function LearnLayout({ children }) {
  return (
    <>
      <NavBar />
      {children}
    </>
  );
}
