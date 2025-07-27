import Input from '@/components/ui/Input'
import Avatar from '@/components/ui/Avatar'
import Upload from '@/components/ui/Upload'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Switcher from '@/components/ui/Switcher'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { FormContainer } from '@/components/ui/Form'
import FormDesription from './FormDesription'
import FormRow from './FormRow'
import { Field, Form, Formik } from 'formik'
import { components } from 'react-select'
import {
    HiOutlineUserCircle,
    HiOutlineMail,
    HiOutlineBriefcase,
    HiOutlineUser,
    HiCheck,
    HiOutlineGlobeAlt,
} from 'react-icons/hi'
import * as Yup from 'yup'
import type { OptionProps, ControlProps } from 'react-select'
import type { FormikProps, FieldInputProps, FieldProps } from 'formik'
import { useEffect, useState } from 'react'
import { useAppSelector, useAppDispatch } from '@/store'
import { setUser } from '@/store/slices/auth/userSlice'
import { apiGetClasses } from '@/services/ClassService'
import { apiUpdateUser, UpdateUserRequest, UpdateUserResponse } from '@/services/UserService'

export type ProfileFormModel = {
    name: string
    email: string
    class_id: string
    avatar: string
    timeZone: string
    lang: string
    syncData: boolean
}

type ProfileProps = {
    data?: ProfileFormModel
}

type LanguageOption = {
    value: string
    label: string
    imgPath: string
}

const { Control } = components

const validationSchema = Yup.object().shape({
    name: Yup.string()
        .required('Name Required')
        .test('two-words', 'Please enter both first name and last name (exactly 2 words)', (value) => {
            if (!value) return false;
            const words = value.trim().split(/\s+/);
            return words.length === 2 && words.every(word => word.length > 0);
        })
        .min(3, 'Name too short!')
        .max(50, 'Name too long!'),
    email: Yup.string().email('Invalid email').required('Email Required'),
    class_id: Yup.string().required('Class Required'),
    avatar: Yup.string(),
    lang: Yup.string(),
    timeZone: Yup.string(),
    syncData: Yup.bool(),
})

const langOptions: LanguageOption[] = [
    { value: 'en', label: 'English (US)', imgPath: '/img/countries/us.png' },
    { value: 'ch', label: '中文', imgPath: '/img/countries/cn.png' },
    { value: 'jp', label: '日本语', imgPath: '/img/countries/jp.png' },
    { value: 'fr', label: 'French', imgPath: '/img/countries/fr.png' },
]

