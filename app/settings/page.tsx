import ExportImportSettings from "@/components/ExportImportSettings";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export default function SettingsPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 md:px-10 py-6 md:py-10">
      <h1 className="font-display italic text-2xl text-ink mb-6">Settings</h1>

      <div className="space-y-8 max-w-md">
        <section>
          <p className="text-sm text-ink font-medium mb-3">Appearance</p>
          <ThemeSwitcher />
        </section>

        <section>
          <ExportImportSettings />
        </section>
      </div>
    </div>
  );
}