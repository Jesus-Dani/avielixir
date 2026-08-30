export function SuccessBanner({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>
  );
}
