import { Navbar } from "@/components/Navbar";
import { PostorNav } from "@/components/postor/PostorNav";

export default function PostorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main className="pt-16 pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
      <PostorNav />
    </div>
  );
}
