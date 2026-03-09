"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  initialSubscribed: boolean;
}

export function AlertToggle({ initialSubscribed }: Props) {
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/alerts/subscribe", {
        method: subscribed ? "DELETE" : "POST",
      });
      const data = await res.json();
      setSubscribed(data.subscribed);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={subscribed ? "outline" : "default"}
      onClick={toggle}
      disabled={loading}
    >
      {loading ? "..." : subscribed ? "Unsubscribe" : "Get Notified"}
    </Button>
  );
}
