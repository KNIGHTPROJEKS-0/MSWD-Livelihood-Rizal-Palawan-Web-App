import { useEffect, useState } from 'react'
import {
  SimpleGrid, Card, CardBody, CardHeader, Heading, Text, Box, VStack,
  HStack, Badge, Button, Icon, Skeleton, Flex, Divider, Avatar,
  List, ListItem, ListIcon
} from '@chakra-ui/react'
import {
  MdWork, MdAssignment, MdCheckCircle, MdPendingActions,
  MdLocationOn, MdPerson, MdArrowForward, MdCancel, MdStar
} from 'react-icons/md'
import { applicationsApi, programsApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { Link as RouterLink } from 'react-router-dom'

const STATUS_COLOR: Record<string, string> = {
  pending: 'yellow', approved: 'green', rejected: 'red', withdrawn: 'gray'
}
const STATUS_ICON: Record<string, any> = {
  pending: MdPendingActions,
  approved: MdCheckCircle,
  rejected: MdCancel,
  withdrawn: MdCancel,
}

export default function BeneficiaryDashboard() {
  const { user } = useAuthStore()
  const [applications, setApplications] = useState<any[]>([])
  const [programs, setPrograms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([applicationsApi.list(), programsApi.list()])
      .then(([appRes, progRes]) => {
        setApplications(appRes.data)
        setPrograms(progRes.data.filter((p: any) => p.status === 'active').slice(0, 3))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const pending = applications.filter((a) => a.status === 'pending').length
  const approved = applications.filter((a) => a.status === 'approved').length
  const total = applications.length
  const fullName = user?.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : 'Beneficiary'

  return (
    <VStack spacing={6} align="stretch">

      {/* Welcome Header */}
      <Box
        bgGradient="linear(to-r, green.500, teal.600)"
        borderRadius="2xl"
        p={6}
        color="white"
        position="relative"
        overflow="hidden"
      >
        <Box position="absolute" top="-40px" right="-40px" w="180px" h="180px"
          borderRadius="full" bg="white" opacity={0.07} />
        <Box position="absolute" bottom="-20px" right="60px" w="100px" h="100px"
          borderRadius="full" bg="white" opacity={0.05} />

        <HStack justify="space-between" align="start" wrap="wrap" gap={4}>
          <HStack spacing={4} align="start">
            <Avatar
              size="md"
              name={fullName}
              bg="white"
              color="green.700"
              fontWeight={700}
            />
            <VStack align="start" spacing={1}>
              <Badge bg="rgba(255,255,255,0.2)" color="white" borderRadius="full" px={3} py={0.5} fontSize="xs">
                👤 BENEFICIARY
              </Badge>
              <Heading size="md">Hello, {user?.first_name || 'there'}!</Heading>
              <HStack spacing={3} opacity={0.85} flexWrap="wrap">
                <HStack spacing={1}>
                  <Icon as={MdPerson} boxSize={3.5} />
                  <Text fontSize="xs">{user?.email}</Text>
                </HStack>
                {user?.barangay && (
                  <HStack spacing={1}>
                    <Icon as={MdLocationOn} boxSize={3.5} />
                    <Text fontSize="xs">Brgy. {user.barangay}</Text>
                  </HStack>
                )}
              </HStack>
            </VStack>
          </HStack>
          <Button
            as={RouterLink} to="/dashboard/programs"
            size="sm" bg="white" color="green.700" fontWeight={700}
            _hover={{ bg: 'green.50' }} borderRadius="lg"
            rightIcon={<MdArrowForward />}
          >
            Browse Programs
          </Button>
        </HStack>
      </Box>

      {/* My Application Stats */}
      <SimpleGrid columns={3} spacing={4}>
        {[
          { label: 'My Applications', value: total, icon: MdAssignment, color: 'blue', sub: 'submitted total' },
          { label: 'Pending', value: pending, icon: MdPendingActions, color: 'orange', sub: 'awaiting review' },
          { label: 'Approved', value: approved, icon: MdCheckCircle, color: 'green', sub: 'programs granted' },
        ].map((s) => (
          <Card key={s.label} borderRadius="xl" boxShadow="sm" _hover={{ boxShadow: 'md' }} transition="all 0.2s">
            <CardBody>
              <VStack align="start" spacing={1}>
                <Box bg={`${s.color}.50`} p={2} borderRadius="lg" alignSelf="start">
                  <Icon as={s.icon} color={`${s.color}.500`} boxSize={5} />
                </Box>
                <Text fontSize="2xl" fontWeight={800} color={`${s.color}.600`} lineHeight={1.1} mt={1}>
                  {loading ? <Skeleton h="28px" w="40px" display="inline-block" /> : s.value}
                </Text>
                <Text fontSize="xs" fontWeight={600} color="gray.600">{s.label}</Text>
                <Text fontSize="10px" color="gray.400">{s.sub}</Text>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={5}>
        {/* Available Programs Preview */}
        <Card borderRadius="xl" boxShadow="sm" borderTopWidth={3} borderTopColor="green.400">
          <CardHeader pb={2}>
            <HStack justify="space-between">
              <HStack>
                <Icon as={MdStar} color="green.500" />
                <Heading size="sm" color="gray.700">Available Programs</Heading>
              </HStack>
              <Button as={RouterLink} to="/dashboard/programs" size="xs" colorScheme="green" variant="ghost">
                See All →
              </Button>
            </HStack>
          </CardHeader>
          <Divider />
          <CardBody pt={3}>
            {loading ? (
              <VStack spacing={2}>{[1,2,3].map(i => <Skeleton key={i} h="52px" w="full" borderRadius="lg" />)}</VStack>
            ) : programs.length === 0 ? (
              <Text color="gray.400" textAlign="center" py={4} fontSize="sm">No programs available right now.</Text>
            ) : (
              <VStack spacing={2} align="stretch">
                {programs.map((prog) => (
                  <Box
                    key={prog.id}
                    p={3} bg="green.50" borderRadius="xl"
                    border="1px solid" borderColor="green.100"
                    _hover={{ bg: 'green.100', borderColor: 'green.300' }}
                    transition="all 0.15s"
                  >
                    <HStack justify="space-between">
                      <VStack align="start" spacing={0.5} flex={1}>
                        <Text fontSize="sm" fontWeight={700} color="green.800" noOfLines={1}>
                          {prog.title}
                        </Text>
                        <Text fontSize="xs" color="green.600" noOfLines={1}>{prog.category}</Text>
                      </VStack>
                      <Badge colorScheme="green" fontSize="9px" borderRadius="full" px={2} flexShrink={0}>
                        {prog.current_participants ?? 0}/{prog.max_participants} slots
                      </Badge>
                    </HStack>
                  </Box>
                ))}
                <Button
                  as={RouterLink} to="/dashboard/programs"
                  colorScheme="green" size="sm" borderRadius="lg" mt={1}
                  leftIcon={<MdWork />}
                >
                  Apply to a Program
                </Button>
              </VStack>
            )}
          </CardBody>
        </Card>

        {/* My Recent Applications */}
        <Card borderRadius="xl" boxShadow="sm" borderTopWidth={3} borderTopColor="blue.400">
          <CardHeader pb={2}>
            <HStack justify="space-between">
              <HStack>
                <Icon as={MdAssignment} color="blue.500" />
                <Heading size="sm" color="gray.700">My Applications</Heading>
              </HStack>
              <Button as={RouterLink} to="/dashboard/applications" size="xs" colorScheme="blue" variant="ghost">
                Manage →
              </Button>
            </HStack>
          </CardHeader>
          <Divider />
          <CardBody pt={3}>
            {loading ? (
              <VStack spacing={2}>{[1,2,3].map(i => <Skeleton key={i} h="52px" w="full" borderRadius="lg" />)}</VStack>
            ) : applications.length === 0 ? (
              <Flex direction="column" align="center" py={6} gap={3}>
                <Icon as={MdAssignment} color="gray.200" boxSize={12} />
                <Text color="gray.400" fontSize="sm" textAlign="center">
                  You haven't applied to any programs yet.
                </Text>
                <Button as={RouterLink} to="/dashboard/programs" colorScheme="green" size="sm" borderRadius="lg">
                  Browse Programs
                </Button>
              </Flex>
            ) : (
              <VStack spacing={2} align="stretch">
                {applications.slice(0, 5).map((app) => (
                  <HStack
                    key={app.id}
                    p={3} bg="gray.50" borderRadius="xl"
                    justify="space-between"
                    border="1px solid" borderColor="gray.100"
                    _hover={{ bg: 'blue.50', borderColor: 'blue.100' }}
                    transition="all 0.15s"
                  >
                    <HStack spacing={2} flex={1} overflow="hidden">
                      <Icon as={STATUS_ICON[app.status] || MdAssignment}
                        color={`${STATUS_COLOR[app.status]}.500`} boxSize={4} flexShrink={0} />
                      <VStack align="start" spacing={0} overflow="hidden">
                        <Text fontSize="sm" fontWeight={600} color="gray.700" noOfLines={1}>
                          {app.program_title || `Program #${app.program_id}`}
                        </Text>
                        <Text fontSize="xs" color="gray.400">{app.applied_at?.slice(0, 10)}</Text>
                      </VStack>
                    </HStack>
                    <Badge
                      colorScheme={STATUS_COLOR[app.status]}
                      borderRadius="full" px={2} fontSize="xs" flexShrink={0}
                    >
                      {app.status}
                    </Badge>
                  </HStack>
                ))}
              </VStack>
            )}
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* How to Apply Guide */}
      {!loading && total === 0 && (
        <Card borderRadius="xl" boxShadow="sm" bg="blue.50" borderColor="blue.200" borderWidth={1}>
          <CardBody py={6}>
            <HStack align="start" spacing={5} flexWrap="wrap">
              <Box bg="blue.100" p={3} borderRadius="xl" flexShrink={0}>
                <Icon as={MdWork} color="blue.500" boxSize={7} />
              </Box>
              <VStack align="start" spacing={2} flex={1}>
                <Heading size="sm" color="blue.700">How to Apply</Heading>
                <List spacing={1}>
                  {[
                    'Browse available livelihood programs',
                    'Click "Apply" on a program you qualify for',
                    'Fill in your business proposal and requirements',
                    'Submit and wait for staff review',
                  ].map((step, i) => (
                    <ListItem key={i} fontSize="sm" color="blue.700">
                      <ListIcon as={MdCheckCircle} color="blue.400" />
                      {step}
                    </ListItem>
                  ))}
                </List>
                <Button as={RouterLink} to="/dashboard/programs" colorScheme="blue" size="sm" borderRadius="lg" mt={1}>
                  Get Started
                </Button>
              </VStack>
            </HStack>
          </CardBody>
        </Card>
      )}
    </VStack>
  )
}
