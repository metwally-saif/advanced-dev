import Image from "next/image";

export default async function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="font-cal text-4xl">404</h1>
      <Image
        alt="missing page"
        src="https://illustrations.popsy.co/gray/timed-out-error.svg"
        width={400}
        height={400}
      />
      <p className="text-lg text-stone-500">
        Blimey! You&apos;ve found a page that doesn&apos;t exist.
      </p>
    </div>
  );
}
