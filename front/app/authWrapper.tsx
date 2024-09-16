'use client';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import axios from 'axios';
function AuthWrapper({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const router = useRouter();
    useEffect(() => {
        const fetchData = async () => {
            try {
                await axios.get('http://localhost:4000/user/me', {withCredentials: true})
                    .then((res) => {
                            if (res) {
                                setIsAuthenticated(true);
                            } else {
                                router.push('http://localhost:3000');
                            }
                    }).catch(() => {
                        router.push('http://localhost:3000');
                    });
                } catch {
                router.push('http://localhost:3000');
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