import { useState } from 'react'
import {
  Box, Button, Card, CardBody, CardHeader, FormControl, FormLabel,
  Heading, Input, InputGroup, InputRightElement, VStack, Text,
  Link, useToast, Image, HStack, Divider, SimpleGrid, Select, Icon
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import { Link as RouterLink } from 'react-router-dom'
import { MdArrowBack, MdCheckCircle, MdSchedule, MdPerson } from 'react-icons/md'
import { authApi } from '../../services/api'

const BARANGAYS = [
  'Bunog', 'Iraan', 'Punta Baja', 'Campung-Ulay', 'Ransang',
  'Culasian', 'Candawaga', 'Panalingaan', 'Taburi', 'Canipaan', 'Latud',
]

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    first_name: '', last_name: '', phone: '', barangay: ''
  })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [registeredName, setRegisteredName] = useState('')
  const toast = useToast()

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
      setRegisteredName(form.first_name)
      setRegistered(true)
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
      <Box position="absolute" top="-100px" right="-100px" w="400px" h="400px"
        borderRadius="full" bg="blue.400" opacity={0.1} filter="blur(80px)" pointerEvents="none" />
      <Box position="absolute" bottom="-60px" left="-60px" w="300px" h="300px"
        borderRadius="full" bg="cyan.400" opacity={0.08} filter="blur(60px)" pointerEvents="none" />

      <Card maxW="lg" w="full" shadow="2xl" borderRadius="2xl" overflow="hidden" position="relative">
        <Box h="4px" bgGradient="linear(to-r, blue.400, cyan.400)" />

        {registered ? (
          /* ── Success / Pending Approval State ── */
          <CardBody py={10} px={8}>
            <VStack spacing={6} align="center" textAlign="center">
              <Box
                bg="green.50"
                borderRadius="full"
                p={5}
                border="4px solid"
                borderColor="green.200"
              >
                <Icon as={MdCheckCircle} color="green.500" boxSize={12} />
              </Box>

              <VStack spacing={2}>
                <Heading size="lg" color="gray.800">
                  Registration Submitted!
                </Heading>
                <Text color="gray.600" fontSize="md" fontWeight={500}>
                  Thank you, <Text as="span" color="blue.600" fontWeight={700}>{registeredName}</Text>!
                </Text>
              </VStack>

              <Box
                bg="orange.50"
                border="1px solid"
                borderColor="orange.200"
                borderRadius="xl"
                p={5}
                w="full"
              >
                <HStack spacing={3} align="start">
                  <Icon as={MdSchedule} color="orange.500" boxSize={6} flexShrink={0} mt={0.5} />
                  <VStack align="start" spacing={1}>
                    <Text fontWeight={700} color="orange.700" fontSize="sm">
                      Awaiting MSWD Staff Approval
                    </Text>
                    <Text fontSize="sm" color="orange.600" lineHeight={1.6}>
                      Your registration has been received. Please wait for an MSWD Admin or Staff to review and approve your account before you can log in.
                    </Text>
                  </VStack>
                </HStack>
              </Box>

              <Box
                bg="blue.50"
                border="1px solid"
                borderColor="blue.100"
                borderRadius="xl"
                p={4}
                w="full"
              >
                <VStack spacing={2} align="start">
                  <Text fontSize="xs" fontWeight={700} color="blue.600" textTransform="uppercase" letterSpacing="wide">
                    What happens next?
                  </Text>
                  {[
                    'MSWD staff will review your registration',
                    'You will be notified once approved',
                    'Log in and start applying for livelihood programs',
                  ].map((step, i) => (
                    <HStack key={i} spacing={2}>
                      <Box
                        w={5} h={5} borderRadius="full"
                        bg="blue.500" color="white"
                        display="flex" alignItems="center" justifyContent="center"
                        fontSize="10px" fontWeight={700} flexShrink={0}
                      >
                        {i + 1}
                      </Box>
                      <Text fontSize="sm" color="blue.700">{step}</Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>

              <HStack spacing={3} pt={1} w="full">
                <Button
                  as={RouterLink} to="/login"
                  colorScheme="blue"
                  borderRadius="xl"
                  flex={1}
                  leftIcon={<MdPerson />}
                >
                  Go to Login
                </Button>
                <Button
                  as={RouterLink} to="/"
                  variant="outline"
                  borderRadius="xl"
                  flex={1}
                >
                  Back to Home
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        ) : (
          /* ── Registration Form ── */
          <>
            <CardHeader pb={2} pt={6}>
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
                      <Input value={form.first_name} onChange={set('first_name')}
                        placeholder="Juan" borderRadius="lg" focusBorderColor="blue.400" />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel fontSize="sm" color="gray.600">Last Name</FormLabel>
                      <Input value={form.last_name} onChange={set('last_name')}
                        placeholder="dela Cruz" borderRadius="lg" focusBorderColor="blue.400" />
                    </FormControl>
                  </SimpleGrid>

                  <FormControl isRequired>
                    <FormLabel fontSize="sm" color="gray.600">Email Address</FormLabel>
                    <Input type="email" value={form.email} onChange={set('email')}
                      placeholder="you@example.com" borderRadius="lg" focusBorderColor="blue.400" />
                  </FormControl>

                  <SimpleGrid columns={2} spacing={3} w="full">
                    <FormControl>
                      <FormLabel fontSize="sm" color="gray.600">Phone Number</FormLabel>
                      <Input value={form.phone} onChange={set('phone')}
                        placeholder="09XXXXXXXXX" borderRadius="lg" focusBorderColor="blue.400" />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm" color="gray.600">Barangay</FormLabel>
                      <Select value={form.barangay} onChange={set('barangay')}
                        placeholder="Select barangay" borderRadius="lg" focusBorderColor="blue.400">
                        {BARANGAYS.map((b) => <option key={b} value={b}>{b}</option>)}
                      </Select>
                    </FormControl>
                  </SimpleGrid>

                  <FormControl isRequired>
                    <FormLabel fontSize="sm" color="gray.600">Password</FormLabel>
                    <InputGroup>
                      <Input type={showPw ? 'text' : 'password'} value={form.password}
                        onChange={set('password')} placeholder="At least 6 characters"
                        borderRadius="lg" focusBorderColor="blue.400" />
                      <InputRightElement>
                        <Button variant="ghost" size="sm" onClick={() => setShowPw(!showPw)} tabIndex={-1}>
                          {showPw ? <ViewOffIcon /> : <ViewIcon />}
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="sm" color="gray.600">Confirm Password</FormLabel>
                    <Input type="password" value={form.confirmPassword} onChange={set('confirmPassword')}
                      placeholder="Re-enter password" borderRadius="lg" focusBorderColor="blue.400" />
                  </FormControl>

                  <Button
                    type="submit" w="full" size="lg" fontWeight={700} borderRadius="xl"
                    isLoading={loading} loadingText="Submitting…"
                    bgGradient="linear(to-r, blue.500, blue.700)" color="white"
                    _hover={{ bgGradient: 'linear(to-r, blue.600, blue.800)', transform: 'translateY(-1px)', boxShadow: 'lg' }}
                    transition="all 0.2s" mt={1}
                  >
                    Submit Registration
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
          </>
        )}
      </Card>
    </Box>
  )
}
