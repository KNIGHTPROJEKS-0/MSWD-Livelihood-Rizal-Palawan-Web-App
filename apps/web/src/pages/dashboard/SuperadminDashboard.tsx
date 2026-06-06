import { useEffect, useState } from 'react'
import {
  SimpleGrid, Card, CardBody, CardHeader, Heading, Text, Box, VStack,
  HStack, Badge, Button, Stat, StatLabel, StatNumber, Icon, Skeleton,
  Table, Thead, Tbody, Tr, Th, Td, TableContainer, Flex, Avatar,
  Divider, Progress
} from '@chakra-ui/react'
import {
  MdPeople, MdWork, MdAssignment, MdTrendingUp, MdAdd,
  MdAdminPanelSettings, MdSupervisorAccount, MdCheckCircle,
  MdCancel, MdPendingActions
} from 'react-icons/md'
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
      .then(([s, a]) => { setStats(s.data); setRecentApps(a.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const approvalRate = stats
    ? stats.total_applications > 0
      ? Math.round((stats.approved_applications / stats.total_applications) * 100)
      : 0
    : 0

  return (
    <VStack spacing={6} align="stretch">

      {/* Header */}
      <Box
        bgGradient="linear(to-r, red.600, red.800)"
        borderRadius="2xl"
        p={6}
        color="white"
        position="relative"
        overflow="hidden"
      >
        <Box position="absolute" top="-30px" right="-30px" w="150px" h="150px"
          borderRadius="full" bg="white" opacity={0.05} />
        <Box position="absolute" bottom="-20px" right="80px" w="100px" h="100px"
          borderRadius="full" bg="white" opacity={0.05} />
        <HStack justify="space-between" align="start" wrap="wrap" gap={3}>
          <VStack align="start" spacing={1}>
            <HStack>
              <Icon as={MdAdminPanelSettings} boxSize={6} />
              <Badge bg="rgba(255,255,255,0.2)" color="white" borderRadius="full" px={3} py={0.5} fontSize="xs">
                👑 SUPERADMIN
              </Badge>
            </HStack>
            <Heading size="lg">
              Welcome back, {user?.first_name || 'Admin'}!
            </Heading>
            <Text fontSize="sm" opacity={0.85}>
              Full system access · MSWD Livelihood Rizal, Palawan
            </Text>
          </VStack>
          <HStack spacing={2}>
            <Button
              as={RouterLink} to="/dashboard/programs"
              size="sm" bg="white" color="red.700" fontWeight={700}
              _hover={{ bg: 'red.50' }} borderRadius="lg" leftIcon={<MdAdd />}
            >
              New Program
            </Button>
            <Button
              as={RouterLink} to="/dashboard/users"
              size="sm" variant="outline" borderColor="white" color="white"
              _hover={{ bg: 'rgba(255,255,255,0.1)' }} borderRadius="lg"
            >
              Manage Users
            </Button>
          </HStack>
        </HStack>
      </Box>

      {/* Stats */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        {[
          { label: 'Active Users', value: stats?.total_users, icon: MdPeople, color: 'red', sub: `${stats?.total_admins ?? 0} admins` },
          { label: 'Beneficiaries', value: stats?.total_beneficiaries, icon: MdSupervisorAccount, color: 'orange', sub: 'approved & active' },
          { label: 'Active Programs', value: stats?.active_programs, icon: MdWork, color: 'green', sub: 'available' },
          { label: 'Pending Registrations', value: stats?.pending_registrations, icon: MdAssignment, color: 'purple', sub: 'awaiting approval' },
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

      {/* Application Breakdown + Approval Rate */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <Card borderRadius="xl" boxShadow="sm" gridColumn={{ md: 'span 2' }}>
          <CardHeader pb={1}>
            <Heading size="sm" color="gray.700">Application Status Breakdown</Heading>
          </CardHeader>
          <CardBody pt={2}>
            <SimpleGrid columns={3} spacing={4}>
              {[
                { label: 'Pending', value: stats?.pending_applications, icon: MdPendingActions, color: 'orange' },
                { label: 'Approved', value: stats?.approved_applications, icon: MdCheckCircle, color: 'green' },
                { label: 'Rejected', value: stats?.rejected_applications, icon: MdCancel, color: 'red' },
              ].map((s) => (
                <VStack key={s.label} p={3} bg={`${s.color}.50`} borderRadius="xl" spacing={1}>
                  <Icon as={s.icon} color={`${s.color}.500`} boxSize={6} />
                  <Text fontSize="xl" fontWeight={800} color={`${s.color}.700`}>
                    {loading ? '…' : (s.value ?? 0)}
                  </Text>
                  <Text fontSize="xs" color={`${s.color}.600`} fontWeight={500}>{s.label}</Text>
                </VStack>
              ))}
            </SimpleGrid>
          </CardBody>
        </Card>

        <Card borderRadius="xl" boxShadow="sm">
          <CardHeader pb={1}>
            <Heading size="sm" color="gray.700">Approval Rate</Heading>
          </CardHeader>
          <CardBody pt={2}>
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="3xl" fontWeight={800} color="green.600">
                  {loading ? '…' : `${approvalRate}%`}
                </Text>
                <Icon as={MdTrendingUp} color="green.400" boxSize={6} />
              </HStack>
              <Progress
                value={loading ? 0 : approvalRate}
                colorScheme="green"
                borderRadius="full"
                size="sm"
              />
              <Text fontSize="xs" color="gray.500">
                {stats?.approved_applications ?? 0} of {stats?.total_applications ?? 0} applications approved
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Quick Access */}
      <Box>
        <Heading size="sm" color="gray.600" mb={3}>Quick Access</Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          {[
            {
              title: 'User Management', icon: MdPeople, color: 'red',
              desc: 'Manage accounts, assign roles (Admin/Beneficiary), activate or deactivate users.',
              link: '/dashboard/users', btn: 'Manage Users',
            },
            {
              title: 'Programs', icon: MdWork, color: 'green',
              desc: 'Create, edit, and publish livelihood programs for beneficiaries to apply to.',
              link: '/dashboard/programs', btn: 'Manage Programs',
            },
            {
              title: 'Applications', icon: MdAssignment, color: 'blue',
              desc: 'Review all beneficiary applications. Approve, reject, or request additional documents.',
              link: '/dashboard/applications', btn: 'Review Applications',
            },
          ].map((item) => (
            <Card key={item.title} borderRadius="xl" boxShadow="sm"
              borderTopWidth={3} borderTopColor={`${item.color}.400`}
              _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }} transition="all 0.2s">
              <CardBody>
                <HStack mb={3}>
                  <Box bg={`${item.color}.50`} p={2} borderRadius="lg">
                    <Icon as={item.icon} color={`${item.color}.500`} boxSize={5} />
                  </Box>
                  <Heading size="sm" color="gray.700">{item.title}</Heading>
                </HStack>
                <Text fontSize="sm" color="gray.500" mb={4} lineHeight={1.6}>{item.desc}</Text>
                <Button as={RouterLink} to={item.link} colorScheme={item.color} size="sm" borderRadius="lg" w="full">
                  {item.btn}
                </Button>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </Box>

      {/* Recent Applications */}
      <Card borderRadius="xl" boxShadow="sm">
        <CardHeader>
          <HStack justify="space-between">
            <Heading size="sm" color="gray.700">Recent Applications</Heading>
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
            <Text color="gray.400" textAlign="center" py={6} fontSize="sm">No applications submitted yet.</Text>
          ) : (
            <TableContainer>
              <Table size="sm" variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th borderRadius="md">Applicant</Th>
                    <Th>Program</Th>
                    <Th>Status</Th>
                    <Th>Date</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {recentApps.map((app) => (
                    <Tr key={app.id} _hover={{ bg: 'gray.50' }}>
                      <Td>
                        <HStack>
                          <Avatar size="xs" name={app.applicant} bg="red.400" color="white" />
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
