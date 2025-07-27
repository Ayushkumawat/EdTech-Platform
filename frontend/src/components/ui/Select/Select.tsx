import { forwardRef, Ref } from 'react'
import classNames from 'classnames'
import ReactSelect from 'react-select'
import CreatableSelect from 'react-select/creatable'
import AsyncSelect from 'react-select/async'
import isEmpty from 'lodash/isEmpty'
import get from 'lodash/get'
import { useConfig } from '../ConfigProvider'
import { useForm } from '../Form/context'
import { useInputGroup } from '../InputGroup/context'
import { HiCheck, HiChevronDown, HiX } from 'react-icons/hi'
import Spinner from '../Spinner/Spinner'
import { CONTROL_SIZES } from '../utils/constants'
import type { CommonProps, TypeAttributes } from '../@types/common'
import type {
    ControlProps,
    Props as ReactSelectProps,
    GroupBase,
} from 'react-select'
import type { AsyncProps } from 'react-select/async'
import type { CreatableProps } from 'react-select/creatable'
import type { ForwardedRef } from 'react'

interface DefaultOptionProps {
    innerProps: JSX.IntrinsicElements['div']
    label: string
    selectProps: { themeColor?: string }
    isSelected: boolean
    isDisabled: boolean
    isFocused: boolean
}

const DefaultOption = ({
    innerProps,
    label,
    selectProps,
    isSelected,
    isDisabled,
    isFocused,
}: DefaultOptionProps) => {
    const { themeColor } = selectProps
    return (
        <div
            className={classNames(
                'select-option',
                isSelected && 'selected',
                isDisabled && 'disabled',
                isFocused && 'focused'
            )}
            {...innerProps}
        >
            <span className="ml-2">{label}</span>
            {isSelected && (
                <HiCheck
                    className={`text-${themeColor} dark:text-white text-xl`}
                />
            )}
        </div>
    )
}

const DefaultDropdownIndicator = () => {
    return (
        <div className="select-dropdown-indicator">
            <HiChevronDown />
        </div>
    )
}

interface DefaultClearIndicatorProps {
    innerProps: JSX.IntrinsicElements['div']
    ref: Ref<HTMLElement>
}

const DefaultClearIndicator = ({
    innerProps: { ref, ...restInnerProps },
}: DefaultClearIndicatorProps) => {
    return (
        <div {...restInnerProps} ref={ref}>
            <div className="select-clear-indicator">
                <HiX />
            </div>
        </div>
    )
}

interface DefaultLoadingIndicatorProps {
    selectProps: { themeColor?: string }
}

const DefaultLoadingIndicator = ({
    selectProps,
}: DefaultLoadingIndicatorProps) => {
    const { themeColor } = selectProps
    return (
        <Spinner className={`select-loading-indicatior text-${themeColor}`} />
    )
}

export interface SelectProps<
    Option,
    IsMulti extends boolean = false,
    Group extends GroupBase<Option> = GroupBase<Option>
> extends CommonProps,
        ReactSelectProps<Option, IsMulti, Group>,
        AsyncProps<Option, IsMulti, Group>,
        CreatableProps<Option, IsMulti, Group> {
    size?: TypeAttributes.ControlSize
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    field?: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form?: any
    componentAs?: ReactSelect | CreatableSelect | AsyncSelect
}

function _Select<
    Option,
    IsMulti extends boolean = false,
    Group extends GroupBase<Option> = GroupBase<Option>
