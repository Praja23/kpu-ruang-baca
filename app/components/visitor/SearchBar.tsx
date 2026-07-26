"use client";

export default function SearchBar({
  onSearch,
}: {
  onSearch: (query: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-2 flex items-center border border-surface-variant focus-within:ring-4 focus-within:ring-primary/10 transition-all">
      <span className="material-symbols-outlined text-outline ml-4">
        search
      </span>
      <input
        type="text"
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Cari judul buku, pengarang, atau kode..."
        className="w-full border-none focus:ring-0 px-4 py-3 text-body-md bg-transparent"
      />
      <button className="primary-gradient text-on-primary px-8 py-3 rounded-xl font-title-md text-title-md transition-all active:scale-95">
        Cari
      </button>
    </div>
  );
}
