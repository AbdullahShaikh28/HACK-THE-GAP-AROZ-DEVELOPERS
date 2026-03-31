import { FrontendFooter } from "@/components/FrontendFooter";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      {children}
      <FrontendFooter />
    </div>
  );
}
