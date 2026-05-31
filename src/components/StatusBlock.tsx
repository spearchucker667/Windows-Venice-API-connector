import React from 'react';

export function StatusBlock({ error, success }: { error?: string; success?: string }) {
  return (
    <>
      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        {error || ""}
      </div>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {success || ""}
      </div>
      {error && (
        <div className="rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger shadow-sm animate-[fadeIn_0.3s_ease]" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success shadow-sm animate-[fadeIn_0.3s_ease]" role="status">
          {success}
        </div>
      )}
    </>
  );
}
