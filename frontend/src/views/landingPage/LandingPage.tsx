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
import SplashCursor from '@/components/animation/SplashAnimation'

const LandingPage = () => {

  return (
    <>
    
    <div className='overflow-hidden'>
    <SplashCursor/>
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


