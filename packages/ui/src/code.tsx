export function Code({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <code className={className}>{children}</code>;
}
