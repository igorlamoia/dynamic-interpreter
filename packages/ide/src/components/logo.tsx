// import { CodeXml } from "lucide-react";
"use client";
import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3 group -tracking-tighter">
      {/* <div className="w-10 text-slate-800 h-10 rounded-xl bg-linear-to-br from-[#0dccf2] to-[#10b981] flex items-center justify-center  shadow-[0_0_15px_rgba(13,204,242,0.4)] group-hover:shadow-[0_0_25px_rgba(13,204,242,0.6)] transition-all duration-300">
        <CodeXml />
      </div> */}
      {/* <div className="hidden md:flex flex-col">
        <p className="text-xl font-black text-slate-700 dark:text-white">
          <span className="absolute top-1.5 text-4xl text-[#0dccf2] drop-shadow-[0_0_8px_rgba(13,204,242,0.8)]">
            D
          </span>
          <span className="ml-6.5">ynamic</span>
        </p>
        <p className="-mt-5.5 text-xl font-black text-slate-700 dark:text-white ">
          <span className="text-4xl ml-2 text-[#0dccf2] drop-shadow-[0_0_8px_rgba(13,204,242,0.8)]">
            I
          </span>
          <span className="ml-0.5"> nterpreter</span>
        </p>
      </div> */}
      <Image
        src="/images/logo-di.png"
        alt="Dynamic Interpreter Logo"
        width={100}
        height={100}
      />
    </Link>
  );
}
