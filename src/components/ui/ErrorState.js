// Hallmark · component: ErrorState · genre: authenticated utility · theme: Calm Ledger · states: error with optional recovery action · contrast: text plus icon and tone
import { CircleAlert } from "lucide-react";

export default function ErrorState({
  action,
  announce = true,
  className = "",
  description,
  headingAs: Heading = "h2",
  icon: Icon = CircleAlert,
  title,
  "aria-label": ariaLabel,
  ...props
}) {
  const classes = ["ui-state", className].filter(Boolean).join(" ");

  return (
    <section
      {...props}
      className={classes}
      data-tone="error"
      role={announce ? "alert" : undefined}
      aria-label={ariaLabel || title}
    >
      {Icon ? (
        <span className="ui-state__icon" aria-hidden="true">
          <Icon />
        </span>
      ) : null}
      <Heading className="ui-state__title">{title}</Heading>
      {description ? (
        <p className="ui-state__description">{description}</p>
      ) : null}
      {action ? <div className="ui-state__action">{action}</div> : null}
    </section>
  );
}
