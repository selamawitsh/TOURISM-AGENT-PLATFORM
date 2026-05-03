import { LucideIcon } from 'lucide-react';

export default function EmptyState({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <div className="text-center py-16 bg-white rounded-2xl border">
      <Icon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
      <h3 className="text-lg font-semibold text-gray-700 mb-1">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </div>
  );
}
