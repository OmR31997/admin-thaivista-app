export default function FormErrorMessage({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs shadow-sm"
    >
      <i className="bi bi-exclamation-circle-fill text-rose-600 text-sm mt-0.5 shrink-0" />
      <span className="font-medium leading-relaxed">{message}</span>
    </div>
  );
}
