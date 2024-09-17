'use client';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import axios from 'axios';
function AuthWrapper({ children }: { children: React.ReactNode }) {

  const url = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
  const frontUrl = process.env.SERVER_FRONTEND || "http://localhost:3000";
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const router = useRouter();
    useEffect(() => {
        const fetchData = async () => {
            try {
                await axios.get(`${url}/user/me`, {withCredentials: true})
                    .then((res) => {
                            if (res) {
                                setIsAuthenticated(true);
                            } else {
                                router.push(`${frontUrl}`);
                            }
                    }).catch(() => {
                        router.push(`${frontUrl}`);
                    });
                } catch {
                router.push(`${frontUrl}`);
                }
        }
        fetchData();
    }, []);

    if (isAuthenticated) {
        return <>{children}</>;
    }
    return null
};

export default AuthWrapper