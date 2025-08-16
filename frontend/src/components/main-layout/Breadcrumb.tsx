import { Link } from 'react-router-dom';

interface BreadcrumbItem {
    label: string;
    path: string | null;
}

interface BreadcrumbProps {
    breadcrumbTitle: string | null;
    breadcrumbPath?: BreadcrumbItem[];
}

export default function Breadcrumb({ breadcrumbTitle, breadcrumbPath = [] }: BreadcrumbProps) {
    // Don't render anything if breadcrumbTitle is null
    if (!breadcrumbTitle) {
        return null;
    }
    
    return (
        <>
            {/*Start Page Header */}
            <section className="page-header">
                <div className="page-header__bg" style={{backgroundImage: 'url(/assets/img/slider/1.jpg)'}}>
                </div>

                <div className="container">
                    <div className="page-header__inner text-center">
                        <ul className="thm-breadcrumb">
                            {breadcrumbPath.length > 0 ? (
                                breadcrumbPath.map((item, index) => (
                                    <li key={index} className={index === breadcrumbPath.length - 1 ? 'active' : ''}>
                                        {item.path ? (
                                            <Link to={item.path}>{item.label}</Link>
                                        ) : (
                                            <span>{item.label}</span>
                                        )}
                                    </li>
                                ))
                            ) : (
                                <>
                                    <li><Link to="/">Home</Link></li>
                                    <li className="active">{breadcrumbTitle}</li>
                                </>
                            )}
                        </ul>
                        <h2>{breadcrumbTitle}</h2>
                    </div>
                </div>
            </section>
            {/*End Page Header */}

        </>
    )
}
