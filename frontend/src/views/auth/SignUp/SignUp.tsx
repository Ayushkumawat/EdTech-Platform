
import { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import SignUpForm from '@/views/auth/SignUp/SignUpForm';
import { apiSignGoogle } from '@/services/AuthService';
import { apiGetClasses } from '@/services/ClassService';
import { useAppDispatch } from '@/store';
import { signInSuccess, setUser } from '@/store';
import { resetBooksData as resetMainBooksData } from '@/store/slices/book/booksSlice';
import { resetBooksData as resetAllBooksData } from '@/views/Books/books-all/store';
import { useNavigate } from 'react-router-dom';
import appConfig from '@/configs/app.config';


const SignUp = () => {
    const [showClassModal, setShowClassModal] = useState(false);
    const [googleIdToken, setGoogleIdToken] = useState<string | null>(null);
    const [classOptions, setClassOptions] = useState<{ label: string; value: string }[]>([]);
    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // Fetch classes for the modal
    useEffect(() => {
        if (showClassModal) {
            const fetchClasses = async () => {
                setLoadingClasses(true);
                try {
                    const response = await apiGetClasses<any>();
                    const options = (response.data || []).map((item: any) => ({
                        label: item.name,
                        value: item.uid,
                    }));
                    setClassOptions(options);
                } catch (error) {
                    setClassOptions([]);
                } finally {
                    setLoadingClasses(false);
                }
            };
            fetchClasses();
        }
    }, [showClassModal]);

    const handleGoogleSuccess = (credentialResponse: any) => {
        const id_token = credentialResponse.credential;
        setGoogleIdToken(id_token);
        setShowClassModal(true);
    };

    const handleGoogleError = () => {
        console.log('Google Sign-In failed');
    };

    const handleClassSubmit = async () => {
        if (!googleIdToken || !selectedClass) return;
        setSubmitting(true);
        try {
            const response = await apiSignGoogle({
                id_token: googleIdToken,
                class_id: selectedClass,
            });
            const data = response.data;
            
            if (data) {
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
                
                // Clear books data when signing up to ensure fresh data
                console.log('Google Sign up: Clearing books data...');
                dispatch(resetMainBooksData());
                dispatch(resetAllBooksData());
                
                // Navigate to authenticated entry path
                navigate(appConfig.authenticatedEntryPath, { replace: true });
            } else {
                alert('Signup failed');
            }
            setShowClassModal(false);
            setGoogleIdToken(null);
            setSelectedClass(null);
        } catch (error) {
            alert('Google signup failed');
            console.error('Google signup failed', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <GoogleOAuthProvider clientId="932880233723-oe3radmfviujjvd7vo409erc71l8u8hs.apps.googleusercontent.com">
            <div className="relative top-[-10px]">
                <div className="mb-4">
                    <h3 className="mb-1">Sign Up</h3>
                    <p>And lets get started with your free</p>
                </div>
                <SignUpForm disableSubmit={false} />
                <div className="mt-4 flex justify-center">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                    />
                </div>
                {/* Modal for class selection after Google login */}
                {showClassModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded shadow-lg min-w-[300px]">
                            <h4 className="mb-4">Select Your Class</h4>
                            <Select
                                placeholder={loadingClasses ? 'Loading classes...' : 'Select your class'}
                                options={classOptions}
                                value={classOptions.find(option => option.value === selectedClass) || null}
                                onChange={option => setSelectedClass(option?.value || null)}
                                isDisabled={loadingClasses}
                            />
                            <div className="flex gap-2 mt-4">
                                <Button
                                    block
                                    loading={submitting}
                                    disabled={!selectedClass || submitting}
                                    onClick={handleClassSubmit}
                                    className="!bg-[var(--thm-primary)] hover:opacity-80"
                                >
                                    Continue
                                </Button>
                                <Button
                                    block
                                    variant="plain"
                                    onClick={() => { setShowClassModal(false); setGoogleIdToken(null); setSelectedClass(null); }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </GoogleOAuthProvider>
    )
}

export default SignUp
