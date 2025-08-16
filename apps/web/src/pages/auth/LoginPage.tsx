import { useState } from 'react'
import { 
  Box, 
  Button, 
  Card, 
  CardBody, 
  CardHeader, 
  FormControl, 
  FormLabel, 
  Heading, 
  Input, 
  VStack, 
  Text, 
  Link,
  useToast 
} from '@chakra-ui/react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../services/firebase'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      toast({
        title: 'Login successful',
        status: 'success',
        duration: 3000,
      })
      navigate('/dashboard')
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message,
        status: 'error',
        duration: 5000,
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
      bg="gray.50"
    >
      <Card maxW="md" w="full" mx={4}>
        <CardHeader>
          <Heading size="lg" textAlign="center">
            MSWD Livelihood Login
          </Heading>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleLogin}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </FormControl>
              
              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                w="full"
                isLoading={loading}
              >
                Sign In
              </Button>
              
              <Text>
                Don't have an account?{' '}
                <Link as={RouterLink} to="/register" color="blue.500">
                  Register here
                </Link>
              </Text>
            </VStack>
          </form>
        </CardBody>
      </Card>
    </Box>
  )
}

export default LoginPage