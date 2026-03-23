export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`animate-fadeUp flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium min-w-[260px] max-w-xs
            ${t.type === "error"   ? "bg-red-600 text-white"
            : t.type === "warning" ? "bg-amber-500 text-white"
            : "bg-gray-900 text-white"}`}
        >
          <span className="flex-1">{t.msg}</span>
          <button onClick={() => onDismiss(t.id)} className="opacity-60 hover:opacity-100 transition text-lg leading-none">×</button>
        </div>
      ))}
    </div>
  );
}