const CustomSelectOption = ({
    innerProps,
    label,
    data,
    isSelected,
}: OptionProps<LanguageOption>) => {
    return (
        <div
            className={`flex items-center justify-between p-2 ${
                isSelected
                    ? 'bg-gray-100 dark:bg-gray-500'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
            {...innerProps}
        >
            <div className="flex items-center">
                <Avatar shape="circle" size={20} src={data.imgPath} />
                <span className="ml-2 rtl:mr-2">{label}</span>
            </div>
            {isSelected && <HiCheck className="text-emerald-500 text-xl" />}
        </div>
    )
}

const CustomControl = ({
    children,
    ...props
}: ControlProps<LanguageOption>) => {
    const selected = props.getValue()[0]
    return (
        <Control {...props}>
            {selected && (
                <Avatar
                    className="ltr:ml-4 rtl:mr-4"
                    shape="circle"
                    size={18}
                    src={selected.imgPath}
                />
            )}
            {children}
        </Control>
    )
}

const Profile = ({
    data = {
        name: '',
        email: '',
        class_id: '',
        avatar: '',
        timeZone: '',
        lang: '',
        syncData: false,
    },
}: ProfileProps) => {
    const user_class_id = useAppSelector((state) => state.auth.user.class_id)
    const user_email = useAppSelector((state) => state.auth.user.email)
    const user_first_name = useAppSelector((state) => state.auth.user.first_name)
    const user_last_name = useAppSelector((state) => state.auth.user.last_name)
    const dispatch = useAppDispatch()
    const [classOptions, setClassOptions] = useState<{ label: string; value: string }[]>([])
    const [loadingClasses, setLoadingClasses] = useState(false)
    const [hasNameBeenTouched, setHasNameBeenTouched] = useState(false)
    const [hasClassBeenTouched, setHasClassBeenTouched] = useState(false)
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)

    useEffect(() => {
        const fetchClasses = async () => {
            setLoadingClasses(true)
            try {
                const response = await apiGetClasses<any>()
                const options = (response.data || []).map((item: any) => ({
                    label: item.name,
                    value: item.uid,
                }))
                setClassOptions(options)
            } catch (error) {
                // handle error if needed
            } finally {
                setLoadingClasses(false)
            }
        }
        fetchClasses()
    }, [])

    const onSetFormFile = (
        form: FormikProps<ProfileFormModel>,
        field: FieldInputProps<ProfileFormModel>,
        file: File[]
    ) => {
        form.setFieldValue(field.name, URL.createObjectURL(file[0]))
    }

    const onFormSubmit = async (
        values: ProfileFormModel,
        setSubmitting: (isSubmitting: boolean) => void
    ) => {
        try {
            setIsUpdatingProfile(true);
            
            // Split name into first and last name
            const nameParts = values.name.trim().split(/\s+/);
            const firstName = nameParts[0] || '';
            const lastName = nameParts[1] || '';
            
            const updateData: UpdateUserRequest = {
                first_name: firstName,
                last_name: lastName,
                class_id: values.class_id,
            };
            
            console.log('Updating user with data:', updateData);
            
            // Call the API
            const response = await apiUpdateUser<UpdateUserResponse>(updateData);
            
            console.log('Update response:', response);
            
            // Update Redux store with new user data
            dispatch(setUser({
                first_name: firstName,
                last_name: lastName,
                email: user_email || '',
                class_id: values.class_id,
                avatar: values.avatar || '',
                authority: [],
                loading: false
            }));
            
            toast.push(
                <Notification 
                    title="Profile updated successfully!" 
                    type="success" 
                />, 
                {
                    placement: 'top-end',
                }
            );
            
            // Reset touched states after successful update so new values become defaults
            setHasNameBeenTouched(false);
            setHasClassBeenTouched(false);
            
        } catch (error: any) {
            console.error('Error updating profile:', error);
            
            // Extract error message from response if available
            const errorMessage = error?.response?.data?.message || 
                               error?.message || 
                               'Failed to update profile. Please try again.';
            
            toast.push(
                <Notification 
                    title="Update Failed" 
                    type="danger" 
                >
                    {errorMessage}
                </Notification>, 
                {
                    placement: 'top-end',
                }
            );
        } finally {
            setIsUpdatingProfile(false);
            setSubmitting(false);
        }
    }

    return (
        <Formik
            key={`${user_class_id}-${user_first_name}-${user_last_name}`}
            enableReinitialize
            initialValues={{
                ...data,
                name: data.name || 
                      (user_first_name && user_last_name 
                       ? `${user_first_name} ${user_last_name}` 
                       : user_first_name || user_last_name || ''),
                class_id: (data.class_id ?? user_class_id ?? ''),
                email: (data.email ?? user_email ?? ''),
            }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting }) => {
                setSubmitting(true);
                await onFormSubmit(values, setSubmitting);
            }}
        >
            {({ values, touched, errors, isSubmitting, resetForm, setFieldValue }) => {
                const validatorProps = { touched, errors }
                
                // Set the default class value when options are loaded
                useEffect(() => {
                    if (classOptions.length > 0 && user_class_id && !hasClassBeenTouched) {
                        const matchingClass = classOptions.find(option => option.value === user_class_id)
                        if (matchingClass && (!values.class_id || values.class_id === '')) {
                            setFieldValue('class_id', user_class_id)
                        }
                    }
                }, [classOptions, user_class_id, setFieldValue, hasClassBeenTouched])

                // Additional effect to sync form with updated Redux state after profile update
                // Only sync if user hasn't manually changed the class
                useEffect(() => {
                    if (!hasClassBeenTouched && classOptions.length > 0 && user_class_id && values.class_id !== user_class_id) {
                        const matchingClass = classOptions.find(option => option.value === user_class_id)
                        if (matchingClass) {
                            setFieldValue('class_id', user_class_id)
                        }
                    }
                }, [user_class_id, classOptions, values.class_id, setFieldValue, hasClassBeenTouched])

                // Set the default name and email values from user data
                useEffect(() => {
                    // Only set name automatically if user hasn't touched the field yet
                    if (!hasNameBeenTouched && !values.name && (user_first_name || user_last_name)) {
                        let fullName = '';
                        if (user_first_name && user_last_name) {
                            fullName = `${user_first_name} ${user_last_name}`;
                        } else if (user_first_name || user_last_name) {
                            // If only one name is available, still set it but user will need to add the other
                            fullName = user_first_name || user_last_name || '';
                        }
                        
                        if (fullName) {
                            setFieldValue('name', fullName);
                        }
                    }
                    if (!values.email && user_email) {
                        setFieldValue('email', user_email);
                    }
                }, [user_first_name, user_last_name, user_email, values.name, values.email, setFieldValue, hasNameBeenTouched])
                
                return (
                    <Form>
                        <FormContainer>
                            <FormDesription
                                title="General"
                                desc="Basic info, like your name and address that will displayed in public"
                            />
                            <FormRow
                                name="name"
                                label="Full Name"
                                {...validatorProps}
                            >
                                <Field name="name">
                                    {({ field, form }: FieldProps) => (
                                        <Input
                                            {...field}
                                            type="text"
                                            autoComplete="off"
                                            placeholder="Enter first name and last name (e.g., John Doe)"
                                            className="border-white dark:border-gray-800"
                                            prefix={<HiOutlineUserCircle className="text-xl" />}
                                            onChange={(e) => {
                                                setHasNameBeenTouched(true);
                                                form.setFieldValue('name', e.target.value);
                                            }}
                                            onBlur={(e) => {
                                                setHasNameBeenTouched(true);
                                                form.setFieldTouched('name', true);
                                            }}
                                        />
                                    )}
                                </Field>
                            </FormRow>
                            <FormRow
                                name="email"
                                label="Email"
                                {...validatorProps}
                            >
                                <Field
                                    type="email"
                                    autoComplete="off"
                                    name="email"
                                    placeholder="Email"
                                    component={Input}
                                    readOnly
                                    prefix={
                                        <HiOutlineMail className="text-xl" />
                                    }
                                />
                            </FormRow>
                            {/* Class Dropdown */}
                            <FormRow
                                name="class_id"
                                label="Class"
                                {...validatorProps}
                            >
                                <Field name="class_id">
                                    {({ field, form }: FieldProps) => {
                                        const selectedOption = classOptions.find(option => option.value === values.class_id);
                                        
                                        return (
                                            <Select
                                                field={field}
                                                form={form}
                                                options={classOptions}
                                                isLoading={loadingClasses}
                                                value={selectedOption || null}
                                                onChange={option => {
                                                    setHasClassBeenTouched(true);
                                                    form.setFieldValue('class_id', option?.value || '');
                                                }}
                                                placeholder={loadingClasses ? "Loading classes..." : "Select Class"}
                                                isDisabled={loadingClasses}
                                            />
                                        );
                                    }}
                                </Field>
                            </FormRow>
                            <FormDesription
                                className="mt-8"
                                title="Preferences"
                                desc="Your personalized preference displayed in your account"
                            />
                            <FormRow
                                name="lang"
                                label="Language"
                                {...validatorProps}
                            >
                                <Field name="lang">
                                    {({ field, form }: FieldProps) => (
                                        <Select<LanguageOption>
                                            field={field}
                                            form={form}
                                            options={langOptions}
                                            components={{
                                                Option: CustomSelectOption,
                                                Control: CustomControl,
                                            }}
                                            value={langOptions.filter(
                                                (option) =>
                                                    option.value ===
                                                    values?.lang
                                            )}
                                            onChange={(option) =>
                                                form.setFieldValue(
                                                    field.name,
                                                    option?.value
                                                )
                                            }
                                        />
                                    )}
                                </Field>
                            </FormRow>
                            <div className="mt-4 ltr:text-right">
                                <Button
                                    className="ltr:mr-2 rtl:ml-2"
                                    type="button"
                                    shape='none'
                                    disabled={isSubmitting || isUpdatingProfile}
                                    onClick={() => {
                                        resetForm();
                                        setHasNameBeenTouched(false);
                                        setHasClassBeenTouched(false);
                                    }}
                                >
                                    Reset
                                </Button>
                                <Button
                                    variant="solid"
                                    shape="none"
                                    loading={isSubmitting || isUpdatingProfile}
                                    className='!bg-[var(--thm-primary)] hover:opacity-80 '
                                    type="submit"
                                    disabled={isSubmitting || isUpdatingProfile}
                                >
                                    {(isSubmitting || isUpdatingProfile) ? 'Updating...' : 'Update'}
                                </Button>
                            </div>
                        </FormContainer>
                    </Form>
                )
            }}
        </Formik>
    )
}

export default Profile
