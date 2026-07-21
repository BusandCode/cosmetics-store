"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

export default function LogoutButton({ action }: { action: () => Promise<void> }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="hover:underline">
        Log out
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed top-0 left-0 h-screen w-screen z-50 flex items-center justify-center bg-black/40 px-6"
            onClick={() => setOpen(false)}
          >
            <div
              className="bg-white border border-black w-full max-w-sm p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-sm font-medium mb-1">Log out?</p>
              <p className="text-sm text-neutral-500 mb-6">
                You'll need to log in again to access your account.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setOpen(false)}
                  className="text-xs uppercase tracking-wide border border-black px-4 py-2 hover:bg-neutral-100 transition-colors"
                >
                  Cancel
                </button>
                <form action={action}>
                  <button className="text-xs uppercase tracking-wide bg-black text-white px-4 py-2 hover:bg-neutral-800 transition-colors">
                    Log out
                  </button>
                </form>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}