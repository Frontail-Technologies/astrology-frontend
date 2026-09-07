"use client";

import { useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const requiredDate = (message: string) =>
  z
    .string({ error: message })
    .trim()
    .min(1, { error: message });

const loveCompatibilitySchema = z.object({
  personName: z.string().trim().max(80).optional(),
  personDob: requiredDate("Please enter your date of birth."),
  personTob: z.string().trim().optional(),
  personPlace: z.string().trim().max(120).optional(),
  partnerName: z.string().trim().max(80).optional(),
  partnerDob: requiredDate("Please enter your partner's date of birth."),
  partnerTob: z.string().trim().optional(),
  partnerPlace: z.string().trim().max(120).optional(),
});

export type LoveCompatibilityValues = z.infer<typeof loveCompatibilitySchema>;

type FieldConfig = {
  name: keyof LoveCompatibilityValues;
  label: string;
  type: "text" | "date" | "time";
  placeholder?: string;
  autoComplete?: string;
};

const YOUR_FIELDS: FieldConfig[] = [
  { name: "personName", label: "Name", type: "text", placeholder: "Enter your name" },
  { name: "personDob", label: "Date of Birth", type: "date" },
  { name: "personTob", label: "Time of Birth", type: "time" },
  { name: "personPlace", label: "Birth Place", type: "text", placeholder: "New Delhi, India" },
];

const PARTNER_FIELDS: FieldConfig[] = [
  { name: "partnerName", label: "Name", type: "text", placeholder: "Enter partner's name" },
  { name: "partnerDob", label: "Date of Birth", type: "date" },
  { name: "partnerTob", label: "Time of Birth", type: "time" },
  { name: "partnerPlace", label: "Birth Place", type: "text", placeholder: "New Delhi, India" },
];

type LoveCompatibilityFormProps = {
  submitLabel: string;
  onValidSubmit: (values: LoveCompatibilityValues) => void;
};

export function LoveCompatibilityForm({
  submitLabel,
  onValidSubmit,
}: LoveCompatibilityFormProps) {
  const fieldPrefix = useId();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoveCompatibilityValues>({
    resolver: zodResolver(loveCompatibilitySchema),
    mode: "onSubmit",
  });

  function renderField(field: FieldConfig) {
    const id = `${fieldPrefix}-${field.name}`;
    const error = errors[field.name]?.message;
    const errorId = `${id}-error`;
    const isRequired = field.type === "date";

    return (
      <div
        key={field.name}
        className="grid gap-1.5 sm:grid-cols-[minmax(0,120px)_1fr] sm:items-center sm:gap-x-4 sm:gap-y-1"
      >
        <Label htmlFor={id} className="text-[13px] text-foreground/80">
          {field.label}
          {isRequired ? (
            <span aria-hidden="true" className="ml-0.5 text-conversion-600">
              *
            </span>
          ) : null}
        </Label>
        <div className="min-w-0">
          <Input
            id={id}
            type={field.type}
            placeholder={field.placeholder}
            aria-required={isRequired || undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className="h-11 bg-white text-sm dark:border-gold-400/20 dark:bg-espresso-800"
            {...register(field.name)}
          />
          {error ? (
            <p
              id={errorId}
              className="mt-1 text-[12px] font-medium text-destructive"
            >
              {error}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onValidSubmit)}
      className="mt-6"
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_auto_1fr] lg:gap-6">
        <fieldset className="min-w-0 space-y-3">
          <legend className="mb-3 inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.12em] text-gold-500 dark:text-gold-300">
            Your Details
          </legend>
          {YOUR_FIELDS.map(renderField)}
        </fieldset>

        <div
          aria-hidden="true"
          className="hidden items-center justify-center lg:flex"
        >
          <span className="grid size-9 place-items-center rounded-full border border-gold-500/30 bg-gold-300/15 text-gold-500 dark:border-gold-400/25 dark:bg-gold-400/10 dark:text-gold-300">
            <Heart className="size-4" />
          </span>
        </div>

        <fieldset className="min-w-0 space-y-3">
          <legend className="mb-3 inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.12em] text-gold-500 dark:text-gold-300">
            Partner Details
          </legend>
          {PARTNER_FIELDS.map(renderField)}
        </fieldset>
      </div>

      <div className="mt-8 flex justify-center">
        <Button
          type="submit"
          variant="conversion"
          className={cn(
            "h-11 w-full px-6 transition-transform duration-200 hover:-translate-y-px sm:w-auto sm:min-w-[240px]",
          )}
        >
          <Heart aria-hidden="true" />
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
