import { cn } from "@/lib/utils";

const PARTICLE_IDS = [1, 2, 3, 4, 5, 6];

export default function PremiumActionButton({
  className,
  children,
  icon = null,
  disabled = false,
  type = "button",
  ...props
}) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled}
      className={cn("premium-action-btn", className, { "is-disabled": disabled })}
    >
      <span className="premium-action-btn__particles" aria-hidden="true">
        {PARTICLE_IDS.map((id) => (
          <span key={id} className={cn("premium-action-btn__particle", `premium-action-btn__particle--${id}`)} />
        ))}
      </span>
      <span className="premium-action-btn__inner">
        <span className="premium-action-btn__glow" aria-hidden="true" />
        <span className="premium-action-btn__sparkle premium-action-btn__sparkle--left" aria-hidden="true" />
        <span className="premium-action-btn__content">
          {icon ? <span className="premium-action-btn__icon">{icon}</span> : null}
          <span className="premium-action-btn__label">{children}</span>
        </span>
        <span className="premium-action-btn__sparkle premium-action-btn__sparkle--right" aria-hidden="true" />
      </span>
    </button>
  );
}
