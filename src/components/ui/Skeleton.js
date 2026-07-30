// Hallmark · component: Skeleton · genre: authenticated utility · theme: Calm Ledger · states: loading/reduced-motion · contrast: non-text surface signal
function toCssLength(value) {
  return typeof value === "number" ? `${value}px` : value;
}

export default function Skeleton({
  className = "",
  height = "1rem",
  label,
  radius,
  style,
  width = "100%",
  ...props
}) {
  const classes = ["ui-skeleton", className].filter(Boolean).join(" ");

  return (
    <span
      {...props}
      className={classes}
      style={{
        ...style,
        "--skeleton-height": toCssLength(height),
        "--skeleton-radius": radius ? toCssLength(radius) : undefined,
        "--skeleton-width": toCssLength(width),
      }}
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
