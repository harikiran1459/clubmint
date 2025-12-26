export default function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <h2 className="text-2xl font-semibold text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-gray-400">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