>(props: SelectProps<Option, IsMulti, Group>, ref: ForwardedRef<ReactSelect | CreatableSelect | AsyncSelect>) {
    const {
        size,
        style,
        className,
        form,
        field,
        components,
        componentAs: Component = ReactSelect,
        ...rest
    } = props

    const { themeColor, controlSize, primaryColorLevel, mode } = useConfig()
    const formControlSize = useForm()?.size
    const inputGroupSize = useInputGroup()?.size

    const selectSize = size || inputGroupSize || formControlSize || controlSize

    // Replace twColor and twHeight with equivalent colors and heights
    const twColor = {
        red: { 500: '#EF4444' },
        gray: { 600: '#4B5563', 300: '#D1D5DB', 700: '#374151' },
        blue: { 50: '#EFF6FF', 100: 'transparent' },
        // Add other colors as necessary
    }
    const twHeight = {
        sm: '32px',
        md: '40px',
        lg: '48px',
        // Add other sizes as necessary
    }

    let isInvalid = false

    if (!isEmpty(form)) {
        const { touched, errors } = form

        const touchedField = get(touched, field.name)
        const errorField = get(errors, field.name)

        isInvalid = touchedField && errorField
    }

    const getBoxShadow = (state: ControlProps<Option, IsMulti, Group>) => {
        const shadaowBase = '0 0 0 1px '

        if (isInvalid) {
            return shadaowBase + twColor.red['500']
        }

        if (state.isFocused) {
            // Fix the TypeScript error by using a safe access pattern
            const colorLevel = primaryColorLevel || '500'
            const themeColors = twColor[themeColor as keyof typeof twColor]
            if (themeColors && themeColors[colorLevel as keyof typeof themeColors]) {
                return shadaowBase + themeColors[colorLevel as keyof typeof themeColors]
            }
            return shadaowBase// fallback
        }

        return 'none'
    }

    const selectClass = classNames('select', `select-${selectSize}`, className)

    return (
        <Component<Option, IsMulti, Group>
            ref={ref}
            className={selectClass}
            classNamePrefix={'select'}
            styles={{
                control: (provided, state) => {
                    // Map CONTROL_SIZES numbers to height values
                    const sizeToHeightMap: Record<number, string> = {
                        7: twHeight.sm,  // XS
                        9: twHeight.sm,  // SM
                        11: twHeight.md, // MD
                        14: twHeight.lg, // LG
                    }
                    const controlSize = CONTROL_SIZES[selectSize]
                    const height = sizeToHeightMap[controlSize] || twHeight.md
                    
                    return {
                        ...provided,
                        height: height,
                        minHeight: height,
                        '&:hover': {
                            boxShadow: getBoxShadow(state),
                            cursor: 'pointer',
                        },
                        
                        boxShadow: getBoxShadow(state),
                        borderRadius: '8px',
                        backgroundColor: `${mode === 'dark' ? '#1f2937' : '#F3F4F6'} !important`, // gray-100 equivalent
                        border: 'none',
                        
                        ...(isInvalid
                            ? { borderColor: twColor.red['500'] }: {}),
                    }
                },
                input: (css) => {
                    return {
                        ...css,
                        input: {
                            outline: 'none',
                            outlineOffset: 0,
                            boxShadow: 'none !important',
                        },
                    }
                },
                placeholder: (provided) => ({
                    ...provided,
                    fontSize: '14px', // small size
                    fontWeight: '600',
                }),
                menu: (provided) => ({ 
                    ...provided, 
                    zIndex: 50, 
                    backgroundColor: mode === 'dark' ? '#1F2937' : '#FFFFFF', 
                    border: `1px solid ${mode === 'dark' ? '#374151' : '#E5E7EB'}`,
                    '&::-webkit-scrollbar': {
                        display: 'none'
                    },
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }),
                menuList: (provided) => ({
                    ...provided,
                    '&::-webkit-scrollbar': {
                        display: 'none'
                    },
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    overflow: 'auto'
                }),
                ...style,
            }}
            theme={(theme) => ({
                ...theme,
                colors: {
                    ...theme.colors,
                    neutral20:
                        mode === 'dark'
                            ? twColor.gray['600']
                            : twColor.gray['300'],
                    neutral30:
                        mode === 'dark'
                            ? twColor.gray['600']
                            : twColor.gray['300'],
                    neutral80: twColor.gray['700'],
                    neutral10:
                        mode === 'dark'
                            ? twColor.gray['600']
                            : twColor.gray['300'],
                    primary25: twColor.gray['600'],
                
                },
            })}
            themeColor={`${themeColor}-${primaryColorLevel}`}
            components={{
                IndicatorSeparator: () => null,
                Option: DefaultOption,
                LoadingIndicator: DefaultLoadingIndicator,
                DropdownIndicator: DefaultDropdownIndicator,
                ClearIndicator: DefaultClearIndicator,
                ...components,
            }}
            {...field}
            {...rest}
        />
    )
}

const Select = forwardRef(_Select) as <
    Option,
    IsMulti extends boolean = false,
    Group extends GroupBase<Option> = GroupBase<Option>
>(props: SelectProps<Option, IsMulti, Group> & { ref?: ForwardedRef<ReactSelect | CreatableSelect | AsyncSelect> }) => ReturnType<typeof _Select>

export default Select
