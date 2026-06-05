import { useState } from 'react'
import {
  Box, Button, Card, CardBody, CardHeader, FormControl, FormLabel,
  Heading, Input, InputGroup, InputRightElement, VStack, Text,
  Link, useToast, Image, HStack, Divider, SimpleGrid, Select
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
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
      toast({ title: 'Account created successfully!', status: 'success', duration: 2000 })
      navigate('/dashboard')
    } catch (err: any) {
      toast({
        title: 'Registration failed',
        description: err.response?.data?.detail || 'An error occurred',
        status: 'error', duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center"
      bgGradient="linear(to-br, primary.600, primary.800)" py={8} px={4}>
      <Card maxW="lg" w="full" shadow="2xl" borderRadius="xl">
        <CardHeader pb={2}>
          <VStack spacing={3}>
            <Image src="/MSWD-Livelihood-Roxas-LOGO.png" alt="MSWD Logo" boxSize="64px" objectFit="contain" />
            <Heading size="lg" textAlign="center" color="primary.700">Create Account</Heading>
            <Text color="gray.500" textAlign="center" fontSize="sm">
              Register as a beneficiary of MSWD Livelihood Programs
            </Text>
          </VStack>
        </CardHeader>
        <Divider />
        <CardBody>
          <form onSubmit={handleRegister}>
            <VStack spacing={4}>
              <SimpleGrid columns={2} spacing={3} w="full">
                <FormControl isRequired>
                  <FormLabel fontSize="sm">First Name</FormLabel>
                  <Input value={form.first_name} onChange={set('first_name')} placeholder="Juan" focusBorderColor="primary.500" />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Last Name</FormLabel>
                  <Input value={form.last_name} onChange={set('last_name')} placeholder="dela Cruz" focusBorderColor="primary.500" />
                </FormControl>
              </SimpleGrid>
              <FormControl isRequired>
                <FormLabel fontSize="sm">Email Address</FormLabel>
                <Input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" focusBorderColor="primary.500" />
              </FormControl>
              <SimpleGrid columns={2} spacing={3} w="full">
                <FormControl>
                  <FormLabel fontSize="sm">Phone Number</FormLabel>
                  <Input value={form.phone} onChange={set('phone')} placeholder="09XXXXXXXXX" focusBorderColor="primary.500" />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Barangay</FormLabel>
                  <Select value={form.barangay} onChange={set('barangay')} placeholder="Select barangay" focusBorderColor="primary.500">
                    {BARANGAYS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </Select>
                </FormControl>
              </SimpleGrid>
              <FormControl isRequired>
                <FormLabel fontSize="sm">Password</FormLabel>
                <InputGroup>
                  <Input type={showPw ? 'text' : 'password'} value={form.password}
                    onChange={set('password')} placeholder="••••••••" focusBorderColor="primary.500" />
                  <InputRightElement>
                    <Button variant="ghost" size="sm" onClick={() => setShowPw(!showPw)}>
                      {showPw ? <ViewOffIcon /> : <ViewIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="sm">Confirm Password</FormLabel>
                <Input type="password" value={form.confirmPassword} onChange={set('confirmPassword')}
                  placeholder="••••••••" focusBorderColor="primary.500" />
              </FormControl>
              <Button type="submit" colorScheme="primary" w="full" isLoading={loading}
                loadingText="Creating account..." size="lg">
                Create Account
              </Button>
              <HStack spacing={1} justify="center">
                <Text fontSize="sm" color="gray.600">Already have an account?</Text>
                <Link as={RouterLink} to="/login" color="primary.600" fontWeight="semibold" fontSize="sm">
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
