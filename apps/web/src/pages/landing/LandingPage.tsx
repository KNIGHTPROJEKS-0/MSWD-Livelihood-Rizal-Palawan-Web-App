import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  HStack,
  Image,
  Link,
  SimpleGrid,
  Spacer,
  Stack,
  Tag,
  Text,
  VStack,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerBody,
  useDisclosure,
  Badge,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'

const NAV_LINKS = [
  { label: 'Barangays', href: '#barangays' },
  { label: 'Programs', href: '#programs' },
  { label: 'Requirements', href: '#requirements' },
]

const BARANGAYS = [
  { name: 'Bunog',        icon: '🌊', grad: ['blue.400',   'cyan.500']  },
  { name: 'Iraan',        icon: '🌾', grad: ['green.400',  'teal.500']  },
  { name: 'Punta Baja',   icon: '⛵', grad: ['cyan.400',   'blue.500']  },
  { name: 'Campung-Ulay', icon: '🏘️', grad: ['teal.400',   'green.500'] },
  { name: 'Ransang',      icon: '🐠', grad: ['blue.500',   'cyan.400']  },
  { name: 'Culasian',     icon: '🌿', grad: ['green.500',  'lime.400']  },
  { name: 'Candawaga',    icon: '🌺', grad: ['pink.400',   'red.400']   },
  { name: 'Panalingaan',  icon: '🌲', grad: ['green.600',  'teal.400']  },
  { name: 'Taburi',       icon: '🏝️', grad: ['cyan.500',   'teal.400']  },
  { name: 'Canipaan',     icon: '🌱', grad: ['teal.400',   'green.400'] },
  { name: 'Latud',        icon: '⛰️', grad: ['gray.500',   'blue.600']  },
]

const PROGRAMS = [
  {
    title: 'Microenterprise Grants',
    desc: 'Seed capital assistance of up to ₱10,000 for starting or expanding a microenterprise.',
    icon: '💼',
    tag: 'Livelihood',
  },
  {
    title: 'Skills Training & NC II',
    desc: 'TESDA-aligned short courses: Bread & Pastry, Food & Beverage, Carpentry, and more.',
    icon: '🎓',
    tag: 'Training',
  },
  {
    title: 'Cash-for-Work',
    desc: 'Short-term employment in community maintenance, disaster response, and conservation.',
    icon: '🏗️',
    tag: 'Employment',
  },
  {
    title: 'Sustainable Agriculture',
    desc: 'Inputs and coaching for rice farming, vegetable gardening, and fisheries.',
    icon: '🌾',
    tag: 'Agriculture',
  },
  {
    title: 'Women & Youth Enterprise',
    desc: 'Focused support for women- and youth-led handicrafts, food processing, and service enterprises.',
    icon: '🌟',
    tag: 'Enterprise',
  },
  {
    title: 'Cooperative Strengthening',
    desc: "Mentoring, training, and startup capital for cooperatives and people's organizations.",
    icon: '🤝',
    tag: 'Community',
  },
]

const REQUIREMENTS = [
  { icon: '🪪', text: "Valid Government-issued ID (PhilID, UMID, Driver's License, Passport, Voter's ID)" },
  { icon: '📄', text: 'Barangay Certificate / Certificate of Indigency (recent, with signature and seal)' },
  { icon: '🏠', text: "Proof of Residency (barangay clearance or recent utility bill in applicant's name)" },
  { icon: '💰', text: 'Income Certificate / Pay Slip or alternative proof of livelihood status' },
  { icon: '📋', text: "For Business/Group Applications: Mayor's Permit or DTI Registration + business proposal" },
]

const STATS = [
  { value: '11', label: 'Barangays Served' },
  { value: '6+', label: 'Active Programs' },
  { value: '₱500K+', label: 'Annual Budget' },
  { value: '100+', label: 'Beneficiaries' },
]

const LandingPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Box minH="100vh" bg="white">

      {/* ── Navbar ── */}
      <Box
        as="header"
        position="sticky"
        top={0}
        zIndex="sticky"
        bg="rgba(255,255,255,0.85)"
        backdropFilter="blur(12px)"
        borderBottomWidth={1}
        borderColor="gray.100"
        boxShadow="0 1px 20px rgba(0,0,0,0.06)"
      >
        <Container maxW="7xl">
          <Flex h={16} align="center">
            <HStack spacing={3}>
              <Image
                src="/MSWD-Livelihood-Roxas-LOGO.png"
                alt="MSWD Logo"
                boxSize="40px"
                objectFit="contain"
                borderRadius="md"
              />
              <VStack spacing={0} align="start">
                <Text fontWeight={800} fontSize="sm" lineHeight={1.1} color="blue.700">
                  MSWD Livelihood
                </Text>
                <Text fontSize="10px" color="gray.500" lineHeight={1}>
                  Dr. Jose P. Rizal, Palawan
                </Text>
              </VStack>
            </HStack>
            <Spacer />

            <HStack spacing={8} display={{ base: 'none', md: 'flex' }}>
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  fontSize="sm"
                  fontWeight={600}
                  color="gray.600"
                  _hover={{ color: 'blue.600', textDecoration: 'none' }}
                  transition="color 0.2s"
                >
                  {l.label}
                </Link>
              ))}
              <HStack spacing={2}>
                <Button
                  as={RouterLink}
                  to="/login"
                  variant="ghost"
                  size="sm"
                  fontWeight={600}
                  color="gray.700"
                >
                  Sign In
                </Button>
                <Button
                  as={RouterLink}
                  to="/register"
                  size="sm"
                  fontWeight={700}
                  bgGradient="linear(to-r, blue.500, blue.700)"
                  color="white"
                  _hover={{ bgGradient: 'linear(to-r, blue.600, blue.800)', transform: 'translateY(-1px)', boxShadow: 'md' }}
                  transition="all 0.2s"
                  borderRadius="full"
                  px={5}
                >
                  Get Started
                </Button>
              </HStack>
            </HStack>

            <IconButton
              aria-label="Open menu"
              display={{ base: 'inline-flex', md: 'none' }}
              onClick={isOpen ? onClose : onOpen}
              variant="ghost"
              ml={2}
              icon={
                <Box as="svg" width="18px" height="18px" viewBox="0 0 18 18" fill="currentColor">
                  {isOpen
                    ? <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                    : <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                  }
                </Box>
              }
            />
          </Flex>
        </Container>

        <Drawer isOpen={isOpen} placement="top" onClose={onClose}>
          <DrawerOverlay backdropFilter="blur(4px)" />
          <DrawerContent>
            <DrawerBody pb={6}>
              <VStack align="stretch" spacing={2} py={4}>
                {NAV_LINKS.map((l) => (
                  <Link key={l.label} href={l.href} onClick={onClose} fontWeight={600} py={2}>
                    {l.label}
                  </Link>
                ))}
                <HStack pt={3}>
                  <Button as={RouterLink} to="/login" onClick={onClose} variant="outline" w="full" size="sm">Sign In</Button>
                  <Button as={RouterLink} to="/register" onClick={onClose} colorScheme="blue" w="full" size="sm">Get Started</Button>
                </HStack>
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Box>

      {/* ── Hero ── */}
      <Box
        position="relative"
        overflow="hidden"
        pt={{ base: 16, md: 24 }}
        pb={{ base: 12, md: 20 }}
        bgGradient="linear(to-br, #0f172a, #1e3a6e, #1a56a0)"
      >
        {/* Decorative background blobs */}
        <Box
          position="absolute" top="-120px" right="-120px"
          w="500px" h="500px" borderRadius="full"
          bg="blue.400" opacity={0.12} filter="blur(80px)"
          pointerEvents="none"
        />
        <Box
          position="absolute" bottom="-80px" left="-80px"
          w="400px" h="400px" borderRadius="full"
          bg="cyan.400" opacity={0.1} filter="blur(60px)"
          pointerEvents="none"
        />

        <Container maxW="7xl" position="relative">
          <Grid
            templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
            gap={{ base: 10, lg: 16 }}
            alignItems="center"
          >
            {/* Left — text */}
            <VStack align={{ base: 'center', lg: 'start' }} spacing={6} textAlign={{ base: 'center', lg: 'left' }}>
              <Badge
                colorScheme="blue"
                variant="subtle"
                px={3} py={1}
                borderRadius="full"
                fontSize="xs"
                fontWeight={600}
                textTransform="uppercase"
                letterSpacing="wider"
                bg="rgba(59,130,246,0.2)"
                color="blue.200"
                border="1px solid"
                borderColor="blue.500"
              >
                Municipality of Dr. Jose P. Rizal · Palawan
              </Badge>

              <Heading
                as="h1"
                fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
                fontWeight={800}
                lineHeight={1.1}
                color="white"
              >
                Empowering Families<br />
                <Box as="span" bgGradient="linear(to-r, blue.300, cyan.300)" bgClip="text">
                  Through Livelihood
                </Box>
              </Heading>

              <Text
                fontSize={{ base: 'md', md: 'lg' }}
                color="blue.100"
                maxW="480px"
                lineHeight={1.7}
              >
                The Municipal Social Welfare and Development Office connects residents of Rizal, Palawan to
                livelihood programs, skills training, and financial assistance.
              </Text>

              <HStack spacing={3} flexWrap="wrap" justify={{ base: 'center', lg: 'start' }}>
                <Button
                  as={RouterLink}
                  to="/register"
                  size="lg"
                  fontWeight={700}
                  bgGradient="linear(to-r, blue.400, cyan.500)"
                  color="white"
                  _hover={{ bgGradient: 'linear(to-r, blue.500, cyan.600)', transform: 'translateY(-2px)', boxShadow: 'xl' }}
                  transition="all 0.2s"
                  borderRadius="xl"
                  px={8}
                >
                  Apply Now
                </Button>
                <Button
                  as={RouterLink}
                  to="/login"
                  size="lg"
                  fontWeight={600}
                  variant="outline"
                  color="white"
                  borderColor="rgba(255,255,255,0.3)"
                  _hover={{ bg: 'rgba(255,255,255,0.1)', borderColor: 'white' }}
                  transition="all 0.2s"
                  borderRadius="xl"
                  px={8}
                >
                  Staff Login
                </Button>
              </HStack>
            </VStack>

            {/* Right — logo card */}
            <Flex justify="center" align="center">
              <Box
                bg="rgba(255,255,255,0.07)"
                border="1px solid rgba(255,255,255,0.15)"
                borderRadius="3xl"
                backdropFilter="blur(20px)"
                p={{ base: 10, md: 12 }}
                textAlign="center"
                boxShadow="0 25px 60px rgba(0,0,0,0.3)"
                _hover={{ transform: 'translateY(-4px)', boxShadow: '0 35px 80px rgba(0,0,0,0.4)' }}
                transition="all 0.3s"
                maxW="320px"
                w="full"
              >
                <Image
                  src="/MSWD-Livelihood-Roxas-LOGO.png"
                  alt="MSWD Livelihood Logo"
                  boxSize={{ base: '140px', md: '180px' }}
                  objectFit="contain"
                  mx="auto"
                  mb={4}
                  filter="drop-shadow(0 8px 16px rgba(0,0,0,0.3))"
                />
                <Text fontWeight={700} color="white" fontSize="lg">MSWD Livelihood</Text>
                <Text color="blue.200" fontSize="sm" mt={1}>Dr. Jose P. Rizal, Palawan</Text>
                <Text color="blue.300" fontSize="xs" mt={1}>Est. 1989</Text>
              </Box>
            </Flex>
          </Grid>

          {/* Stats row */}
          <SimpleGrid
            columns={{ base: 2, md: 4 }}
            spacing={4}
            mt={{ base: 12, md: 16 }}
          >
            {STATS.map((s) => (
              <Box
                key={s.label}
                bg="rgba(255,255,255,0.07)"
                border="1px solid rgba(255,255,255,0.12)"
                borderRadius="xl"
                p={5}
                textAlign="center"
                backdropFilter="blur(10px)"
              >
                <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight={800} color="white" lineHeight={1}>
                  {s.value}
                </Text>
                <Text fontSize="sm" color="blue.200" mt={1}>{s.label}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ── Barangays ── */}
      <Box id="barangays" py={{ base: 14, md: 20 }} bg="gray.50">
        <Container maxW="7xl">
          <VStack align="start" spacing={2} mb={10}>
            <Tag size="sm" colorScheme="blue" variant="subtle" borderRadius="full" px={3}>Coverage Area</Tag>
            <Heading size="xl" fontWeight={800}>Barangays We Serve</Heading>
            <Text color="gray.500" maxW="lg">
              MSWD livelihood programs are available to all residents across 11 barangays of Dr. Jose P. Rizal, Palawan.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 6 }} spacing={4}>
            {BARANGAYS.map((b) => (
              <Box
                key={b.name}
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="2xl"
                p={5}
                textAlign="center"
                _hover={{ borderColor: 'blue.300', boxShadow: 'lg', transform: 'translateY(-3px)' }}
                transition="all 0.25s"
                cursor="default"
              >
                <Box
                  w={14} h={14} borderRadius="full" mx="auto" mb={3}
                  bgGradient={`linear(to-br, ${b.grad[0]}, ${b.grad[1]})`}
                  display="flex" alignItems="center" justifyContent="center"
                  boxShadow={`0 4px 14px rgba(0,0,0,0.18)`}
                >
                  <Text fontSize="2xl" lineHeight={1}>{b.icon}</Text>
                </Box>
                <Text fontWeight={700} fontSize="sm" color="gray.800" lineHeight={1.3}>{b.name}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ── Programs ── */}
      <Box id="programs" py={{ base: 14, md: 20 }} bg="white">
        <Container maxW="7xl">
          <VStack align="start" spacing={2} mb={10}>
            <Tag size="sm" colorScheme="blue" variant="subtle" borderRadius="full" px={3}>What We Offer</Tag>
            <Heading size="xl" fontWeight={800}>Livelihood Programs</Heading>
            <Text color="gray.500" maxW="lg">
              From seed capital to skills certification — programs designed for households, groups, and cooperatives.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
            {PROGRAMS.map((p) => (
              <Box
                key={p.title}
                bg="white"
                border="1px solid"
                borderColor="gray.100"
                borderRadius="2xl"
                p={6}
                boxShadow="sm"
                _hover={{ boxShadow: 'lg', borderColor: 'blue.200', transform: 'translateY(-3px)' }}
                transition="all 0.25s"
                position="relative"
                overflow="hidden"
              >
                <Box
                  position="absolute" top={0} left={0} right={0} h="3px"
                  bgGradient="linear(to-r, blue.400, cyan.400)"
                />
                <Text fontSize="2xl" mb={3}>{p.icon}</Text>
                <HStack mb={2} align="center" justify="space-between">
                  <Heading size="sm" fontWeight={700}>{p.title}</Heading>
                  <Tag size="xs" colorScheme="blue" variant="subtle" borderRadius="full" px={2} fontSize="10px">
                    {p.tag}
                  </Tag>
                </HStack>
                <Text color="gray.600" fontSize="sm" lineHeight={1.6}>{p.desc}</Text>
              </Box>
            ))}
          </SimpleGrid>

          <HStack mt={10} spacing={3}>
            <Button
              as={RouterLink}
              to="/register"
              colorScheme="blue"
              size="md"
              fontWeight={700}
              borderRadius="xl"
              px={7}
              bgGradient="linear(to-r, blue.500, blue.700)"
              _hover={{ bgGradient: 'linear(to-r, blue.600, blue.800)' }}
            >
              Apply for a Program
            </Button>
            <Button
              as={RouterLink}
              to="/login"
              variant="outline"
              colorScheme="blue"
              size="md"
              fontWeight={600}
              borderRadius="xl"
              px={7}
            >
              Staff Portal
            </Button>
          </HStack>
        </Container>
      </Box>

      {/* ── Requirements ── */}
      <Box id="requirements" py={{ base: 14, md: 20 }} bgGradient="linear(to-br, gray.50, blue.50)">
        <Container maxW="7xl">
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1.5fr' }} gap={{ base: 8, lg: 16 }} alignItems="start">
            <VStack align="start" spacing={4}>
              <Tag size="sm" colorScheme="blue" variant="subtle" borderRadius="full" px={3}>Before You Apply</Tag>
              <Heading size="xl" fontWeight={800}>General Requirements</Heading>
              <Text color="gray.600" lineHeight={1.7}>
                Bring original copies and photocopies for verification. Some programs may require
                additional documents specific to the assistance type.
              </Text>
              <Button
                as={RouterLink}
                to="/register"
                colorScheme="blue"
                fontWeight={700}
                borderRadius="xl"
                px={7}
                mt={2}
              >
                Start Application
              </Button>
            </VStack>

            <VStack spacing={3} align="stretch">
              {REQUIREMENTS.map((req) => (
                <HStack
                  key={req.text}
                  bg="white"
                  border="1px solid"
                  borderColor="gray.100"
                  borderRadius="xl"
                  p={4}
                  spacing={4}
                  boxShadow="sm"
                  _hover={{ borderColor: 'blue.200', boxShadow: 'md' }}
                  transition="all 0.2s"
                >
                  <Text fontSize="xl" flexShrink={0}>{req.icon}</Text>
                  <Text fontSize="sm" color="gray.700" lineHeight={1.5}>{req.text}</Text>
                </HStack>
              ))}
            </VStack>
          </Grid>
        </Container>
      </Box>

      {/* ── CTA Banner ── */}
      <Box
        py={{ base: 14, md: 20 }}
        bgGradient="linear(to-r, #0f172a, #1e3a6e)"
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute" top="-60px" right="-60px"
          w="300px" h="300px" borderRadius="full"
          bg="blue.500" opacity={0.15} filter="blur(60px)"
          pointerEvents="none"
        />
        <Container maxW="7xl" position="relative">
          <Stack
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align="center"
            spacing={8}
          >
            <VStack align={{ base: 'center', md: 'start' }} spacing={2}>
              <Heading size="lg" color="white" fontWeight={800}>
                Ready to apply or manage programs?
              </Heading>
              <Text color="blue.200" fontSize="md">
                Join hundreds of beneficiaries or sign in as MSWD staff.
              </Text>
            </VStack>
            <HStack spacing={3} flexShrink={0}>
              <Button
                as={RouterLink}
                to="/register"
                size="lg"
                fontWeight={700}
                bgGradient="linear(to-r, blue.400, cyan.500)"
                color="white"
                _hover={{ bgGradient: 'linear(to-r, blue.500, cyan.600)', transform: 'translateY(-2px)' }}
                transition="all 0.2s"
                borderRadius="xl"
                px={8}
              >
                Create Account
              </Button>
              <Button
                as={RouterLink}
                to="/login"
                size="lg"
                fontWeight={600}
                variant="outline"
                color="white"
                borderColor="rgba(255,255,255,0.3)"
                _hover={{ bg: 'rgba(255,255,255,0.1)' }}
                borderRadius="xl"
                px={8}
              >
                Sign In
              </Button>
            </HStack>
          </Stack>
        </Container>
      </Box>

      {/* ── Footer ── */}
      <Box as="footer" bg="#0f172a" py={10}>
        <Container maxW="7xl">
          <Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'center', md: 'center' }} gap={6}>
            <HStack spacing={3}>
              <Image
                src="/MSWD-Livelihood-Roxas-LOGO.png"
                alt="MSWD Logo"
                boxSize="32px"
                objectFit="contain"
                opacity={0.9}
              />
              <VStack spacing={0} align="start">
                <Text color="white" fontWeight={700} fontSize="sm">MSWD Livelihood</Text>
                <Text color="gray.500" fontSize="xs">Dr. Jose P. Rizal, Palawan</Text>
              </VStack>
            </HStack>
            <Spacer />
            <HStack spacing={6} flexWrap="wrap" justify="center">
              {NAV_LINKS.map((l) => (
                <Link key={l.label} href={l.href} color="gray.400" fontSize="sm" _hover={{ color: 'white' }} transition="color 0.2s">
                  {l.label}
                </Link>
              ))}
              <Link as={RouterLink} to="/login" color="gray.400" fontSize="sm" _hover={{ color: 'white' }} transition="color 0.2s">Login</Link>
              <Link as={RouterLink} to="/register" color="gray.400" fontSize="sm" _hover={{ color: 'white' }} transition="color 0.2s">Register</Link>
            </HStack>
          </Flex>
          <Box borderTopWidth={1} borderColor="gray.800" mt={8} pt={6} textAlign="center">
            <Text color="gray.600" fontSize="xs">
              &copy; {new Date().getFullYear()} Municipal Social Welfare and Development Office · Dr. Jose P. Rizal, Palawan · All rights reserved.
            </Text>
          </Box>
        </Container>
      </Box>

    </Box>
  )
}

export default LandingPage
