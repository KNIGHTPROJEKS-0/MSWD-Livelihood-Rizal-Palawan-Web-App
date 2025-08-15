import {
  Box,
  Flex,
  Avatar,
  HStack,
  Text,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorModeValue,
} from '@chakra-ui/react'
import { FiBell, FiChevronDown } from 'react-icons/fi'
import { useAuthStore } from '../../store/authStore'

const Navbar = () => {
  const { user, logout } = useAuthStore()
  const bg = useColorModeValue('white', 'gray.900')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Box
      bg={bg}
      borderBottom={1}
      borderStyle={'solid'}
      borderColor={borderColor}
      px={4}
      py={3}
    >
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        <Text fontSize="xl" fontWeight="bold" color="primary.600">
          MSWD Livelihood Program
        </Text>

        <Flex alignItems={'center'}>
          <HStack spacing={4}>
            <IconButton
              size={'md'}
              icon={<FiBell />}
              aria-label={'Notifications'}
              variant={'ghost'}
            />
            
            <Menu>
              <MenuButton
                as={Button}
                rounded={'full'}
                variant={'link'}
                cursor={'pointer'}
                minW={0}
              >
                <HStack>
                  <Avatar
                    size={'sm'}
                    name={user?.name}
                  />
                  <Text fontSize="sm">{user?.name}</Text>
                  <Box display={{ base: 'none', md: 'flex' }}>
                    <FiChevronDown />
                  </Box>
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem>Profile</MenuItem>
                <MenuItem>Settings</MenuItem>
                <MenuDivider />
                <MenuItem onClick={logout}>Sign out</MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
      </Flex>
    </Box>
  )
}

export default Navbar