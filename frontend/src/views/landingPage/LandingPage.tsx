import React from 'react'
import Home from './components/Home'
import Feature from './components/Feature'
import About from './components/About'
import Banner from './components/Banner'
import TeacherAbout from './components/TeacherAbout'
import Books from './components/Books'
import Team from './components/Team'
import Features from './components/Features'
import SpaceOrganizationSlider1 from './components/OrganizationSlider'
import Organization from './components/OrginazationContainer'
import Faq from './components/Faq'
import News from './components/News'
import Ribbons from './Ribbons'

const LandingPage = () => {

  return (
    <>
    <div style={{ position: 'relative' }}>
      <Ribbons
        baseThickness={20}
        colors={['#e90b35']}
        speedMultiplier={0.45}
        maxAge={550}
        enableFade={true}
        enableShaderEffect={false}
        // @ts-ignore
        style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 1000}}
      />
      <Banner/>
      <Feature/>
      <About/>
      <Books/>
      <Organization/>
      <TeacherAbout/>
      <Features/>
      <Team/>
      <Faq/>
    </div>
    </>
  )
}

export default LandingPage


