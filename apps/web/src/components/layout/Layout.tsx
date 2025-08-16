import React from 'react'
import { Box, Flex } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

interface LayoutProps {
  children?: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Flex minH= "100vh" >
    <Sidebar />
    < Box flex = "1" >
      <Navbar />
      < Box p = { 6} >
        { children ?? <Outlet />}
        < /Box>
        < /Box>
        < /Flex>
  )
}

export default Layout