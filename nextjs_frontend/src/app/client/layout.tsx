import Header from "@/components/layout/Header";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-bg-body">
            <Header />
            <main className="max-w-[1400px] mx-auto py-8 px-4">
                {children}
            </main>
        </div>
    );
}
