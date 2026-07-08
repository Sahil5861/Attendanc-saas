"use client"

import { useState } from "react"
import EmptyState from "@/components/common/EmptyState";


export default function LeavePage(){

    const [loading, setLoading] = useState(false);
    const [leaves, setLeaves] = useState([]);
    const [selectedLeve, setSelectedLeave] = useState([]);    
    const [open, setOpen] = useState(false)


    return (
        <h1>Leaves Page</h1>
    )
}