import SpaceOrganizationSlider1 from './OrganizationSlider'
import CurvedLoop from '../BannerAnimation';

export default function Organization() {
    return (
        <>
            {/* Start Brand One*/}
            <div className="brand-one">
                <div className="brand-one-inner flex w-full items-center max-w-[1300px] h-20">
                <CurvedLoop 
                marqueeText="      Xafran      "
                speed={2}
                curveAmount={0}
                direction="left"
                interactive={false}
               
                />
                </div>
            </div>
            {/* End Brand One*/}
        </>
    )
}



