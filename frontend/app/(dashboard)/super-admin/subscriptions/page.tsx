"use client"

import EmptyState from "@/components/common/EmptyState";
import { Wallet2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getSubscriptions } from "@/services/super-admin.service";
import Table from "@/components/subscription/table";

export default function Page() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
    // const [form, setForm] = useState(defaultForm);



    const fectchData = async()=>{
        setLoading(true);
        const res = await getSubscriptions();
        setSubscriptions(res.data.data);

        console.log('data : ', res.data.data);
        
        setLoading(false);
    }

    useEffect(()=>{
        fectchData();
    }, []);
    return (
        <>
            {subscriptions.length === 0 ? (
                <EmptyState
                    title="No Subscriptions done"
                    icon={<Wallet2 className="h-full w-full" />}
                />
            ) : (
                <Table
                    subscription={subscriptions}                    
                />
            )}
        </>
    )
}