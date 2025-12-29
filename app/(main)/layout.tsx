import { ReactNode } from "react";
import { Copyright, Github } from "lucide-react";
import Link from "next/link";
import Header from "@/components/header";

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Header />
      <main className="flex-1 grid grid-cols-1">
        <div className="w-full max-w-4xl mx-auto md:border-x border-dashed border-foreground">
          {children}
        </div>
      </main>
      <footer className="border-t border-dashed border-foreground">
        <div className="w-full max-w-4xl mx-auto md:border-x border-dashed border-foreground flex justify-between items-center p-4 gap-2 h-16 bg-background text-foreground/80">
          <Link href={"/"} className="">
            <p className="flex items-center gap-1">
              <Copyright className="size-3.5 inline" /> Yash Agrawal: Full-stack
              Software Engineer
            </p>
          </Link>
          <Link
            href={"https://github.com/yash-ag-online"}
            className="p-2 border rounded-sm"
          >
            <Github className="size-4" />
          </Link>
        </div>
      </footer>
    </>
  );
};

export default layout;
