export function FullPageMessage({ text }: { text: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-gray-50 text-sm text-gray-500">
      {text}
    </div>
  );
}
