import { BdaSectionNav } from "@/components/bda-section-nav";
import BdaHomePage from "./bda/page";

export default function HomePage() {
  return (
    <>
      <BdaSectionNav homeHref="/" />
      <BdaHomePage />
    </>
  );
}
