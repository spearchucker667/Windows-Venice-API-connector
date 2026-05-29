import React from 'react';

export function StatusBlock({ error, success }: { error?: string; success?: string }) {
  return (
    <>
      {error && (
        <div className="rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger shadow-sm animate-[fadeIn_0.3s_ease]" role="alert" aria-live="assertive">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success shadow-sm animate-[fadeIn_0.3s_ease]" role="status" aria-live="polite">
          {success}
        </div>
      )}
    </>
  );
}
