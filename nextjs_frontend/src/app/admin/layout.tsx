import AdminHeader from "@/components/layout/AdminHeader";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#f5f7fa]">
            <AdminHeader />
            <main className="w-full max-w-[1400px] mx-auto p-4 md:p-8">
                {children}
            </main>
        </div>
    );
}
