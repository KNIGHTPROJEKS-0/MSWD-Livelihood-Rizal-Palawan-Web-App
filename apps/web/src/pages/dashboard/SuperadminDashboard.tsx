import { useEffect, useState } from 'react'
import {
  SimpleGrid, Card, CardBody, CardHeader, Heading, Text, Box, VStack,
  HStack, Badge, Button, Stat, StatLabel, StatNumber, StatHelpText,
  Icon, Skeleton, Table, Thead, Tbody, Tr, Th, Td, TableContainer,
  useToast, Avatar, Flex
} from '@chakra-ui/react'
import { MdPeople, MdWork, MdAssignment, MdTrendingUp, MdAdd } from 'react-icons/md'
import { adminApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { Link as RouterLink } from 'react-router-dom'

const STATUS_COLOR: Record<string, string> = {
  pending: 'yellow', approved: 'green', rejected: 'red', withdrawn: 'gray'
}

export default function SuperadminDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<any>(null)
  const [recentApps, setRecentApps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([adminApi.stats(), adminApi.recentApplications()])
      .then(([statsRes, appsRes]) => {
        setStats(statsRes.data)
        setRecentApps(appsRes.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const StatCard = ({ label, value, icon, color }: any) => (
    <Card>
      <CardBody>
        <HStack justify="space-between">
          <Stat>
            <StatLabel color="gray.500" fontSize="sm">{label}</StatLabel>
            <StatNumber fontSize="2xl" color={`${color}.600`}>
              {loading ? <Skeleton h="28px" w="60px" /> : value}
            </StatNumber>
          </Stat>
          <Box bg={`${color}.100`} p={3} borderRadius="xl">
            <Icon as={icon} color={`${color}.600`} boxSize={6} />
          </Box>
        </HStack>
      </CardBody>
    </Card>
  )

  return (
    <VStack spacing={6} align="stretch">
      <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
        <Box>
          <Heading size="lg" color="gray.800">Superadmin Control Panel</Heading>
          <Text color="gray.500" fontSize="sm">Welcome back, {user?.first_name || user?.email}. Here's your system overview.</Text>
        </Box>
        <Badge colorScheme="red" fontSize="sm" px={3} py={1} borderRadius="full">👑 Superadmin</Badge>
      </Flex>

      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        <StatCard label="Total Beneficiaries" value={stats?.total_beneficiaries} icon={MdPeople} color="blue" />
        <StatCard label="Active Programs" value={stats?.active_programs} icon={MdWork} color="green" />
        <StatCard label="Pending Applications" value={stats?.pending_applications} icon={MdAssignment} color="orange" />
        <StatCard label="Total Applications" value={stats?.total_applications} icon={MdTrendingUp} color="purple" />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <Card borderColor="red.200" borderWidth={2}>
          <CardHeader pb={2}><Heading size="sm" color="red.600">👥 User Management</Heading></CardHeader>
          <CardBody pt={0}>
            <Text fontSize="sm" color="gray.600" mb={3}>Manage accounts, roles, and permissions</Text>
            <HStack>
              <Button as={RouterLink} to="/dashboard/users" colorScheme="red" size="sm">Manage Users</Button>
              <Text fontSize="xs" color="gray.400">{loading ? '…' : `${stats?.total_admins} admins`}</Text>
            </HStack>
          </CardBody>
        </Card>
        <Card>
          <CardHeader pb={2}><Heading size="sm" color="green.600">📋 Programs</Heading></CardHeader>
          <CardBody pt={0}>
            <Text fontSize="sm" color="gray.600" mb={3}>Create and manage livelihood programs</Text>
            <Button as={RouterLink} to="/dashboard/programs" colorScheme="green" size="sm" leftIcon={<MdAdd />}>
              Manage Programs
            </Button>
          </CardBody>
        </Card>
        <Card>
          <CardHeader pb={2}><Heading size="sm" color="blue.600">📝 Applications</Heading></CardHeader>
          <CardBody pt={0}>
            <Text fontSize="sm" color="gray.600" mb={3}>Review and process beneficiary applications</Text>
            <Button as={RouterLink} to="/dashboard/applications" colorScheme="blue" size="sm">
              Review Applications
            </Button>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card>
        <CardHeader>
          <HStack justify="space-between">
            <Heading size="sm">Recent Applications</Heading>
            <Button as={RouterLink} to="/dashboard/applications" size="sm" variant="ghost" colorScheme="blue">View All</Button>
          </HStack>
        </CardHeader>
        <CardBody pt={0}>
          {loading ? (
            <VStack spacing={2}>{[1,2,3].map(i => <Skeleton key={i} h="40px" w="full" />)}</VStack>
          ) : recentApps.length === 0 ? (
            <Text color="gray.500" textAlign="center" py={4}>No applications yet</Text>
          ) : (
            <TableContainer>
              <Table size="sm" variant="simple">
                <Thead><Tr>
                  <Th>Applicant</Th><Th>Program</Th><Th>Status</Th><Th>Date</Th>
                </Tr></Thead>
                <Tbody>
                  {recentApps.map((app) => (
                    <Tr key={app.id}>
                      <Td><HStack><Avatar size="xs" name={app.applicant} /><Text fontSize="sm">{app.applicant}</Text></HStack></Td>
                      <Td><Text fontSize="sm" noOfLines={1}>{app.program}</Text></Td>
                      <Td><Badge colorScheme={STATUS_COLOR[app.status]}>{app.status}</Badge></Td>
                      <Td><Text fontSize="xs" color="gray.500">{app.applied_at?.slice(0, 10)}</Text></Td>
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
