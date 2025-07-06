import { FormItem, FormContainer } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import PasswordInput from '@/components/shared/PasswordInput'
import ActionLink from '@/components/shared/ActionLink'
import Select from '@/components/ui/Select'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import useAuth from '@/utils/hooks/useAuth'
import type { CommonProps } from '@/@types/common'
import { useEffect, useState } from 'react'
import { apiGetPublicClasses } from '@/services/ClassService'

interface SignUpFormProps extends CommonProps {
    disableSubmit?: boolean
    signInUrl?: string
}

type SignUpFormSchema = {
    firstName: string
    lastName: string
    class_id: string
    password: string
    email: string
}

const validationSchema = Yup.object().shape({
    firstName: Yup.string().required('Please enter your first name'),
    lastName: Yup.string().required('Please enter your last name'),
    class_id: Yup.string().required('Please select your class'),
    email: Yup.string()
        .email('Invalid email')
        .required('Please enter your email'),
    password: Yup.string().required('Please enter your password'),
    confirmPassword: Yup.string().oneOf(
        [Yup.ref('password')],
        'Your passwords do not match',
    ),
})

const SignUpForm = (props: SignUpFormProps) => {
    const { disableSubmit = false, className, signInUrl = '/sign-in' } = props

    const { signUp } = useAuth()
    const [classOptions, setClassOptions] = useState<{ label: string; value: string }[]>([])
    const [message, setMessage] = useTimeOutMessage()
    const [loadingClasses, setLoadingClasses] = useState(false)

    useEffect(() => {
        const fetchClasses = async () => {
            console.log('Fetching classes...');
            setLoadingClasses(true);
            try {
                const response = await apiGetPublicClasses<any>();
                console.log('Classes fetched successfully:', response.data);
            
                
                // Map your response data to the correct format for the Select
                const options = (response.data || []).map((item: any) => ({
                    label: item.name,
                    value: item.uid,
                }));
                setClassOptions(options);
            } catch (error: any) {
                console.error('Error fetching classes:', error);
              
            } finally {
                setLoadingClasses(false);
            }
        };
        fetchClasses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array - only run once on mount

    const onSignUp = async (
        values: SignUpFormSchema,
        setSubmitting: (isSubmitting: boolean) => void,
    ) => {
        const {
            firstName: first_name,
            lastName: last_name,
            class_id,
            password,
            email,
        } = values
        setSubmitting(true)
        const result = await signUp({
            first_name,
            last_name,
            class_id,
            password,
            email,
        })

        if (result?.status === 'failed') {
            setMessage(result.message)
        }

        setSubmitting(false)
    }

    return (
        <div className={className}>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    {message}
                </Alert>
            )}
            <Formik
                initialValues={{
                    firstName: '',
                    lastName: '',
                    class_id: '',
                    password: '',
                    confirmPassword: '',
                    email: ''
                }}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting }) => {
                    if (!disableSubmit) {
                        onSignUp(values, setSubmitting)
                    } else {
                        setSubmitting(false)
                    }
                }}
            >
                {({ touched, errors, isSubmitting, values }) => (
                    <Form>
                        <FormContainer>
                            <div
                                className=""
                                style={{
                                    scrollbarWidth: 'none', // For Firefox
                                    msOverflowStyle: 'none', // For Internet Explorer
                                }}
                            >
                                <div className="flex gap-2">
                                    <FormItem
                                        label="First Name"
                                        invalid={
                                            errors.firstName &&
                                            touched.firstName
                                        }
                                        errorMessage={errors.firstName}
                                        className="!mb-3"
                                    >
                                        <Field
                                            type="text"
                                            autoComplete="off"
                                            name="firstName"
                                            placeholder="First Name"
                                            component={Input}
                                        />
                                    </FormItem>
                                    <FormItem
                                        label="Last Name"
                                        invalid={
                                            errors.lastName && touched.lastName
                                        }
                                        errorMessage={errors.lastName}
                                        className="!mb-3"
                                    >
                                        <Field
                                            type="text"
                                            autoComplete="off"
                                            name="lastName"
                                            placeholder="Last Name"
                                            component={Input}
                                        />
                                    </FormItem>
                                </div>
                                <FormItem
                                    label="Class"
                                    invalid={errors.class_id && touched.class_id}
                                    errorMessage={errors.class_id}
                                    className="!mb-3"
                                >
                                    <Field name="class_id">
                                        {({ field, form }: any) => (
                                            <Select
                                                placeholder={loadingClasses ? "Loading classes..." : "Select your class"}
                                                field={field}
                                                form={form}
                                                size="lg"
                                                options={classOptions}
                                                value={classOptions?.filter(
                                                    (option) =>
                                                        option.value === values.class_id
                                                )}
                                                onChange={(option) =>
                                                    form.setFieldValue(
                                                        field.name,
                                                        option?.value
                                                    )
                                                }
                                                isDisabled={loadingClasses}
                                            />
                                        )}
                                    </Field>
                                </FormItem>
                                <FormItem
                                    label="Email"
                                    invalid={errors.email && touched.email}
                                    errorMessage={errors.email}
                                    className="!mb-3"
                                >
                                    <Field
                                        type="email"
                                        autoComplete="off"
                                        name="email"
                                        placeholder="Email"
                                        component={Input}
                                    />
                                </FormItem>
                                <FormItem
                                    label="Password"
                                    invalid={
                                        errors.password && touched.password
                                    }
                                    errorMessage={errors.password}
                                    className="!mb-3"
                                >
                                    <Field
                                        autoComplete="off"
                                        name="password"
                                        placeholder="Password"
                                        component={PasswordInput}
                                    />
                                </FormItem>
                                <FormItem
                                    label="Confirm Password"
                                    invalid={
                                        errors.confirmPassword &&
                                        touched.confirmPassword
                                    }
                                    errorMessage={errors.confirmPassword}
                                    className="!mb-3"
                                >
                                    <Field
                                        autoComplete="off"
                                        name="confirmPassword"
                                        placeholder="Confirm Password"
                                        component={PasswordInput}
                                    />
                                </FormItem>
                            </div>
                            <Button
                                block
                                loading={isSubmitting}
                                className='!bg-[var(--thm-primary)] hover:opacity-80'
                                variant="solid"
                                type="submit"
                            >
                                {isSubmitting
                                    ? 'Creating Account...'
                                    : 'Sign Up'}
                            </Button>
                            <div className="mt-4 text-center">
                                <span>Already have an account? </span>
                                <ActionLink to={signInUrl}>Sign in</ActionLink>
                            </div>
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default SignUpForm
