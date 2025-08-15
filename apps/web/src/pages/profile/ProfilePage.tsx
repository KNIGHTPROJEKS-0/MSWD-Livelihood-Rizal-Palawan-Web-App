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
} from '@chakra-ui/react'
import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'

const ProfilePage = () => {
  const { user, updateUser } = useAuthStore()
  const toast = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    barangay: user?.barangay || '',
    phone: '',
    address: '',
    occupation: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = () => {
    updateUser({
      name: formData.name,
      email: formData.email,
      barangay: formData.barangay
    })
    
    toast({
      title: 'Profile updated',
      description: 'Your profile has been successfully updated.',
      status: 'success',
      duration: 3000,
    })
    
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      barangay: user?.barangay || '',
      phone: '',
      address: '',
      occupation: ''
    })
    setIsEditing(false)
  }

  return (
    <Box>
      <VStack align="start" spacing={6} mb={8}>
        <Box>
          <Heading size="lg" mb={2}>
            Profile Settings
          </Heading>
          <Text color="gray.600">
            Manage your account information and preferences.
          </Text>
        </Box>
      </VStack>

      <Grid templateColumns={{ base: '1fr', lg: '1fr 2fr' }} gap={6}>
        {/* Profile Summary */}
        <GridItem>
          <Card>
            <CardBody>
              <VStack spacing={4}>
                <Avatar size="xl" name={user?.name} />
                <VStack spacing={1}>
                  <Heading size="md">{user?.name}</Heading>
                  <Text color="gray.600">{user?.email}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                  </Text>
                </VStack>
                
                <Divider />
                
                <VStack align="start" spacing={2} w="full">
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" fontWeight="semibold">Barangay:</Text>
                    <Text fontSize="sm">{user?.barangay || 'Not specified'}</Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" fontWeight="semibold">Member since:</Text>
                    <Text fontSize="sm">January 2024</Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" fontWeight="semibold">Programs joined:</Text>
                    <Text fontSize="sm">3</Text>
                  </HStack>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>

        {/* Profile Form */}
        <GridItem>
          <Card>
            <CardBody>
              <VStack align="start" spacing={6}>
                <HStack justify="space-between" w="full">
                  <Heading size="md">Personal Information</Heading>
                  {!isEditing ? (
                    <Button size="sm" onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  ) : (
                    <HStack>
                      <Button size="sm" variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button size="sm" colorScheme="primary" onClick={handleSave}>
                        Save Changes
                      </Button>
                    </HStack>
                  )}
                </HStack>

                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4} w="full">
                  <FormControl>
                    <FormLabel>Full Name</FormLabel>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      isReadOnly={!isEditing}
                      bg={!isEditing ? 'gray.50' : 'white'}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Email Address</FormLabel>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      isReadOnly={!isEditing}
                      bg={!isEditing ? 'gray.50' : 'white'}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Barangay</FormLabel>
                    <Select
                      name="barangay"
                      value={formData.barangay}
                      onChange={handleChange}
                      isDisabled={!isEditing}
                      bg={!isEditing ? 'gray.50' : 'white'}
                    >
                      <option value="">Select Barangay</option>
                      <option value="Barangay 1">Barangay 1</option>
                      <option value="Barangay 2">Barangay 2</option>
                      <option value="Barangay 3">Barangay 3</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Phone Number</FormLabel>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      isReadOnly={!isEditing}
                      bg={!isEditing ? 'gray.50' : 'white'}
                      placeholder="Enter phone number"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Occupation</FormLabel>
                    <Input
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleChange}
                      isReadOnly={!isEditing}
                      bg={!isEditing ? 'gray.50' : 'white'}
                      placeholder="Enter occupation"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Address</FormLabel>
                    <Input
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      isReadOnly={!isEditing}
                      bg={!isEditing ? 'gray.50' : 'white'}
                      placeholder="Enter complete address"
                    />
                  </FormControl>
                </Grid>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  )
}

export default ProfilePage