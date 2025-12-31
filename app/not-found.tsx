import Image from "next/image";
import Link from "next/link";
import NotFoundImg from "@/assets/NotFound/notFoundImg.png";

/**
 * Next.js App Router special file.
 * Keep this as a SERVER component (no "use client") to avoid importing any client-only code
 * during prerender (e.g., modules that may reference browser globals like File).
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-light-gray flex flex-col gap-y-5 justify-center items-center">
      <div className="flex flex-col items-center relative">
        <h1 className="text-black font-medium text-9xl absolute top-[-60px]">404</h1>

        <Image
          src={NotFoundImg}
          alt="Not found image"
          priority
          style={{ height: "auto", width: "100%" }}
          className="max-w-[520px]"
        />
      </div>

      <h4 className="text-black text-xl text-center max-w-[40ch]">
        Looks like you found a page that does not exist or you don&apos;t have access to.
      </h4>

      {/* Use a plain Link styled like a button to avoid pulling in client UI libraries */}
      <Link
        href="/"
        className="bg-steel-blue rounded-[8px] py-3 px-6 flex items-center justify-center text-white font-semibold text-base"
      >
        Return home
      </Link>
    </div>
  );
}
