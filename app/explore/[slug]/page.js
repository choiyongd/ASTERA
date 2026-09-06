import { notFound } from "next/navigation";
import NavBar from "../../nav-bar";
import ExploreClient from "./explore-client";
import { getExploreItem, EXPLORE_ITEMS } from "@/lib/content";

export function generateStaticParams() {
  return EXPLORE_ITEMS.map((item) => ({ slug: item.slug }));
}

export default async function ExplorePage({ params }) {
  const { slug } = await params;
  const item = getExploreItem(slug);
  if (!item) notFound();

  return (
    <>
      <NavBar />
      <ExploreClient item={item} />
    </>
  );
}
