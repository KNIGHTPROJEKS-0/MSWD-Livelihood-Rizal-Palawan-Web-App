import {
  Box, Button, Card, CardBody, FormControl, FormLabel,
  Grid, GridItem, Heading, Input, Text, VStack, HStack,
  Avatar, useToast, Select, Divider, Badge, Icon, Skeleton
} from '@chakra-ui/react'
import { useState } from 'react'
import { MdEdit, MdSave, MdClose, MdPhone, MdLocationOn, MdEmail, MdPerson } from 'react-icons/md'
import { useAuthStore } from '../../store/authStore'
import { usersApi } from '../../services/api'

const BARANGAYS = [
  'Bunog', 'Iraan', 'Punta Baja', 'Campung-Ulay', 'Ransang',
  'Culasian', 'Candawaga', 'Panalingaan', 'Taburi', 'Canipaan', 'Latud',
]

const ROLE_COLOR = { superadmin: 'red', admin: 'blue', beneficiary: 'green' } as const
const ROLE_LABEL = { superadmin: 'Superadmin', admin: 'Admin', beneficiary: 'Beneficiary' } as const

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const toast = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    barangay: user?.barangay || '',
    phone: (user as any)?.phone || '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      await usersApi.update(user.id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        barangay: formData.barangay,
        phone: formData.phone,
      })
      updateUser({
        first_name: formData.first_name,
        last_name: formData.last_name,
        barangay: formData.barangay,
      })
      toast({
        title: 'Profile updated',
        description: 'Your profile has been saved.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      setIsEditing(false)
    } catch (err: any) {
      toast({
        title: 'Failed to save',
        description: err.response?.data?.detail || 'Please try again.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      barangay: user?.barangay || '',
      phone: (user as any)?.phone || '',
    })
    setIsEditing(false)
  }

  const fullName = user?.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user?.email || ''
  const role = user?.role ?? 'beneficiary'

  return (
    <Box>
      <VStack align="start" spacing={1} mb={6}>
        <Heading size="lg" color="gray.800">My Profile</Heading>
        <Text color="gray.500" fontSize="sm">Manage your personal information and account details.</Text>
      </VStack>

      <Grid templateColumns={{ base: '1fr', lg: '280px 1fr' }} gap={6}>

        {/* Left: Profile Summary */}
        <GridItem>
          <Card borderRadius="2xl" boxShadow="sm" overflow="hidden">
            <Box h="4px" bgGradient={
              role === 'superadmin' ? 'linear(to-r, red.400, red.600)' :
              role === 'admin' ? 'linear(to-r, blue.400, blue.600)' :
              'linear(to-r, green.400, green.600)'
            } />
            <CardBody>
              <VStack spacing={4}>
                <Avatar
                  size="xl"
                  name={fullName}
                  bg={
                    role === 'superadmin' ? 'red.500' :
                    role === 'admin' ? 'blue.500' : 'green.500'
                  }
                  color="white"
                  fontWeight={700}
                />
                <VStack spacing={1} textAlign="center">
                  <Heading size="md" color="gray.800">{fullName}</Heading>
                  <Text color="gray.500" fontSize="sm">{user?.email}</Text>
                  <Badge
                    colorScheme={ROLE_COLOR[role as keyof typeof ROLE_COLOR]}
                    borderRadius="full" px={3} py={1} fontSize="xs"
                  >
                    {ROLE_LABEL[role as keyof typeof ROLE_LABEL]}
                  </Badge>
                </VStack>

                <Divider />

                <VStack align="stretch" spacing={3} w="full">
                  <HStack justify="space-between">
                    <HStack spacing={2} color="gray.500">
                      <Icon as={MdLocationOn} boxSize={4} />
                      <Text fontSize="sm">Barangay</Text>
                    </HStack>
                    <Text fontSize="sm" fontWeight={600} color="gray.700">
                      {user?.barangay || '—'}
                    </Text>
                  </HStack>

                  <HStack justify="space-between">
                    <HStack spacing={2} color="gray.500">
                      <Icon as={MdPerson} boxSize={4} />
                      <Text fontSize="sm">Account</Text>
                    </HStack>
                    <Badge colorScheme={user?.is_active ? 'green' : 'red'} fontSize="xs" borderRadius="full">
                      {user?.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </HStack>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>

        {/* Right: Edit Form */}
        <GridItem>
          <Card borderRadius="2xl" boxShadow="sm">
            <CardBody>
              <HStack justify="space-between" mb={6}>
                <Heading size="md" color="gray.800">Personal Information</Heading>
                {!isEditing ? (
                  <Button
                    size="sm" colorScheme="blue" variant="outline"
                    borderRadius="lg" leftIcon={<MdEdit />}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <HStack>
                    <Button
                      size="sm" variant="ghost" borderRadius="lg"
                      leftIcon={<MdClose />} onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm" colorScheme="blue" borderRadius="lg"
                      leftIcon={<MdSave />}
                      isLoading={saving} loadingText="Saving…"
                      onClick={handleSave}
                    >
                      Save Changes
                    </Button>
                  </HStack>
                )}
              </HStack>

              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                <FormControl>
                  <FormLabel fontSize="sm" color="gray.600" fontWeight={600}>First Name</FormLabel>
                  <Input
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    isReadOnly={!isEditing}
                    bg={!isEditing ? 'gray.50' : 'white'}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" color="gray.600" fontWeight={600}>Last Name</FormLabel>
                  <Input
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    isReadOnly={!isEditing}
                    bg={!isEditing ? 'gray.50' : 'white'}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" color="gray.600" fontWeight={600}>
                    <HStack spacing={1}>
                      <Icon as={MdEmail} boxSize={3.5} />
                      <Text>Email Address</Text>
                    </HStack>
                  </FormLabel>
                  <Input
                    value={user?.email || ''}
                    isReadOnly
                    bg="gray.50"
                    borderRadius="lg"
                    color="gray.500"
                  />
                  {isEditing && (
                    <Text fontSize="xs" color="gray.400" mt={1}>
                      Email cannot be changed. Contact an administrator.
                    </Text>
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" color="gray.600" fontWeight={600}>
                    <HStack spacing={1}>
                      <Icon as={MdPhone} boxSize={3.5} />
                      <Text>Phone Number</Text>
                    </HStack>
                  </FormLabel>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    isReadOnly={!isEditing}
                    bg={!isEditing ? 'gray.50' : 'white'}
                    borderRadius="lg"
                    placeholder="09XXXXXXXXX"
                    focusBorderColor="blue.400"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" color="gray.600" fontWeight={600}>
                    <HStack spacing={1}>
                      <Icon as={MdLocationOn} boxSize={3.5} />
                      <Text>Barangay</Text>
                    </HStack>
                  </FormLabel>
                  <Select
                    name="barangay"
                    value={formData.barangay}
                    onChange={handleChange}
                    isDisabled={!isEditing}
                    bg={!isEditing ? 'gray.50' : 'white'}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  >
                    <option value="">Select Barangay</option>
                    {BARANGAYS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {!isEditing && (
                <Box mt={6} p={4} bg="blue.50" borderRadius="xl" border="1px solid" borderColor="blue.100">
                  <Text fontSize="sm" color="blue.700" fontWeight={500}>
                    💡 Click <b>Edit Profile</b> to update your name, phone number, or barangay.
                  </Text>
                </Box>
              )}
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  )
}
