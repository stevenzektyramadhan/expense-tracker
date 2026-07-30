// Hallmark · component: Button · genre: authenticated utility · theme: Calm Ledger · states: default/hover/focus/active/disabled/loading/error/success · contrast: semantic tokens
import { forwardRef } from "react";

const Button = forwardRef(function Button(
  {
    children,
    className = "",
    disabled = false,
    fullWidth = false,
    isLoading = false,
    loadingLabel = "Memproses…",
    size = "default",
    state = "default",
    type = "button",
    variant = "primary",
    ...props
  },
  ref,
) {
  const isUnavailable = disabled || isLoading;
  const classes = ["ui-button", className].filter(Boolean).join(" ");

  return (
    <button
      {...props}
      ref={ref}
      type={type}
      className={classes}
      data-loading={isLoading ? "true" : undefined}
      data-size={size}
      data-state={isLoading ? "loading" : state}
      data-variant={variant}
      data-width={fullWidth ? "full" : undefined}
      disabled={isUnavailable}
      aria-busy={isLoading || undefined}
      aria-disabled={isUnavailable || undefined}
    >
      {isLoading ? (
        <>
          <span className="ui-button__spinner" aria-hidden="true" />
          <span>{loadingLabel}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
});

Button.displayName = "Button";

export default Button;
