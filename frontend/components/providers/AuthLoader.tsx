"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { setAuth } from "@/store/slices/authSlice";
import { getMe } from "@/services/auth.service";

export default function AuthLoader({
    children,
}: {
    children: React.ReactNode;
}) {

    const dispatch = useDispatch();

    useEffect(() => {

        const loadUser = async () => {

            try {

                const response = await getMe();

                console.log('Me respone : ', response);
                

                dispatch(
                    setAuth({
                        user: response.data.user,
                        permissions: response.data.permissions,
                        plan: response.data.plan
                    })
                );

            } catch (error) {
                console.log(error);
            }
        };

        loadUser();

    }, [dispatch]);

    return <>{children}</>;
}