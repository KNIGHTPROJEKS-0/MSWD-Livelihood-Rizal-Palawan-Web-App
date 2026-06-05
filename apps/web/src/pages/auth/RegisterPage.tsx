import { useState } from 'react'
import {
  Box, Button, Card, CardBody, CardHeader, FormControl, FormLabel,
  Heading, Input, InputGroup, InputRightElement, VStack, Text,
  Link, useToast, Image, HStack, Divider, SimpleGrid, Select
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { MdArrowBack } from 'react-icons/md'
import { authApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

const BARANGAYS = [
  'Bunog','Campong Ulay','Candawaga','Canipaan','Culasian',
  'Iraan','Latud','Panalingaan','Punta Baja','Ransang','Taburi',
]

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    first_name: '', last_name: '', phone: '', barangay: ''
  })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast({ title: 'Passwords do not match', status: 'error', duration: 3000 })
      return
    }
    if (form.password.length < 6) {
      toast({ title: 'Password must be at least 6 characters', status: 'error', duration: 3000 })
      return
    }
    setLoading(true)
    try {
      await authApi.register({
        email: form.email, password: form.password,
        first_name: form.first_name, last_name: form.last_name,
        phone: form.phone || undefined, barangay: form.barangay || undefined,
      })
      const { data } = await authApi.login(form.email, form.password)
      setAuth(data.user, data.access_token)
      toast({
        title: 'Account created!',
        description: `Welcome, ${form.first_name}! You are now registered as a Beneficiary.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      navigate('/dashboard')
    } catch (err: any) {
      toast({
        title: 'Registration failed',
        description: err.response?.data?.detail || 'Please check your details and try again.',
        status: 'error', duration: 5000, isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgGradient="linear(to-br, #0f172a, #1e3a6e, #1a56a0)"
      py={8}
      px={4}
      position="relative"
    >
      {/* Decorative blobs */}
      <Box position="absolute" top="-100px" right="-100px" w="400px" h="400px"
        borderRadius="full" bg="blue.400" opacity={0.1} filter="blur(80px)" pointerEvents="none" />
      <Box position="absolute" bottom="-60px" left="-60px" w="300px" h="300px"
        borderRadius="full" bg="cyan.400" opacity={0.08} filter="blur(60px)" pointerEvents="none" />

      <Card maxW="lg" w="full" shadow="2xl" borderRadius="2xl" overflow="hidden" position="relative">
        {/* Top accent bar */}
        <Box h="4px" bgGradient="linear(to-r, blue.400, cyan.400)" />

        <CardHeader pb={2} pt={6}>
          {/* Back to Home */}
          <Link
            as={RouterLink}
            to="/"
            display="inline-flex"
            alignItems="center"
            gap={1}
            fontSize="sm"
            color="gray.500"
            _hover={{ color: 'blue.500', textDecoration: 'none' }}
            mb={4}
          >
            <Box as={MdArrowBack} display="inline" />
            Back to Home
          </Link>

          <VStack spacing={3}>
            <Image src="/MSWD-Livelihood-Roxas-LOGO.png" alt="MSWD Logo" boxSize="68px" objectFit="contain" />
            <VStack spacing={1}>
              <Heading size="lg" textAlign="center" color="gray.800">Create Account</Heading>
              <Text color="gray.500" textAlign="center" fontSize="sm">
                Register as a Beneficiary of MSWD Livelihood Programs
              </Text>
            </VStack>
          </VStack>
        </CardHeader>

        <Divider />

        <CardBody pt={5} pb={6}>
          <form onSubmit={handleRegister}>
            <VStack spacing={4}>
              <SimpleGrid columns={2} spacing={3} w="full">
                <FormControl isRequired>
                  <FormLabel fontSize="sm" color="gray.600">First Name</FormLabel>
                  <Input
                    value={form.first_name} onChange={set('first_name')}
                    placeholder="Juan" borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="sm" color="gray.600">Last Name</FormLabel>
                  <Input
                    value={form.last_name} onChange={set('last_name')}
                    placeholder="dela Cruz" borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl isRequired>
                <FormLabel fontSize="sm" color="gray.600">Email Address</FormLabel>
                <Input
                  type="email" value={form.email} onChange={set('email')}
                  placeholder="you@example.com" borderRadius="lg"
                  focusBorderColor="blue.400"
                />
              </FormControl>

              <SimpleGrid columns={2} spacing={3} w="full">
                <FormControl>
                  <FormLabel fontSize="sm" color="gray.600">Phone Number</FormLabel>
                  <Input
                    value={form.phone} onChange={set('phone')}
                    placeholder="09XXXXXXXXX" borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" color="gray.600">Barangay</FormLabel>
                  <Select
                    value={form.barangay} onChange={set('barangay')}
                    placeholder="Select barangay" borderRadius="lg"
                    focusBorderColor="blue.400"
                  >
                    {BARANGAYS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </Select>
                </FormControl>
              </SimpleGrid>

              <FormControl isRequired>
                <FormLabel fontSize="sm" color="gray.600">Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPw ? 'text' : 'password'}
                    value={form.password} onChange={set('password')}
                    placeholder="At least 6 characters" borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                  <InputRightElement>
                    <Button variant="ghost" size="sm" onClick={() => setShowPw(!showPw)} tabIndex={-1}>
                      {showPw ? <ViewOffIcon /> : <ViewIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm" color="gray.600">Confirm Password</FormLabel>
                <Input
                  type="password" value={form.confirmPassword} onChange={set('confirmPassword')}
                  placeholder="Re-enter password" borderRadius="lg"
                  focusBorderColor="blue.400"
                />
              </FormControl>

              <Button
                type="submit"
                w="full"
                size="lg"
                fontWeight={700}
                borderRadius="xl"
                isLoading={loading}
                loadingText="Creating account…"
                bgGradient="linear(to-r, blue.500, blue.700)"
                color="white"
                _hover={{ bgGradient: 'linear(to-r, blue.600, blue.800)', transform: 'translateY(-1px)', boxShadow: 'lg' }}
                transition="all 0.2s"
                mt={1}
              >
                Create Account
              </Button>

              <HStack spacing={1} justify="center">
                <Text fontSize="sm" color="gray.500">Already have an account?</Text>
                <Link as={RouterLink} to="/login" color="blue.600" fontWeight={600} fontSize="sm">
                  Sign in
                </Link>
              </HStack>
            </VStack>
          </form>
        </CardBody>
      </Card>
    </Box>
  )
}
