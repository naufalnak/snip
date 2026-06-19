import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-medium">404</h1>
      <p className="text-muted-foreground">
        Link tidak ditemukan atau sudah expired.
      </p>
      <Link href="/dashboard" className="text-sm underline underline-offset-4">
        Kembali ke Dashboard
      </Link>
    </div>
  );
}
