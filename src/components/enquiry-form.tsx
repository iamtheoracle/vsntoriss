import { useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { saveEnquiry, type EnquiryKind } from "@/lib/enquiries";

type Field = {
  name: string;
  label: string;
  required?: boolean;
  type?: "text" | "email" | "tel" | "textarea" | "select";
  options?: { value: string; label: string }[];
  placeholder?: string;
  hint?: string;
  span?: "full" | "half";
  minLength?: number;
};

const fieldClass =
  "mt-2 w-full border border-line-strong bg-paper px-3 py-3 text-sm text-ink outline-none transition-colors placeholder:text-stone focus:border-forest";

function FieldControl({
  field,
  error,
}: {
  field: Field;
  error?: string;
}) {
  const id = field.name;
  return (
    <div className={field.span === "half" ? "md:col-span-1" : "md:col-span-2"}>
      <label htmlFor={id} className="text-sm text-ink">
        {field.label}
        {field.required ? <span className="text-amber"> *</span> : null}
      </label>
      {field.type === "textarea" ? (
        <textarea
          id={id}
          name={field.name}
          required={field.required}
          rows={6}
          minLength={field.minLength}
          placeholder={field.placeholder}
          className={fieldClass}
        />
      ) : field.type === "select" ? (
        <select
          id={id}
          name={field.name}
          required={field.required}
          defaultValue=""
          className={fieldClass}
        >
          <option value="" disabled>
            Select…
          </option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          name={field.name}
          type={field.type ?? "text"}
          required={field.required}
          minLength={field.minLength}
          placeholder={field.placeholder}
          className={fieldClass}
          autoComplete={
            field.name === "email"
              ? "email"
              : field.name === "telephone"
                ? "tel"
                : field.name === "fullName" || field.name === "contactName"
                  ? "name"
                  : undefined
          }
        />
      )}
      {field.hint ? <p className="mt-1 text-xs leading-relaxed text-charcoal">{field.hint}</p> : null}
      {error ? <p className="mt-1 text-xs text-amber">{error}</p> : null}
    </div>
  );
}

export function EnquiryForm({
  kind,
  sections,
}: {
  kind: EnquiryKind;
  sections: { title: string; fields: Field[] }[];
}) {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const nextErrors: Record<string, string> = {};
    const fields: Record<string, string> = {};

    for (const section of sections) {
      for (const field of section.fields) {
        const value = String(data.get(field.name) ?? "").trim();
        fields[field.name] = value;
        if (field.required && !value) {
          nextErrors[field.name] = "This field is required.";
        } else if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          nextErrors[field.name] = "Enter a valid email address.";
        } else if (field.minLength && value.length < field.minLength) {
          nextErrors[field.name] = `Please write at least ${field.minLength} characters.`;
        }
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setPending(true);
    const record = saveEnquiry(kind, fields);
    void navigate({ to: "/enquiry-success", search: { ref: record.reference } });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-10" noValidate>
      {sections.map((section) => (
        <fieldset key={section.title} className="space-y-4">
          <legend className="font-serif text-xl text-ink">{section.title}</legend>
          <div className="grid gap-4 md:grid-cols-2">
            {section.fields.map((field) => (
              <FieldControl key={field.name} field={field} error={errors[field.name]} />
            ))}
          </div>
        </fieldset>
      ))}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center bg-forest px-8 py-3 text-sm tracking-wide text-paper transition-colors hover:bg-forest-deep disabled:opacity-60"
      >
        {pending ? "Recording…" : "Submit enquiry"}
      </button>
    </form>
  );
}
