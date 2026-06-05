import { useEffect, useState } from 'react'
import {
  SimpleGrid, Card, CardBody, CardHeader, Heading, Text, Box, VStack,
  HStack, Badge, Button, Stat, StatLabel, StatNumber, Icon, Skeleton, Flex
} from '@chakra-ui/react'
import { MdWork, MdAssignment, MdCheckCircle, MdPendingActions } from 'react-icons/md'
import { applicationsApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { Link as RouterLink } from 'react-router-dom'

const STATUS_COLOR: Record<string, string> = {
  pending: 'yellow', approved: 'green', rejected: 'red', withdrawn: 'gray'
}

export default function BeneficiaryDashboard() {
  const { user } = useAuthStore()
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    applicationsApi.list()
      .then((res) => setApplications(res.data))
      .finally(() => setLoading(false))
  }, [])

  const pending = applications.filter((a) => a.status === 'pending').length
  const approved = applications.filter((a) => a.status === 'approved').length
  const total = applications.length

  return (
    <VStack spacing={6} align="stretch">
      <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
        <Box>
          <Heading size="lg" color="gray.800">
            Welcome, {user?.first_name || 'Beneficiary'}!
          </Heading>
          <Text color="gray.500" fontSize="sm">
            {user?.barangay ? `Barangay ${user.barangay} • ` : ''}
            Manage your program applications here.
          </Text>
        </Box>
        <Badge colorScheme="green" fontSize="sm" px={3} py={1} borderRadius="full">👤 Beneficiary</Badge>
      </Flex>

      <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
        {[
          { label: 'Total Applications', value: total, icon: MdAssignment, color: 'blue' },
          { label: 'Pending', value: pending, icon: MdPendingActions, color: 'orange' },
          { label: 'Approved', value: approved, icon: MdCheckCircle, color: 'green' },
        ].map((s) => (
          <Card key={s.label}>
            <CardBody>
              <HStack justify="space-between">
                <Stat>
                  <StatLabel color="gray.500" fontSize="sm">{s.label}</StatLabel>
                  <StatNumber fontSize="2xl" color={`${s.color}.600`}>
                    {loading ? <Skeleton h="28px" w="40px" /> : s.value}
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
        <Card borderColor="green.200" borderWidth={2}>
          <CardHeader pb={2}><Heading size="sm" color="green.600">🌱 Browse Programs</Heading></CardHeader>
          <CardBody pt={0}>
            <Text fontSize="sm" color="gray.600" mb={4}>
              Explore available livelihood programs — from agriculture and skills training to
              business grants and cooperative support. Apply now to get started.
            </Text>
            <Button as={RouterLink} to="/dashboard/programs" colorScheme="green" leftIcon={<MdWork />}>
              View Available Programs
            </Button>
          </CardBody>
        </Card>
        <Card>
          <CardHeader pb={2}><Heading size="sm" color="blue.600">📋 My Applications</Heading></CardHeader>
          <CardBody pt={0}>
            <Text fontSize="sm" color="gray.600" mb={4}>
              Track the status of your program applications, view reviewer notes,
              and manage your submissions.
            </Text>
            <Button as={RouterLink} to="/dashboard/applications" colorScheme="blue" leftIcon={<MdAssignment />}>
              View My Applications
            </Button>
          </CardBody>
        </Card>
      </SimpleGrid>

      {applications.length > 0 && (
        <Card>
          <CardHeader><Heading size="sm">Recent Activity</Heading></CardHeader>
          <CardBody pt={0}>
            <VStack spacing={3} align="stretch">
              {applications.slice(0, 5).map((app) => (
                <HStack key={app.id} p={3} bg="gray.50" borderRadius="lg" justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" fontWeight={600}>Program #{app.program_id}</Text>
                    <Text fontSize="xs" color="gray.500">{app.applied_at?.slice(0, 10)}</Text>
                  </VStack>
                  <Badge colorScheme={STATUS_COLOR[app.status]}>{app.status}</Badge>
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>
      )}

      {!loading && applications.length === 0 && (
        <Card bg="blue.50" borderColor="blue.200" borderWidth={1}>
          <CardBody textAlign="center" py={8}>
            <Icon as={MdWork} boxSize={12} color="blue.300" mb={3} />
            <Heading size="sm" color="blue.700" mb={2}>No Applications Yet</Heading>
            <Text color="blue.600" fontSize="sm" mb={4}>
              Start by browsing available programs and submit your first application.
            </Text>
            <Button as={RouterLink} to="/dashboard/programs" colorScheme="blue">
              Explore Programs
            </Button>
          </CardBody>
        </Card>
      )}
    </VStack>
  )
}
