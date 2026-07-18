// Hallmark · component: StatusBanner · genre: authenticated utility · theme: Calm Ledger · states: info/success/warning/error/offline/syncing · contrast: icon plus text and tone
import {
  CircleAlert,
  CircleCheck,
  Info,
  RefreshCw,
  TriangleAlert,
  WifiOff,
} from "lucide-react";

const toneIcons = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  error: CircleAlert,
  offline: WifiOff,
  syncing: RefreshCw,
};

export default function StatusBanner({
  action,
  children,
  className = "",
  icon,
  role,
  title,
  tone = "info",
  ...props
}) {
  const Icon = icon === undefined ? toneIcons[tone] : icon;
  const classes = ["ui-status-banner", className]
    .filter(Boolean)
    .join(" ");
  const resolvedRole = role || (tone === "error" ? "alert" : "status");

  return (
    <div
      {...props}
      className={classes}
      data-tone={tone}
      role={resolvedRole}
    >
      {Icon ? (
        <span className="ui-status-banner__icon" aria-hidden="true">
          <Icon />
        </span>
      ) : null}
      <div className="ui-status-banner__content">
        {title ? <p className="ui-status-banner__title">{title}</p> : null}
        {children ? (
          <div className="ui-status-banner__description">{children}</div>
        ) : null}
      </div>
      {action ? (
        <div className="ui-status-banner__action">{action}</div>
      ) : null}
    </div>
  );
}
