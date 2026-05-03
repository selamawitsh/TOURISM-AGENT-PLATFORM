export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent" />
    </div>
  );
}
