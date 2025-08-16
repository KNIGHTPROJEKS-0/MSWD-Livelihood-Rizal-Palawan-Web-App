import {
  Box,
  Flex,
  Icon,
  useColorModeValue,
  Text,
  VStack,
} from '@chakra-ui/react'
import { FiHome, FiUsers, FiUser } from 'react-icons/fi'
import { NavLink } from 'react-router-dom'


interface LinkItemProps {
  name: string
  icon: any
  href: string
}

const LinkItems: Array<LinkItemProps> = [
  { name: 'Dashboard', icon: FiHome, href: '/dashboard' },
  { name: 'Programs', icon: FiUsers, href: '/programs' },
  { name: 'Profile', icon: FiUser, href: '/profile' },
]

const Sidebar = () => {
  const bg = useColorModeValue('white', 'gray.900')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Box
      bg={bg}
      borderRight="1px"
      borderRightColor={borderColor}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
          MSWD
        </Text>
      </Flex>
      <VStack align="stretch" spacing={1} px={4}>
        {LinkItems.map((link) => (
          <NavItem key={link.name} icon={link.icon} href={link.href}>
            {link.name}
          </NavItem>
        ))}
      </VStack>
    </Box>
  )
}

interface NavItemProps {
  icon: any
  href: string
  children: string
}

const NavItem = ({ icon, href, children, ...rest }: NavItemProps) => {
  return (
    <NavLink to={href}>
      {({ isActive }: { isActive: boolean }) => (
        <Flex
          align="center"
          p="4"
          mx="4"
          borderRadius="lg"
          role="group"
          cursor="pointer"
          bg={isActive ? 'primary.400' : 'transparent'}
          color={isActive ? 'white' : 'inherit'}
          _hover={{
            bg: 'primary.400',
            color: 'white',
          }}
          {...rest}
        >
          {icon && (
            <Icon
              mr="4"
              fontSize="16"
              _groupHover={{
                color: 'white',
              }}
              as={icon}
            />
          )}
          {children}
        </Flex>
      )}
    </NavLink>
  )
}

export default Sidebar