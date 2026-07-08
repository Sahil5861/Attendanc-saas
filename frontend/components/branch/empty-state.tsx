interface Props {
    onCreate: () => void;
}

export default function EmptyState({
    onCreate
}: Props) {

    return (
        <div
            className="
            h-[70vh]
            flex
            flex-col
            items-center
            justify-center
            "
        >

            <div className="text-6xl">
                🏢
            </div>

            <h2
                className="
                text-2xl
                font-bold
                mt-4
                "
            >
                No Branches Found
            </h2>

            <p
                className="
                text-slate-500
                mt-2
                "
            >
                Create your first Branch
            </p>

            <button
                onClick={onCreate}
                className="
                mt-6
                px-5
                py-3
                rounded-xl

                bg-emerald-600
                text-white
                "
            >
                Add Branch
            </button>

        </div>
    );
}