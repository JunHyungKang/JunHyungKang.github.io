"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProjectsRedirect() {
    const router = useRouter();

    useEffect(() => {
        window.location.href = "https://www.free-utils.app/";
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#020617] text-slate-200">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Redirecting to Projects...</h1>
                <p className="text-slate-400">
                    If you are not redirected automatically,{" "}
                    <a
                        href="https://www.free-utils.app/"
                        className="text-blue-400 hover:underline"
                    >
                        click here
                    </a>
                    .
                </p>
            </div>
        </div>
    );
}
