import { useMemo } from 'react';
import Dropdown from '@/components/ui/Dropdown';
import Avatar from '@/components/ui/Avatar';
import classNames from 'classnames';
import Spinner from '@/components/ui/Spinner';
import type { CommonProps } from '@/@types/common';
import { FaAngleDown } from 'react-icons/fa';

interface LanguageSelectorProps extends CommonProps {
    onLanguageChange: (langValue: string) => void;
    selectedLang: string; // Add selectedLang prop
}

const LanguageSelector = ({ className, onLanguageChange, selectedLang }: LanguageSelectorProps) => {
    const languageList = [
        { label: 'English', value: 'en', flag: 'us' },
        { label: 'Chinese', value: 'zhCn', flag: 'cn' },
        { label: 'Espanol', value: 'es', flag: 'sp' },
        { label: 'Arabic', value: 'ar', flag: 'ar' },
    ];

    const selectLangFlag = useMemo(() => {
        const selected = languageList.find((lang) => lang.value === selectedLang);
        return selected ? selected.flag : 'us'; // Default to US flag if not found
    }, [selectedLang]);

    const selectedLanguage = (
        <div className={classNames(className, 'flex items-center')}>
            <div className="flex items-center gap-2">
                <Avatar
                    size={33}
                    shape="circle"
                    src={`/img/countries/${selectLangFlag}.png`}
                />
                <h5>{languageList.find((lang) => lang.value === selectedLang)?.label || 'English'}</h5>
                <i><FaAngleDown /></i>
            </div>
        </div>
    );

    return (
        <Dropdown renderTitle={selectedLanguage} placement="bottom-start" menuStyle={{ minWidth: 240, marginTop: "15px", borderRadius: "0px" }}>
            {languageList.map((lang) => (
                <Dropdown.Item
                    key={lang.label}
                    className="mb-1 justify-between"
                    eventKey={lang.label}
                    onClick={() => onLanguageChange(lang.value)}
                >
                    <span className="flex items-center w-full">
                        <Avatar
                            size={20}
                            shape="circle"
                            src={`/img/countries/${lang.flag}.png`}
                        />
                        <p className="ltr:ml-2 rtl:mr-2 text-[17px] w-full">{lang.label}</p>
                    </span>
                </Dropdown.Item>
            ))}
        </Dropdown>
    );
};

export default LanguageSelector;