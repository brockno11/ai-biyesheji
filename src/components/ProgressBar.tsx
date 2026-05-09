interface Props {
  value: number;
  max?: number;
  label?: string;
  showPercent?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export default function ProgressBar({
  value,
  max = 100,
  label,
  showPercent = true,
  size = 'md',
  color,
}: Props) {
  const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;

  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-gray-500">{label}</span>}
          {showPercent && (
            <span className="text-xs font-medium text-gray-600">{pct}%</span>
          )}
        </div>
      )}
      <div className={`w-full ${heights[size]} bg-gray-100 rounded-full overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            color || 'bg-gradient-to-r from-primary-500 to-accent-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
