"use client";

import { Check, Copy } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Copy the email address without leaving the page.
 *
 * The card beside this is a `mailto:` link, which assumes the reader has a mail
 * client wired up. A recruiter on a work machine often does not — they want the
 * address in the clipboard to paste into whatever they actually use. This is
 * the one control on the page that genuinely needs the browser, which is why it
 * is the only client component outside `site-header.tsx`.
 *
 * The confirmation is announced, not just drawn: the icon swap is invisible to
 * a screen reader, so an `aria-live` region says it out loud. `role="status"`
 * is polite by default and will not interrupt.
 *
 * `navigator.clipboard` needs a secure context. It is there on the deployed
 * site and on localhost; if the write rejects, nothing is claimed — the label
 * stays "Copy" rather than reporting a success that did not happen.
 */
export function CopyEmail({
  email,
  className,
}: {
  email: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // The only effect here is the teardown: a pending reset must not fire after
  // unmount. Setting state from an effect is what React 19 rejects, and there
  // is none — `copied` is only ever set from the click handler.
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      return;
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }, [email]);

  return (
    <>
      <button
        type="button"
        onClick={copy}
        // Sits above the card's own overlay link, or the anchor would swallow
        // the click and open a mail client instead of copying.
        className={cn(
          "relative z-10 -mr-1 inline-flex size-8 shrink-0 items-center justify-center rounded-full",
          "text-muted-foreground transition-[color,background-color,transform] duration-200 ease-out",
          "hover:bg-muted/70 hover:text-primary active:scale-90",
          "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
          className,
        )}
      >
        {copied ? (
          <Check aria-hidden="true" className="size-4 text-success" />
        ) : (
          <Copy aria-hidden="true" className="size-4" />
        )}
        {/* The label changes with the state, so the button never announces
            "Copy" while showing a tick. */}
        <span className="sr-only">
          {copied ? "Email address copied" : "Copy email address"}
        </span>
      </button>

      <span role="status" className="sr-only">
        {copied ? "Email address copied to clipboard" : ""}
      </span>
    </>
  );
}
