import { useEffect, useState } from 'react'
import {
  SimpleGrid, Card, CardBody, CardHeader, Heading, Text, Box, VStack,
  HStack, Badge, Button, Stat, StatLabel, StatNumber, Icon, Skeleton,
  Table, Thead, Tbody, Tr, Th, Td, TableContainer, Flex, Avatar,
  Divider, Alert, AlertIcon
} from '@chakra-ui/react'
import {
  MdWork, MdAssignment, MdCheckCircle, MdPendingActions,
  MdManageAccounts, MdRateReview, MdNotifications, MdPersonAdd
} from 'react-icons/md'
import { adminApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { Link as RouterLink } from 'react-router-dom'

const STATUS_COLOR: Record<string, string> = {
  pending: 'yellow', approved: 'green', rejected: 'red', withdrawn: 'gray'
}

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<any>(null)
  const [recentApps, setRecentApps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([adminApi.stats(), adminApi.recentApplications()])
      .then(([s, a]) => { setStats(s.data); setRecentApps(a.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const pendingApps = recentApps.filter((a) => a.status === 'pending')

  return (
    <VStack spacing={6} align="stretch">

      {/* Header */}
      <Box
        bgGradient="linear(to-r, blue.600, blue.800)"
        borderRadius="2xl"
        p={6}
        color="white"
        position="relative"
        overflow="hidden"
      >
        <Box position="absolute" top="-30px" right="-30px" w="150px" h="150px"
          borderRadius="full" bg="white" opacity={0.05} />
        <HStack justify="space-between" align="start" wrap="wrap" gap={3}>
          <VStack align="start" spacing={1}>
            <HStack>
              <Icon as={MdManageAccounts} boxSize={6} />
              <Badge bg="rgba(255,255,255,0.2)" color="white" borderRadius="full" px={3} py={0.5} fontSize="xs">
                👨‍💼 ADMIN
              </Badge>
            </HStack>
            <Heading size="lg">
              Hello, {user?.first_name || 'Admin'}!
            </Heading>
            <Text fontSize="sm" opacity={0.85}>
              Program management &amp; application review
            </Text>
          </VStack>
          <Button
            as={RouterLink} to="/dashboard/applications"
            size="sm" bg="white" color="blue.700" fontWeight={700}
            _hover={{ bg: 'blue.50' }} borderRadius="lg"
            leftIcon={<MdRateReview />}
          >
            Review Applications
            {stats?.pending_applications > 0 && (
              <Badge ml={2} colorScheme="orange" borderRadius="full">{stats.pending_applications}</Badge>
            )}
          </Button>
        </HStack>
      </Box>

      {/* Pending Alerts */}
      {!loading && stats?.pending_registrations > 0 && (
        <Alert status="info" borderRadius="xl" fontSize="sm">
          <AlertIcon as={MdPersonAdd} />
          <Text>
            <strong>{stats.pending_registrations} new beneficiar{stats.pending_registrations === 1 ? 'y has' : 'ies have'}</strong> registered and need{stats.pending_registrations === 1 ? 's' : ''} approval.
          </Text>
          <Button as={RouterLink} to="/dashboard/users" size="xs" colorScheme="blue" ml="auto" borderRadius="lg">
            Review Now
          </Button>
        </Alert>
      )}
      {!loading && stats?.pending_applications > 0 && (
        <Alert status="warning" borderRadius="xl" fontSize="sm">
          <AlertIcon />
          <Text>
            <strong>{stats.pending_applications} application{stats.pending_applications > 1 ? 's' : ''}</strong> are waiting for your review.
          </Text>
          <Button as={RouterLink} to="/dashboard/applications" size="xs" colorScheme="orange" ml="auto" borderRadius="lg">
            Review Now
          </Button>
        </Alert>
      )}

      {/* Stats */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        {[
          { label: 'Active Programs', value: stats?.active_programs, icon: MdWork, color: 'blue', sub: 'available now' },
          { label: 'Pending Registrations', value: stats?.pending_registrations, icon: MdPersonAdd, color: 'purple', sub: 'need approval' },
          { label: 'Pending Applications', value: stats?.pending_applications, icon: MdPendingActions, color: 'orange', sub: 'need review' },
          { label: 'Approved Applications', value: stats?.approved_applications, icon: MdCheckCircle, color: 'green', sub: 'granted' },
        ].map((s) => (
          <Card key={s.label} borderRadius="xl" boxShadow="sm" _hover={{ boxShadow: 'md' }} transition="all 0.2s">
            <CardBody>
              <HStack justify="space-between" align="start">
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color="gray.500" fontWeight={500}>{s.label}</Text>
                  <Text fontSize="2xl" fontWeight={800} color={`${s.color}.600`} lineHeight={1.2} mt={1}>
                    {loading ? <Skeleton h="28px" w="50px" display="inline-block" /> : (s.value ?? 0)}
                  </Text>
                  <Text fontSize="xs" color="gray.400" mt={0.5}>{s.sub}</Text>
                </VStack>
                <Box bg={`${s.color}.50`} p={2.5} borderRadius="xl" mt={1}>
                  <Icon as={s.icon} color={`${s.color}.500`} boxSize={5} />
                </Box>
              </HStack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* Quick Actions */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <Card borderRadius="xl" boxShadow="sm" borderLeftWidth={4} borderLeftColor="green.400">
          <CardBody>
            <HStack mb={3}>
              <Box bg="green.50" p={2} borderRadius="lg">
                <Icon as={MdWork} color="green.500" boxSize={5} />
              </Box>
              <Heading size="sm" color="gray.700">Program Management</Heading>
            </HStack>
            <Text fontSize="sm" color="gray.500" mb={4} lineHeight={1.6}>
              View, create, and update livelihood programs. Set eligibility criteria,
              participant limits, and publication status.
            </Text>
            <Button as={RouterLink} to="/dashboard/programs" colorScheme="green" size="sm" borderRadius="lg" w="full">
              Go to Programs
            </Button>
          </CardBody>
        </Card>

        <Card borderRadius="xl" boxShadow="sm" borderLeftWidth={4} borderLeftColor="blue.400">
          <CardBody>
            <HStack mb={3} justify="space-between">
              <HStack>
                <Box bg="blue.50" p={2} borderRadius="lg">
                  <Icon as={MdAssignment} color="blue.500" boxSize={5} />
                </Box>
                <Heading size="sm" color="gray.700">Applications Review</Heading>
              </HStack>
              {stats?.pending_applications > 0 && (
                <Badge colorScheme="orange" borderRadius="full" px={2}>
                  {stats.pending_applications} pending
                </Badge>
              )}
            </HStack>
            <Text fontSize="sm" color="gray.500" mb={4} lineHeight={1.6}>
              Review applications from beneficiaries. Approve or reject with notes.
              All decisions are recorded for audit purposes.
            </Text>
            <Button as={RouterLink} to="/dashboard/applications" colorScheme="blue" size="sm" borderRadius="lg" w="full">
              Review Applications
            </Button>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Pending Applications List */}
      <Card borderRadius="xl" boxShadow="sm">
        <CardHeader>
          <HStack justify="space-between">
            <HStack>
              <Icon as={MdNotifications} color="orange.400" />
              <Heading size="sm" color="gray.700">
                Applications Needing Review
              </Heading>
            </HStack>
            <Button as={RouterLink} to="/dashboard/applications" size="sm" variant="ghost" colorScheme="blue">
              View All →
            </Button>
          </HStack>
        </CardHeader>
        <Divider />
        <CardBody pt={3}>
          {loading ? (
            <VStack spacing={2}>{[1,2,3].map(i => <Skeleton key={i} h="44px" w="full" borderRadius="lg" />)}</VStack>
          ) : recentApps.length === 0 ? (
            <Flex direction="column" align="center" py={8} gap={2}>
              <Icon as={MdCheckCircle} color="green.300" boxSize={10} />
              <Text color="gray.400" fontSize="sm">All caught up! No pending applications.</Text>
            </Flex>
          ) : (
            <TableContainer>
              <Table size="sm" variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Applicant</Th>
                    <Th>Program</Th>
                    <Th>Status</Th>
                    <Th>Submitted</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {recentApps.map((app) => (
                    <Tr key={app.id} _hover={{ bg: 'blue.50' }}
                      bg={app.status === 'pending' ? 'orange.50' : 'white'}>
                      <Td>
                        <HStack>
                          <Avatar size="xs" name={app.applicant} bg="blue.400" color="white" />
                          <Text fontSize="sm" fontWeight={500}>{app.applicant}</Text>
                        </HStack>
                      </Td>
                      <Td><Text fontSize="sm" color="gray.600" noOfLines={1}>{app.program}</Text></Td>
                      <Td>
                        <Badge colorScheme={STATUS_COLOR[app.status]} borderRadius="full" px={2}>
                          {app.status}
                        </Badge>
                      </Td>
                      <Td><Text fontSize="xs" color="gray.400">{app.applied_at?.slice(0, 10)}</Text></Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </CardBody>
      </Card>
    </VStack>
  )
}
