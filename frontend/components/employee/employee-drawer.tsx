"use client";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function CompanyDrawer({
  open,
  onClose,
  title,
  children,
}: Props) {

  return (
    <>
      {/* Overlay */}

      <div
        className={`
        fixed inset-0 z-40
        bg-black/40

        transition-all

        ${
          open
            ? "opacity-100 visible"
            : "opacity-0 invisible"
        }
        `}
        onClick={onClose}
      />

      {/* Drawer */}

      <div
        className={`
        fixed
        top-0
        right-0

        h-screen

        w-full
        md:w-[65%]

        bg-white

        z-50

        shadow-2xl

        transition-transform
        duration-300

        ${
          open
            ? "translate-x-0"
            : "translate-x-full"
        }
        `}
      >

        <div
          className="
          h-20
          border-b

          flex
          items-center
          justify-between

          px-6
          "
        >

          <h2 className="text-xl font-semibold">
            {title}
          </h2>

          <button
            onClick={onClose}
          >
            ✕
          </button>

        </div>

        <div
          className="
          p-6
          h-[calc(100vh-80px)]
          overflow-y-auto
          "
        >
          {children}
        </div>

      </div>
    </>
  );
}