import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SignUpPage.css';
import { apiClient } from '../services/api';
import { StatusCodes } from 'http-status-codes';
import { getCookie } from 'typescript-cookie';

function SessionLoginPage({setUser, setVerifyingLoginSession}: SessionProps) {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const sessionUser = getCookie("sessionUser");

        if (sessionUser != undefined) {
            const user = JSON.parse(sessionUser);

            if(import.meta.env.VITE_FRONTEND_URL == `http://127.0.0.1:5173`){
                // Skip for localhost
                setUser(user);
                setVerifyingLoginSession(false);
                navigate("/search-home");
                return;
            }

            // Otherwise fetch actual session
            apiClient.fetch("/session-login", {
                method: "POST",
                body: JSON.stringify({
                    email: user.email,
                    sessionId: user.sessionId
                })
            }).then(result => {
                if(result.status != StatusCodes.OK) {
                    // Login Failed
                    console.log("SADNESS!!");
                    navigate("/");
                } else {
                    // Login Successful!
                    console.log("Yipee!");
                    setUser({
                        email: user.email
                    });

                    // Route to dashboard if current page being navigated to was the landing page
                    if (location.pathname == "/") {
                        navigate("/search-home");
                    }
                }
            });
        } else {
            navigate("/");
        }

        setVerifyingLoginSession(false);
    }, []);

    return (
        <div>
            <p>Signing you in...</p>
        </div>
    );
}

export default SessionLoginPage;

interface SessionProps {
  setUser: (a: any) => void;
  setVerifyingLoginSession: (val: boolean) => void;
}