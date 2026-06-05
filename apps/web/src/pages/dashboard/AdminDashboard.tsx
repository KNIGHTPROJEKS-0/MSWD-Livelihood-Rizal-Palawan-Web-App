import { useEffect, useState } from 'react'
import {
  SimpleGrid, Card, CardBody, CardHeader, Heading, Text, Box, VStack,
  HStack, Badge, Button, Stat, StatLabel, StatNumber, Icon, Skeleton,
  Table, Thead, Tbody, Tr, Th, Td, TableContainer, Flex
} from '@chakra-ui/react'
import { MdPeople, MdWork, MdAssignment, MdTrendingUp } from 'react-icons/md'
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
      .finally(() => setLoading(false))
  }, [])

  return (
    <VStack spacing={6} align="stretch">
      <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
        <Box>
          <Heading size="lg" color="gray.800">Admin Dashboard</Heading>
          <Text color="gray.500" fontSize="sm">Welcome, {user?.first_name || user?.email}. Manage your assigned programs and applications.</Text>
        </Box>
        <Badge colorScheme="blue" fontSize="sm" px={3} py={1} borderRadius="full">👨‍💼 Admin</Badge>
      </Flex>

      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        {[
          { label: 'Total Beneficiaries', value: stats?.total_beneficiaries, icon: MdPeople, color: 'blue' },
          { label: 'Active Programs', value: stats?.active_programs, icon: MdWork, color: 'green' },
          { label: 'Pending Reviews', value: stats?.pending_applications, icon: MdAssignment, color: 'orange' },
          { label: 'Approved', value: stats?.approved_applications, icon: MdTrendingUp, color: 'teal' },
        ].map((s) => (
          <Card key={s.label}>
            <CardBody>
              <HStack justify="space-between">
                <Stat>
                  <StatLabel color="gray.500" fontSize="sm">{s.label}</StatLabel>
                  <StatNumber fontSize="2xl" color={`${s.color}.600`}>
                    {loading ? <Skeleton h="28px" w="50px" /> : (s.value ?? 0)}
                  </StatNumber>
                </Stat>
                <Box bg={`${s.color}.100`} p={3} borderRadius="xl">
                  <Icon as={s.icon} color={`${s.color}.600`} boxSize={6} />
                </Box>
              </HStack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <Card>
          <CardHeader pb={2}><Heading size="sm" color="green.600">📋 Program Management</Heading></CardHeader>
          <CardBody pt={0}>
            <Text fontSize="sm" color="gray.600" mb={3}>Manage and monitor assigned livelihood programs</Text>
            <Button as={RouterLink} to="/dashboard/programs" colorScheme="green" size="sm">Manage Programs</Button>
          </CardBody>
        </Card>
        <Card>
          <CardHeader pb={2}><Heading size="sm" color="blue.600">📝 Applications Review</Heading></CardHeader>
          <CardBody pt={0}>
            <Text fontSize="sm" color="gray.600" mb={3}>Review pending applications from beneficiaries</Text>
            <HStack>
              <Button as={RouterLink} to="/dashboard/applications" colorScheme="blue" size="sm">Review Applications</Button>
              {stats?.pending_applications > 0 && (
                <Badge colorScheme="orange" borderRadius="full">{stats.pending_applications} pending</Badge>
              )}
            </HStack>
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
                <Thead><Tr><Th>Applicant</Th><Th>Program</Th><Th>Status</Th><Th>Date</Th></Tr></Thead>
                <Tbody>
                  {recentApps.map((app) => (
                    <Tr key={app.id}>
                      <Td><Text fontSize="sm">{app.applicant}</Text></Td>
                      <Td><Text fontSize="sm" noOfLines={1}>{app.program}</Text></Td>
                      <Td><Badge colorScheme={STATUS_COLOR[app.status]}>{app.status}</Badge></Td>
                      <Td><Text fontSize="xs" color="gray.500">{app.applied_at?.slice(0,10)}</Text></Td>
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
