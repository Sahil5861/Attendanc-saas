import Sidebar from "./sidebar";
import Header from "./header";

import AuthLoader from "../providers/AuthLoader";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    return (

        <AuthLoader>
            <div className="h-screen flex overflow-hidden">

                <Sidebar />

                <div className="flex-1 flex flex-col overflow-hidden">

                    <Header />

                    <div className="flex-1 overflow-y-auto bg-slate-50">

                        <div className="max-w-[1600px] mx-auto p-6">
                            {children}
                        </div>

                    </div>

                </div>

            </div>
        </AuthLoader>
    );
}