import { Box, Flex } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

const Layout = () => {
  return (
    <Flex minH="100vh">
      <Sidebar />
      <Box flex="1">
        <Navbar />
        <Box p={6}>
          <Outlet />
        </Box>
      </Box>
    </Flex>
  )
}

export default Layout