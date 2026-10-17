import { LandingPage } from "@/components/LandingPage";
import { getPublishedBootcamps } from "@/lib/bootcamps";

// Refreshed on every admin change (revalidatePath), and at least once a minute.
export const revalidate = 60;

export default async function Home() {
  const bootcamps = await getPublishedBootcamps().catch(() => []);
  return <LandingPage bootcamps={bootcamps} />;
}
