"use client";

// Hallmark · component: PasswordField · genre: modern-minimal · theme: Calm Ledger
// states: default/hover/focus/active/disabled/loading/error/success · contrast: icon plus text
import { useId, useState } from "react";
import { CircleAlert, Eye, EyeOff, Lock } from "lucide-react";

export default function PasswordField({
  autoComplete,
  disabled = false,
  error,
  helperText,
  id,
  label,
  name,
  onBlur,
  onChange,
  placeholder,
  required = false,
  value,
}) {
  const generatedId = useId();
  const controlId = id || `${generatedId}-password`;
  const messageId = `${controlId}-message`;
  const [isVisible, setIsVisible] = useState(false);
  const hasError = Boolean(error);
  const message = error || helperText;

  return (
    <div
      className="ui-form-field auth-password-field"
      data-state={hasError ? "error" : "default"}
    >
      <label className="ui-form-field__label" htmlFor={controlId}>
        <span>{label}</span>
        {required ? (
          <span className="ui-form-field__required">(wajib)</span>
        ) : null}
      </label>

      <div className="auth-password-field__control">
        <Lock
          className="auth-password-field__leading-icon"
          aria-hidden="true"
        />
        <input
          id={controlId}
          name={name}
          type={isVisible ? "text" : "password"}
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
          className="ui-form-control auth-password-field__input"
          placeholder={placeholder}
          value={value}
          onBlur={onBlur}
          onChange={onChange}
          aria-describedby={message ? messageId : undefined}
          aria-invalid={hasError || undefined}
          aria-required={required || undefined}
          data-state={hasError ? "error" : "default"}
        />
        <button
          type="button"
          className="auth-password-field__toggle"
          onClick={() => setIsVisible((current) => !current)}
          disabled={disabled}
          aria-label={
            isVisible ? `Sembunyikan ${label.toLowerCase()}` : `Tampilkan ${label.toLowerCase()}`
          }
          aria-pressed={isVisible}
        >
          {isVisible ? (
            <EyeOff aria-hidden="true" />
          ) : (
            <Eye aria-hidden="true" />
          )}
        </button>
      </div>

      <p
        id={messageId}
        className="ui-form-field__message"
        data-tone={hasError ? "error" : "help"}
        role={hasError ? "alert" : undefined}
      >
        {hasError ? <CircleAlert aria-hidden="true" /> : null}
        {message || <span aria-hidden="true">&nbsp;</span>}
      </p>
    </div>
  );
}
