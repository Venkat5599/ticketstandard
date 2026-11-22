"use client";

type Step = { label: string; completed?: boolean };

export function Stepper({
  steps,
  active,
  onChange,
}: {
  steps: Step[];
  active: number;
  onChange: (step: number) => void;
}) {
  return (
    <ol className="voyage-stepper" aria-label="Event planning checklist">
      {steps.map((step, index) => {
        const state = step.completed ? "complete" : index === active ? "current" : "upcoming";
        return (
          <li className={`voyage-stepper-item is-${state}`} key={`${index}-${step.label}`}>
            <button
              type="button"
              className="voyage-stepper-step"
              aria-current={index === active ? "step" : undefined}
              aria-label={`${step.completed ? "Completed" : `Step ${index + 1}`}: ${step.label}`}
              onClick={() => onChange(index)}
            >
              <span className="voyage-stepper-marker">{step.completed ? "✓" : String(index + 1).padStart(2, "0")}</span>
              <span className="voyage-stepper-label">{step.label}</span>
            </button>
            {index < steps.length - 1 && <span className="voyage-stepper-connector" aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}
