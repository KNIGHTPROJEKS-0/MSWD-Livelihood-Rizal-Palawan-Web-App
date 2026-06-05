import {
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Input,
  Text,
  VStack,
  HStack,
  Avatar,
  useToast,
  Select,
  Divider,
  Badge,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'

const BARANGAYS = [
  'Bunog', 'Campong Ulay', 'Candawaga', 'Canipaan', 'Culasian',
  'Iraan', 'Latud', 'Panalingaan', 'Punta Baja', 'Ransang', 'Taburi',
]

const ROLE_COLOR = { superadmin: 'red', admin: 'blue', beneficiary: 'green' } as const
const ROLE_LABEL = { superadmin: 'Superadmin', admin: 'Admin', beneficiary: 'Beneficiary' } as const

const ProfilePage = () => {
  const { user, updateUser } = useAuthStore()
  const toast = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    barangay: user?.barangay || '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSave = () => {
    updateUser({
      first_name: formData.first_name,
      last_name: formData.last_name,
      barangay: formData.barangay,
    })
    toast({
      title: 'Profile updated',
      description: 'Your profile has been successfully updated.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      barangay: user?.barangay || '',
    })
    setIsEditing(false)
  }

  const fullName = user?.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user?.email || ''

  const role = user?.role ?? 'beneficiary'

  return (
    <Box>
      <VStack align="start" spacing={1} mb={8}>
        <Heading size="lg">Profile Settings</Heading>
        <Text color="gray.500">Manage your account information and preferences.</Text>
      </VStack>

      <Grid templateColumns={{ base: '1fr', lg: '1fr 2fr' }} gap={6}>
        {/* Profile Summary Card */}
        <GridItem>
          <Card borderRadius="xl" boxShadow="sm">
            <CardBody>
              <VStack spacing={4}>
                <Avatar size="xl" name={fullName} bg="blue.500" color="white" />
                <VStack spacing={1} textAlign="center">
                  <Heading size="md">{fullName}</Heading>
                  <Text color="gray.500" fontSize="sm">{user?.email}</Text>
                  <Badge
                    colorScheme={ROLE_COLOR[role as keyof typeof ROLE_COLOR]}
                    borderRadius="full"
                    px={3}
                    py={1}
                    fontSize="xs"
                  >
                    {ROLE_LABEL[role as keyof typeof ROLE_LABEL]}
                  </Badge>
                </VStack>

                <Divider />

                <VStack align="start" spacing={3} w="full">
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color="gray.500">Barangay</Text>
                    <Text fontSize="sm" fontWeight={600}>{user?.barangay || '—'}</Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color="gray.500">Status</Text>
                    <Badge colorScheme={user?.is_active ? 'green' : 'red'} fontSize="xs">
                      {user?.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </HStack>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>

        {/* Edit Form Card */}
        <GridItem>
          <Card borderRadius="xl" boxShadow="sm">
            <CardBody>
              <VStack align="start" spacing={6}>
                <HStack justify="space-between" w="full">
                  <Heading size="md">Personal Information</Heading>
                  {!isEditing ? (
                    <Button size="sm" colorScheme="blue" variant="outline" borderRadius="lg" onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  ) : (
                    <HStack>
                      <Button size="sm" variant="ghost" borderRadius="lg" onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button size="sm" colorScheme="blue" borderRadius="lg" onClick={handleSave}>
                        Save Changes
                      </Button>
                    </HStack>
                  )}
                </HStack>

                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4} w="full">
                  <FormControl>
                    <FormLabel fontSize="sm" color="gray.600">First Name</FormLabel>
                    <Input
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      isReadOnly={!isEditing}
                      bg={!isEditing ? 'gray.50' : 'white'}
                      borderRadius="lg"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" color="gray.600">Last Name</FormLabel>
                    <Input
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      isReadOnly={!isEditing}
                      bg={!isEditing ? 'gray.50' : 'white'}
                      borderRadius="lg"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" color="gray.600">Email Address</FormLabel>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      isReadOnly
                      bg="gray.50"
                      borderRadius="lg"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" color="gray.600">Barangay</FormLabel>
                    <Select
                      name="barangay"
                      value={formData.barangay}
                      onChange={handleChange}
                      isDisabled={!isEditing}
                      bg={!isEditing ? 'gray.50' : 'white'}
                      borderRadius="lg"
                    >
                      <option value="">Select Barangay</option>
                      {BARANGAYS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {isEditing && (
                  <Text fontSize="xs" color="gray.400">
                    Email address cannot be changed. Contact an administrator for email updates.
                  </Text>
                )}
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  )
}

export default ProfilePage
