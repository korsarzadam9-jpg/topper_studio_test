import { useEffect, useState } from "react";

export type Route = "studio" | "print" | "order" | "pricing" | "account";

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#/, "").replace(/^\//, "").split("?")[0].split("/")[0];
  if (path === "print") return "print";
  if (path === "order") return "order";
  if (path === "pricing") return "pricing";
  if (path === "account") return "account";
  return "studio";
}

export function hrefFor(route: Route) {
  return route === "studio" ? "#/" : `#/${route}`;
}

export function useRoute(): [Route, (route: Route) => void] {
  const [route, setRoute] = useState<Route>(() =>
    typeof window === "undefined" ? "studio" : parseHash(window.location.hash),
  );

  useEffect(() => {
    const onHash = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const go = (next: Route) => {
    window.location.hash = hrefFor(next);
  };

  return [route, go];
}
