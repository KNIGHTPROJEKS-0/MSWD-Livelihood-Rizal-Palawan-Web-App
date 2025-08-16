import { Box, Button, Container, Grid, GridItem, Heading, HStack, Image, Stack, Text, VStack, Flex, Link, IconButton, useDisclosure, Drawer, DrawerOverlay, DrawerContent, DrawerBody, Spacer, SimpleGrid, Tag } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'

const NAV_LINKS = [
  { label: 'Barangays', href: '#barangays' },
  { label: 'Programs', href: '#programs' },
  { label: 'Requirements', href: '#requirements' },
]

const BARANGAYS = [
  'Bunog',
  'Campong Ulay',
  'Candawaga',
  'Canipaan',
  'Culasian',
  'Iraan',
  'Latud',
  'Panalingaan',
  'Punta Baja',
  'Ransang',
  'Taburi',
]

const PROGRAMS = [
  { title: 'Microenterprise Grants', desc: 'Seed capital assistance for livelihood startups and microenterprises.' },
  { title: 'Skills Training & NC II', desc: 'TESDA-aligned short courses and work readiness training.' },
  { title: 'Cash-for-Work', desc: 'Short-term work opportunities for disaster or community projects.' },
  { title: 'Sustainable Agriculture', desc: 'Inputs and coaching for crops, fisheries, and agri-value chains.' },
  { title: 'Women & Youth Enterprise', desc: 'Focused support for women- and youth-led livelihood projects.' },
  { title: 'Cooperative Strengthening', desc: "Mentoring and tooling for people's organizations and co-ops." },
]

const REQUIREMENTS = [
  "Valid Government-issued ID (any of: PhilID, UMID, Driver's License, Passport, Voter's ID)",
  'Barangay Certificate/Indigency (recent, with signature and seal)',
  "Proof of Residency (e.g., latest barangay clearance or bill in applicant's name)",
  'Income Certificate/Pay Slip or alternative proof of livelihood status',
  "For Business/Group Applications: Mayor's Permit or DTI Registration, and basic proposal outline",
]

const LandingPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Box>
      {/* Navbar */}
      <Box as="header" position="sticky" top={0} zIndex="sticky" bg="white" boxShadow="sm" borderBottomWidth={1}>
        <Container maxW="7xl">
          <Flex h={16} align="center">
            <HStack spacing={3}>
              <Image src="/MSWD-Livelihood-Roxas-LOGO.png" alt="MSWD Livelihood Logo" boxSize="36px" objectFit="contain" />
              <Text fontWeight={700}>MSWD Livelihood</Text>
            </HStack>
            <Spacer />
            <HStack spacing={6} display={{ base: 'none', md: 'flex' }}>
              {NAV_LINKS.map((l) => (
                <Link key={l.label} href={l.href} fontWeight={600} _hover={{ color: 'primary.600' }}>
                  {l.label}
                </Link>
              ))}
              <HStack>
                <Button as={RouterLink} to="/login" variant="ghost">Login</Button>
                <Button as={RouterLink} to="/register" colorScheme="primary">Register</Button>
              </HStack>
            </HStack>
            <IconButton
              aria-label="Open menu"
              icon={
                isOpen ? (
                  <Box as="svg" width="12px" height="12px" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M.436 10.564L10.564.436.436 10.564zM10.564 10.564L.436.436l10.128 10.128z" />
                  </Box>
                ) : (
                  <Box as="svg" width="14px" height="14px" viewBox="0 0 14 14" fill="currentColor">
                    <path d="M14 1.75H0V.25h14zM14 7.75H0V6.25h14zM14 13.75H0v-1.5h14z" />
                  </Box>
                )
              }
              display={{ base: 'inline-flex', md: 'none' }}
              onClick={isOpen ? onClose : onOpen}
              variant="ghost"
              ml={2}
            />
          </Flex>
        </Container>
        {/* Mobile drawer */}
        <Drawer isOpen={isOpen} placement="top" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerBody pb={6}>
              <VStack align="stretch" spacing={3} py={4}>
                {NAV_LINKS.map((l) => (
                  <Link key={l.label} href={l.href} onClick={onClose} fontWeight={600}>
                    {l.label}
                  </Link>
                ))}
                <HStack pt={2}>
                  <Button as={RouterLink} to="/login" onClick={onClose} variant="ghost" w="full">
                    Login
                  </Button>
                  <Button as={RouterLink} to="/register" onClick={onClose} colorScheme="primary" w="full">
                    Register
                  </Button>
                </HStack>
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Box>

      {/* Hero Section */}
      <Box bgGradient="linear(to-b, primary.50, white)" py={{ base: 12, md: 20 }}>
        <Container maxW="7xl">
          <Grid templateColumns={{ base: '1fr', md: '1.2fr 1fr' }} gap={8} alignItems="center">
            <GridItem>
              <VStack align="center" textAlign="center" spacing={5}>
                <Image src="/MSWD-Livelihood-Roxas-LOGO.png" alt="MSWD Livelihood Logo" />
                <Heading size="2xl" lineHeight={1.1}>MSWD Livelihood Platform</Heading>
                <Text fontSize={{ base: 'md', md: 'lg' }} color="gray.600">
                  Empowering families and communities of Dr. Jose P. Rizal, Palawan through
                  accessible livelihood programs, training, and assistance services.
                </Text>
                <HStack spacing={4} justify="center">
                  <Button as={RouterLink} to="/register" colorScheme="primary" size="lg">Get Started</Button>
                  <Button as={RouterLink} to="/login" variant="outline" size="lg">Sign In</Button>
                </HStack>
              </VStack>
            </GridItem>
            <GridItem>
              {/* Decorative panel to replace external image and avoid ORB errors */}
              <Box aria-hidden bgGradient="linear(to-br, primary.100, primary.200)" borderRadius="lg" boxShadow="lg" minH={{ base: '180px', md: '260px' }} />
            </GridItem>
          </Grid>
        </Container>
      </Box>

      {/* Design Reference Section - Figma Embed */}
      <Box py={{ base: 8, md: 12 }} bg="gray.50">
        <Container maxW="7xl">
          <VStack spacing={6}>
            <Heading size="lg" textAlign="center">Design Inspiration</Heading>
            <Text color="gray.600" textAlign="center" maxW="2xl">
              Explore modern landing page designs and interface patterns that inspire our platform development.
            </Text>
            <Box
              w="full"
              maxW="900px"
              mx="auto"
              borderRadius="lg"
              overflow="hidden"
              boxShadow="lg"
              border="1px solid"
              borderColor="gray.200"
            >
              <Box
                as="iframe"
                w="full"
                h="450px"
                src="https://embed.figma.com/proto/aLSnkD5gLtR3CW30HLiuwj/Landing-Page-Kit---Free-13-Landing-Pages-Collection-for-UI-UX-Design--Community-?node-id=299-17625&p=f&scaling=min-zoom&content-scaling=fixed&page-id=2%3A6&starting-point-node-id=299%3A17625&embed-host=share"
                allowFullScreen
                title="Landing Page Design Kit - Figma Prototype"
              />
            </Box>
          </VStack>
        </Container>
      </Box>

      {/* Barangays Section */}
      <Box id="barangays" py={{ base: 12, md: 16 }}>
        <Container maxW="7xl">
          <VStack align="start" spacing={6}>
            <Heading size="xl">Barangays</Heading>
            <Text color="gray.600">Explore all barangays covered by MSWD Dr. Jose P. Rizal, Palawan.</Text>
            <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing={4} w="full">
              {BARANGAYS.map((name) => (
                <Box key={name} p={4} borderWidth={1} borderRadius="lg" _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }} transition="all 0.2s" role="group">
                  <VStack spacing={2} align="start">
                    <Tag size="sm" colorScheme="primary" variant="subtle">Barangay</Tag>
                    <Text fontWeight={600} _groupHover={{ color: 'primary.700' }}>{name}</Text>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Programs Section */}
      <Box id="programs" bg="primary.50" py={{ base: 12, md: 16 }}>
        <Container maxW="7xl">
          <VStack align="start" spacing={6}>
            <Heading size="xl">Livelihood Programs</Heading>
            <Text color="gray.700">Featured programs and services that support households and people's organizations.</Text>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="full">
              {PROGRAMS.map((p) => (
                <Box key={p.title} p={6} borderWidth={1} borderRadius="lg" bg="white" boxShadow="sm" _hover={{ boxShadow: 'md' }}>
                  <Heading size="md" mb={2}>{p.title}</Heading>
                  <Text color="gray.600">{p.desc}</Text>
                </Box>
              ))}
            </SimpleGrid>
            <HStack>
              <Button as={RouterLink} to="/register" colorScheme="primary">Apply Now</Button>
              <Button as={RouterLink} to="/login" variant="outline">Manage as Staff</Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Requirements Section */}
      <Box id="requirements" py={{ base: 12, md: 16 }}>
        <Container maxW="7xl">
          <VStack align="start" spacing={6}>
            <Heading size="xl">General Requirements</Heading>
            <Text color="gray.600">Bring original copies for verification. Programs may have additional specific requirements.</Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
              {REQUIREMENTS.map((req) => (
                <Box key={req} p={4} borderWidth={1} borderRadius="md">
                  <Text>{req}</Text>
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={{ base: 10, md: 16 }} bgGradient="linear(to-b, white, primary.50)">
        <Container maxW="7xl">
          <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" align="center" spacing={6}>
            <Heading size="lg">Ready to participate or manage programs?</Heading>
            <HStack>
              <Button as={RouterLink} to="/register" colorScheme="primary">Create Account</Button>
              <Button as={RouterLink} to="/login" variant="outline">Sign In</Button>
            </HStack>
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Box as="footer" borderTopWidth={1} py={8} bg="white">
        <Container maxW="7xl">
          <Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'start', md: 'center' }} gap={3}>
            <Text>&copy; {new Date().getFullYear()} MSWD Dr. Jose P. Rizal, Palawan</Text>
            <Spacer />
            <HStack spacing={6}>
              {NAV_LINKS.map((l) => (
                <Link key={l.label} href={l.href}>{l.label}</Link>
              ))}
              <Link as={RouterLink} to="/login">Login</Link>
              <Link as={RouterLink} to="/register">Register</Link>
            </HStack>
          </Flex>
        </Container>
      </Box>
    </Box>
  )
}

export default LandingPage