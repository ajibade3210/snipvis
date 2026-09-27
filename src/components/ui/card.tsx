export function Card({
  className = "",
  ...p
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}
      {...p}
    />
  );
}
export function CardContent({
  className = "",
  ...p
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-6 pt-0 ${className}`} {...p} />;
}
