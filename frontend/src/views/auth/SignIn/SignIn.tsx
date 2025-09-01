import SignInForm from './SignInForm'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { apiSignGoogle } from '@/services/AuthService';
import { useAppDispatch } from '@/store';
import { signInSuccess, setUser } from '@/store';
import { resetBooksData as resetMainBooksData } from '@/store/slices/book/booksSlice';
import { resetBooksData as resetAllBooksData } from '@/views/Books/books-all/store';
import { useNavigate } from 'react-router-dom';
import appConfig from '@/configs/app.config';

const SignIn = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleGoogleSuccess = async (credentialResponse: any) => {
        const id_token = credentialResponse.credential;
        try {
            // For sign-in, try without class_id first (user should already have class associated)
            const response = await apiSignGoogle({ id_token });
            const data = response.data;
            
            if (data && data.token) {
                const { token } = data;
                // Dispatch authentication success
                dispatch(signInSuccess(token));
                
                if (data.user) {
                    dispatch(
                        setUser({
                            ...data.user,
                            loading: false
                        })
                    );
                }
                
                // Clear books data when signing in to ensure fresh data
                console.log('Google Sign in: Clearing books data...');
                dispatch(resetMainBooksData());
                dispatch(resetAllBooksData());
                
                // Navigate to authenticated entry path
                navigate(appConfig.authenticatedEntryPath, { replace: true });
            } else {
                console.error('Google login failed: No token received');
                alert('Google sign-in failed. Please try again.');
            }
        } catch (error) {
            console.error('Google login failed', error);
            alert('Google sign-in failed. Please try again.');
        }
    };

    const handleGoogleError = () => {
        console.log('Google Sign-In failed');
    };

    return (
        <GoogleOAuthProvider clientId="421969447253-4ph117jikerj89nc476hdq73trslklo2.apps.googleusercontent.com">
            <div className="mb-8">
                <h3 className="mb-1">Welcome back!</h3>
                <p>Please enter your credentials to sign in!</p>
            </div>
            <SignInForm disableSubmit={false} />
            <div className="mt-4 flex justify-center">
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                />
            </div>
        </GoogleOAuthProvider>
    )
}

export default SignIn
