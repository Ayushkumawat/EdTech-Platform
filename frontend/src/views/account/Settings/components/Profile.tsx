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
import { useAppSelector } from '@/store'
import { apiGetClasses } from '@/services/ClassService'

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
        .min(3, 'Too Short!')
        .max(12, 'Too Long!')
        .required('User Name Required'),
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
    const [classOptions, setClassOptions] = useState<{ label: string; value: string }[]>([])
    const [loadingClasses, setLoadingClasses] = useState(false)

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

    const onFormSubmit = (
        values: ProfileFormModel,
        setSubmitting: (isSubmitting: boolean) => void
    ) => {
        console.log('values', values)
        toast.push(<Notification title={'Profile updated'} type="success" />, {
            placement: 'top-center',
        })
        setSubmitting(false)
    }

    return (
        <Formik
            enableReinitialize
            initialValues={{
                ...data,
                class_id: (data.class_id ?? user_class_id ?? ''),
                email: (data.email ?? user_email ?? ''),
            }}
            validationSchema={validationSchema}
            onSubmit={(values, { setSubmitting }) => {
                setSubmitting(true)
                setTimeout(() => {
                    onFormSubmit(values, setSubmitting)
                }, 1000)
            }}
        >
            {({ values, touched, errors, isSubmitting, resetForm, setFieldValue }) => {
                const validatorProps = { touched, errors }
                return (
                    <Form>
                        <FormContainer>
                            <FormDesription
                                title="General"
                                desc="Basic info, like your name and address that will displayed in public"
                            />
                            <FormRow
                                name="name"
                                label="Name"
                                {...validatorProps}
                            >
                                <Field
                                    type="text"
                                    autoComplete="off"
                                    name="name"
                                    placeholder="Name"
                                    component={Input}
                                    className="border-white dark:border-gray-800"
                                    prefix={
                                        <HiOutlineUserCircle className="text-xl" />
                                    }
                                />
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
                            <FormRow
                                name="avatar"
                                label="Avatar"
                                {...validatorProps}
                            >
                                <Field name="avatar">
                                    {({ field, form }: FieldProps) => {
                                        const avatarProps = field.value
                                            ? { src: field.value }
                                            : {}
                                        return (
                                            <Upload
                                                className="cursor-pointer"
                                                showList={false}
                                                uploadLimit={1}
                                                onChange={(files) =>
                                                    onSetFormFile(
                                                        form,
                                                        field,
                                                        files
                                                    )
                                                }
                                                onFileRemove={(files) =>
                                                    onSetFormFile(
                                                        form,
                                                        field,
                                                        files
                                                    )
                                                }
                                            >
                                                <Avatar
                                                    className="border-2 border-white dark:border-gray-800 shadow-lg"
                                                    size={60}
                                                    shape="circle"
                                                    icon={<HiOutlineUser />}
                                                    {...avatarProps}
                                                />
                                            </Upload>
                                        )
                                    }}
                                </Field>
                            </FormRow>
                            {/* Class Dropdown */}
                            <FormRow
                                name="class_id"
                                label="Class"
                                {...validatorProps}
                            >
                                <Field name="class_id">
                                    {({ field, form }: FieldProps) => (
                                        <Select
                                            field={field}
                                            form={form}
                                            options={classOptions}
                                            isLoading={loadingClasses}
                                            value={classOptions.find(option => option.value === values.class_id) || null}
                                            onChange={option => form.setFieldValue('class_id', option?.value)}
                                            placeholder="Select Class"
                                        />
                                    )}
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
                            <FormRow
                                name="timeZone"
                                label="Time Zone"
                                {...validatorProps}
                            >
                                <Field
                                    readOnly
                                    type="text"
                                    autoComplete="off"
                                    name="timeZone"
                                    placeholder="Time Zone"
                                    component={Input}
                                    prefix={
                                        <HiOutlineGlobeAlt className="text-xl" />
                                    }
                                />
                            </FormRow>
                            <FormRow
                                name="syncData"
                                label="Sync Data"
                                {...validatorProps}
                                border={false}
                            >
                                <Field name="syncData" component={Switcher} />
                            </FormRow>
                            <div className="mt-4 ltr:text-right">
                                <Button
                                    className="ltr:mr-2 rtl:ml-2"
                                    type="button"
                                    shape='none'
                                    
                                    onClick={() => resetForm()}
                                >
                                    Reset
                                </Button>
                                <Button
                                    variant="solid"
                                    shape="none"
                                    loading={isSubmitting}
                                    className='!bg-[var(--thm-primary)] hover:opacity-80 '
                                    type="submit"
                                >
                                    {isSubmitting ? 'Updating' : 'Update'}
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
