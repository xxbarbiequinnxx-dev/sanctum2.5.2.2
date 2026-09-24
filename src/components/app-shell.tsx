import { Link, useRouterState } from "@tanstack/react-router";
import { Mail, Menu, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { CompanionPanel } from "@/components/companion-panel";
import { AppOpenBeacon } from "@/components/app-open-beacon";
import { LocationBeacon } from "@/components/location-beacon";
import { MessagesPanel } from "@/components/messages-panel";
import { Onboarding } from "@/components/onboarding";
import { VacationBanner, VacationToggle } from "@/components/vacation-control";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { AccountMenu } from "@/components/account-menu";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getMe } from "@/lib/api";
import { EMPTY_ME, parseHouseTab } from "@/lib/house";
import { subscribeMe } from "@/lib/me-sync";
import { startLiveSync } from "@/lib/live-sync";
import { startCompanionLive } from "@/lib/companion-live";
import { HOUSE_NAV, NAV, navFor } from "@/lib/nav";
import type { Me } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  const location = useRouterState({ select: (s) => s.location });
  const pathname = location.pathname;
  const hash = location.hash;
  const [me, setMe] = useState<Me | null>(null);
  const [ready, setReady] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [privateOpen, setPrivateOpen] = useState(false);
  const [privateTab, setPrivateTab] = useState<"messages" | "photos">("messages");
  const [companionOpen, setCompanionOpen] = useState(false);
  const companionOpenRef = useRef(false);
  companionOpenRef.current = companionOpen;
  const [companionPing, setCompanionPing] = useState(false);
  const [sessionTimedOut, setSessionTimedOut] = useState(false);

  useEffect(() => {
    if (!isPending) {
      setSessionTimedOut(false);
      return;
    }
    const timer = window.setTimeout(() => setSessionTimedOut(true), 2500);
    return () => window.clearTimeout(timer);
  }, [isPending]);

  useEffect(() => {
    if (user) return;
    setMe(null);
    setReady(!isPending || sessionTimedOut);
  }, [user, isPending, sessionTimedOut]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setReady(false);
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      setMe((current) => current ?? EMPTY_ME);
      setReady(true);
    }, 8000);
    getMe()
      .then((data) => {
        if (!cancelled) setMe(data);
      })
      .catch(() => {
        if (!cancelled) setMe(EMPTY_ME);
      })
      .finally(() => {
        window.clearTimeout(timer);
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [user?.id]);

  useEffect(() => subscribeMe(setMe), []);

  useEffect(() => {
    if (!me?.profile) return;
    const stopLive = startLiveSync();
    const stopCompanion = startCompanionLive({ panelOpen: () => companionOpenRef.current });
    return () => {
      stopLive();
      stopCompanion();
    };
  }, [me?.profile?.userId, me?.profile?.bondId]);

  if ((isPending && !sessionTimedOut) || (Boolean(user) && !ready)) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background vignette px-6">
        <div className="text-center">
          <p className="font-display text-4xl tracking-tight">Sanctum</p>
          <p className="mt-2 text-sm text-muted-foreground">Opening Sanctum</p>
        </div>
      </div>
    );
  }

  if (!user) return <RedirectToSignIn />;

  if (!me?.profile) {
    return (
      <div className="min-h-dvh bg-background vignette px-5 py-12">
        <Onboarding userName={user.displayName} me={me} onDone={setMe} />
      </div>
    );
  }

  const quick = navFor(me.options.quickNav);
  const morePages = NAV.filter((item) => !quick.some((q) => q.to === item.to));

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
          <Link to="/" className="font-display text-xl tracking-tight">
            Sanctum
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
