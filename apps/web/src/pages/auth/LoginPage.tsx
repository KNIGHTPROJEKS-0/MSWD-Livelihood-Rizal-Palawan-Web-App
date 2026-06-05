import { useState } from 'react'
import {
  Box, Button, Card, CardBody, CardHeader, FormControl, FormLabel,
  Heading, Input, InputGroup, InputRightElement, VStack, Text,
  Link, useToast, Image, HStack, Divider
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { authApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast({ title: 'Please fill in all fields', status: 'warning', duration: 3000 })
      return
    }
    setLoading(true)
    try {
      const { data } = await authApi.login(email, password)
      setAuth(data.user, data.access_token)
      toast({ title: 'Welcome back!', status: 'success', duration: 2000 })
      navigate('/dashboard')
    } catch (err: any) {
      toast({
        title: 'Login failed',
        description: err.response?.data?.detail || 'Invalid credentials',
        status: 'error',
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center"
      bgGradient="linear(to-br, primary.600, primary.800)" px={4}>
      <Card maxW="md" w="full" shadow="2xl" borderRadius="xl">
        <CardHeader pb={2}>
          <VStack spacing={3}>
            <Image src="/MSWD-Livelihood-Roxas-LOGO.png" alt="MSWD Logo" boxSize="72px" objectFit="contain" />
            <Heading size="lg" textAlign="center" color="primary.700">MSWD Livelihood</Heading>
            <Text color="gray.500" textAlign="center" fontSize="sm">
              Municipal Social Welfare and Development Office<br />Rizal, Palawan
            </Text>
          </VStack>
        </CardHeader>
        <Divider />
        <CardBody>
          <form onSubmit={handleLogin}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email Address</FormLabel>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com" focusBorderColor="primary.500" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input type={showPw ? 'text' : 'password'} value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" focusBorderColor="primary.500" />
                  <InputRightElement>
                    <Button variant="ghost" size="sm" onClick={() => setShowPw(!showPw)}>
                      {showPw ? <ViewOffIcon /> : <ViewIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              <Button type="submit" colorScheme="primary" w="full" isLoading={loading}
                loadingText="Signing in..." size="lg">
                Sign In
              </Button>
              <HStack spacing={1} justify="center">
                <Text fontSize="sm" color="gray.600">Don't have an account?</Text>
                <Link as={RouterLink} to="/register" color="primary.600" fontWeight="semibold" fontSize="sm">
                  Register here
                </Link>
              </HStack>
              <Link as={RouterLink} to="/" color="gray.500" fontSize="sm">
                ← Back to Home
              </Link>
            </VStack>
          </form>
        </CardBody>
      </Card>
    </Box>
  )
}
