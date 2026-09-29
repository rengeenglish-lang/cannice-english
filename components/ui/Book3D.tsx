import Image from "next/image";

/**
 * A cover rendered as a physical book: turned in perspective, with a shaded spine,
 * page edges and a contact shadow. Covers are 900x1274, so height follows width.
 */
export function Book3D({ src, alt, width = 104, angle = -20, priority = false }: {
  src: string;
  alt: string;
  width?: number;
  angle?: number;
  priority?: boolean;
}) {
  const height = Math.round(width * 1.415);
  const spine = Math.max(7, Math.round(width * 0.085));

  return (
    <div className="relative shrink-0" style={{ width, height }}>
      {/* contact shadow on the shelf */}
      <span
        aria-hidden
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-[50%] bg-black/35 blur-md"
        style={{ width: width * 0.9, height: Math.max(6, width * 0.07) }}
      />
      <div
        className="relative h-full w-full transition-transform duration-500 ease-out motion-safe:group-hover:[transform:perspective(1100px)_rotateY(-8deg)]"
        style={{ transform: `perspective(1100px) rotateY(${angle}deg)`, transformOrigin: "left center" }}
      >
        {/* page edges, stacked just behind the cover on the fore edge */}
        <span
          aria-hidden
          className="absolute inset-y-[3px] right-[-5px] rounded-r-[2px]"
          style={{
            width: 6,
            background:
              "repeating-linear-gradient(90deg,#fdfaf2 0px,#fdfaf2 1px,#d8d2c4 1px,#d8d2c4 2px)",
            boxShadow: "inset -2px 0 4px rgba(0,0,0,.25)",
          }}
        />
        <Image
          src={src}
          alt={alt}
          width={900}
          height={1274}
          sizes={`${width}px`}
          priority={priority}
          className="relative h-full w-full rounded-[3px] object-cover shadow-[0_16px_30px_rgba(7,27,52,.35)]"
        />
        {/* the spine wrap: dark at the hinge, a lift of light along the fold */}
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 rounded-l-[3px]"
          style={{
            width: spine,
            background:
              "linear-gradient(90deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,.28) 45%,rgba(255,255,255,.16) 72%,rgba(0,0,0,.30) 100%)",
          }}
        />
        {/* sheen across the board */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[3px]"
          style={{
            background:
              "linear-gradient(105deg,rgba(255,255,255,.22) 0%,rgba(255,255,255,.05) 28%,rgba(255,255,255,0) 55%)",
          }}
        />
      </div>
    </div>
  );
}
