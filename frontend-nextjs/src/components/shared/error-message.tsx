export default function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{message}</div>
  );
}
