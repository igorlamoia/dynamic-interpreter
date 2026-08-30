// import { CodeXml } from "lucide-react";
"use client";
import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center my-auto">
      <Image
        src="/images/logo-di.png"
        alt="Dynamic Interpreter Logo"
        width={100}
        height={100}
      />
    </Link>
  );
}
