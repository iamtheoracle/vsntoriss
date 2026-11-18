export function Mark({ className = "size-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <rect x="0.5" y="0.5" width="31" height="31" stroke="currentColor" />
      <path
        d="M16 6.5 8 24.5h3.1l1.55-3.7h6.7l1.55 3.7H24L16 6.5Zm0 5.2 2.15 5.1h-4.3L16 11.7Z"
        fill="currentColor"
      />
    </svg>
  );
}
