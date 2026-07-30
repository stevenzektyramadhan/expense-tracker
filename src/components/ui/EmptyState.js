// Hallmark · component: EmptyState · genre: authenticated utility · theme: Calm Ledger · states: empty with optional action · contrast: neutral semantic tokens
import { Inbox } from "lucide-react";

export default function EmptyState({
  action,
  className = "",
  description,
  headingAs: Heading = "h2",
  icon: Icon = Inbox,
  title,
  "aria-label": ariaLabel,
  ...props
}) {
  const classes = ["ui-state", className].filter(Boolean).join(" ");

  return (
    <section
      {...props}
      className={classes}
      data-tone="empty"
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
