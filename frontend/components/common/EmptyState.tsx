import { Plus } from "lucide-react";
import PrimaryButton from "./PrimaryButton";

interface Props {
    title: string;
    subTitle?: string;
    buttonText?: string;
    onCreate?: () => void;
}

export default function EmptyState({
    title,
    subTitle,
    buttonText,
    onCreate
}: Props) {

    return (
        <div className="h-[70vh] flex flex-col items-center justify-center">

            <div className="text-6xl">
                🏢
            </div>

            <h2
                className="text-2xl text-black font-bold mt-4">
                {title}
            </h2>

            <p className="text-slate-500 mt-2">
                {subTitle}
            </p>           

            {
                buttonText && (
                    <PrimaryButton
                        title={buttonText || ''}
                        icon={ buttonText ? <Plus size={13}/> : ''}
                        onClick={onCreate}
                    />
                ) 
            }

        </div>
    );
}