import { useEffect, useState } from 'react'
import {
  VStack, HStack, Heading, Text, Card, CardBody, CardHeader, SimpleGrid,
  Stat, StatLabel, StatNumber, StatHelpText, Box, Icon, Divider,
  Table, Thead, Tbody, Tr, Th, Td, TableContainer, Badge, Skeleton, Flex
} from '@chakra-ui/react'
import {
  MdBarChart, MdPeople, MdWork, MdAssignment, MdCheckCircle,
  MdCancel, MdPendingActions, MdTrendingUp, MdPersonAdd
} from 'react-icons/md'
import { adminApi } from '../../services/api'

export default function ReportsPage() {
  const [stats, setStats] = useState<any>(null)
  const [recentApps, setRecentApps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([adminApi.stats(), adminApi.recentApplications()])
      .then(([s, a]) => { setStats(s.data); setRecentApps(a.data) })
      .finally(() => setLoading(false))
  }, [])

  const approvalRate = stats && stats.total_applications > 0
    ? Math.round((stats.approved_applications / stats.total_applications) * 100)
    : 0

  const StatCard = ({ label, value, sub, icon, color }: any) => (
    <Card borderRadius="xl" boxShadow="sm">
      <CardBody>
        <HStack justify="space-between" align="start">
          <Stat>
            <StatLabel color="gray.500" fontSize="xs">{label}</StatLabel>
            <StatNumber fontSize="2xl" color={`${color}.600`} mt={1}>
              {loading ? <Skeleton h="28px" w="50px" display="inline-block" /> : (value ?? 0)}
            </StatNumber>
            {sub && <StatHelpText fontSize="xs" color="gray.400">{sub}</StatHelpText>}
          </Stat>
          <Box bg={`${color}.50`} p={2.5} borderRadius="xl" mt={1}>
            <Icon as={icon} color={`${color}.500`} boxSize={5} />
          </Box>
        </HStack>
      </CardBody>
    </Card>
  )

  const STATUS_COLOR: Record<string, string> = {
    pending: 'yellow', approved: 'green', rejected: 'red', withdrawn: 'gray'
  }

  return (
    <VStack spacing={6} align="stretch">

      {/* Header */}
      <Box
        bgGradient="linear(to-r, purple.600, purple.800)"
        borderRadius="2xl"
        p={6}
        color="white"
        position="relative"
        overflow="hidden"
      >
        <Box position="absolute" top="-30px" right="-30px" w="150px" h="150px"
          borderRadius="full" bg="white" opacity={0.05} />
        <HStack>
          <Icon as={MdBarChart} boxSize={6} />
          <VStack align="start" spacing={0}>
            <Heading size="lg">Reports &amp; Analytics</Heading>
            <Text fontSize="sm" opacity={0.85}>System-wide statistics and summaries</Text>
          </VStack>
        </HStack>
      </Box>

      {/* User Stats */}
      <Box>
        <Heading size="sm" color="gray.600" mb={3}>👥 User Overview</Heading>
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <StatCard label="Active Users" value={stats?.total_users} icon={MdPeople} color="blue" sub="approved accounts" />
          <StatCard label="Beneficiaries" value={stats?.total_beneficiaries} icon={MdPeople} color="green" sub="active" />
          <StatCard label="Admins / Staff" value={stats?.total_admins} icon={MdPeople} color="red" sub="accounts" />
          <StatCard label="Pending Registration" value={stats?.pending_registrations} icon={MdPersonAdd} color="orange" sub="awaiting approval" />
        </SimpleGrid>
      </Box>

      {/* Programs & Applications */}
      <Box>
        <Heading size="sm" color="gray.600" mb={3}>📋 Programs &amp; Applications</Heading>
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <StatCard label="Active Programs" value={stats?.active_programs} icon={MdWork} color="teal" sub="open for applications" />
          <StatCard label="Total Applications" value={stats?.total_applications} icon={MdAssignment} color="purple" sub="all time" />
          <StatCard label="Approved" value={stats?.approved_applications} icon={MdCheckCircle} color="green" sub={`${approvalRate}% approval rate`} />
          <StatCard label="Pending Review" value={stats?.pending_applications} icon={MdPendingActions} color="orange" sub="needs attention" />
        </SimpleGrid>
      </Box>

      {/* Approval Rate Banner */}
      <Card borderRadius="xl" boxShadow="sm">
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            {[
              { label: 'Approved', value: stats?.approved_applications ?? 0, icon: MdCheckCircle, color: 'green' },
              { label: 'Rejected', value: stats?.rejected_applications ?? 0, icon: MdCancel, color: 'red' },
              { label: 'Pending', value: stats?.pending_applications ?? 0, icon: MdPendingActions, color: 'orange' },
            ].map((s) => (
              <VStack key={s.label} spacing={2} p={4} bg={`${s.color}.50`} borderRadius="xl">
                <Icon as={s.icon} color={`${s.color}.500`} boxSize={8} />
                <Text fontSize="3xl" fontWeight={800} color={`${s.color}.700`}>
                  {loading ? '…' : s.value}
                </Text>
                <Text fontSize="sm" fontWeight={600} color={`${s.color}.600`}>{s.label}</Text>
                <Text fontSize="xs" color={`${s.color}.500`}>
                  {loading || !stats?.total_applications ? '' :
                    `${Math.round((s.value / (stats?.total_applications || 1)) * 100)}% of total`}
                </Text>
              </VStack>
            ))}
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Recent Applications */}
      <Card borderRadius="xl" boxShadow="sm">
        <CardHeader>
          <HStack>
            <Icon as={MdTrendingUp} color="purple.500" />
            <Heading size="sm" color="gray.700">Recent Applications</Heading>
          </HStack>
        </CardHeader>
        <Divider />
        <CardBody pt={3}>
          {loading ? (
            <VStack spacing={2}>{[1,2,3].map(i => <Skeleton key={i} h="44px" w="full" borderRadius="lg" />)}</VStack>
          ) : recentApps.length === 0 ? (
            <Text color="gray.400" textAlign="center" py={6} fontSize="sm">No applications yet.</Text>
          ) : (
            <TableContainer>
              <Table size="sm" variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Applicant</Th><Th>Program</Th><Th>Status</Th><Th>Date</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {recentApps.map((app) => (
                    <Tr key={app.id} _hover={{ bg: 'gray.50' }}>
                      <Td><Text fontSize="sm" fontWeight={500}>{app.applicant}</Text></Td>
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
