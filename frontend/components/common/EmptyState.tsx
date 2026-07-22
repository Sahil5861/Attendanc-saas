interface Props {
  title: string;
  subTitle?: string;
  buttonText?: string;
  onCreate?: () => void;
  icon?: React.ReactNode;
}

export default function EmptyState({
  title,
  subTitle,
  buttonText,
  onCreate,
  icon,
}: Props) {
  return (
    <div className="h-[70vh] flex flex-col items-center justify-center">
      {icon ? (
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
          <div className="h-10 w-10">
            {icon}
          </div>
        </div>
      ) : (
        <div className="text-6xl">
          🏢
        </div>
      )}

      <h2 className="mt-6 text-2xl font-semibold text-gray-900">
        {title}
      </h2>

      {subTitle && (
        <p className="mt-2 max-w-md text-center text-gray-500">
          {subTitle}
        </p>
      )}

      {buttonText && onCreate && (
        <button
          onClick={onCreate}
          className="mt-6 rounded-lg bg-green-600 px-5 py-2.5 text-white transition hover:bg-green-700"
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}