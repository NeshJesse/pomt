import HistoryView from "@/components/HistoryView";

export default function HistoryPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 md:px-10 py-6 md:py-10">
      <h1 className="font-display italic text-2xl text-ink mb-6">History</h1>
      <HistoryView />
    </div>
  );
}