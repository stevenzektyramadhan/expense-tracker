// Hallmark · component: FormField · genre: authenticated utility · theme: Calm Ledger · states: default/hover/focus/active/disabled/loading/error/success · contrast: text plus semantic status
import { cloneElement, isValidElement, useId } from "react";
import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";

export default function FormField({
  children,
  className = "",
  disabled = false,
  error,
  helperText,
  id,
  isLoading = false,
  label,
  loadingMessage = "Memeriksa…",
  required = false,
  successMessage,
}) {
  const generatedId = useId();

  if (!isValidElement(children)) {
    throw new Error("FormField membutuhkan tepat satu elemen kontrol.");
  }

  const controlId = id || children.props.id || `${generatedId}-control`;
  const messageId = `${controlId}-message`;
  const hasError = Boolean(error);
  const hasSuccess = !hasError && !isLoading && Boolean(successMessage);
  const state = hasError
    ? "error"
    : isLoading
      ? "loading"
      : hasSuccess
        ? "success"
        : "default";
  const message = hasError
    ? error
    : isLoading
      ? loadingMessage
      : hasSuccess
        ? successMessage
        : helperText;
  const hasMessage = Boolean(message);
  const describedBy = [
    children.props["aria-describedby"],
    hasMessage ? messageId : null,
  ]
    .filter(Boolean)
    .join(" ");
  const controlClassName = ["ui-form-control", children.props.className]
    .filter(Boolean)
    .join(" ");
  const fieldClassName = ["ui-form-field", className]
    .filter(Boolean)
    .join(" ");
  const StatusIcon = hasError
    ? CircleAlert
    : isLoading
      ? LoaderCircle
      : hasSuccess
        ? CircleCheck
        : null;

  const control = cloneElement(children, {
    id: controlId,
    className: controlClassName,
    disabled: disabled || children.props.disabled || undefined,
    required: required || children.props.required || undefined,
    "aria-busy": isLoading || children.props["aria-busy"] || undefined,
    "aria-describedby": describedBy || undefined,
    "aria-disabled":
      disabled || children.props["aria-disabled"] || undefined,
    "aria-invalid": hasError || children.props["aria-invalid"] || undefined,
    "aria-required":
      required || children.props["aria-required"] || undefined,
    "data-state": state,
  });

  return (
    <div className={fieldClassName} data-state={state}>
      <label className="ui-form-field__label" htmlFor={controlId}>
        <span>{label}</span>
        {required ? (
          <span className="ui-form-field__required">(wajib)</span>
        ) : null}
      </label>

      {control}

      <p
        id={messageId}
        className="ui-form-field__message"
        data-tone={state === "default" ? "help" : state}
        role={hasError ? "alert" : isLoading || hasSuccess ? "status" : undefined}
      >
        {StatusIcon ? <StatusIcon aria-hidden="true" /> : null}
        {hasMessage ? message : <span aria-hidden="true">&nbsp;</span>}
      </p>
    </div>
  );
}
