import {
  Box,
  Grid,
  GridItem,
  Heading,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  VStack,
  HStack,
  Badge,
} from '@chakra-ui/react';
import '@chakra-ui/react/dist/chakra-ui-react.cjs';
import { useAuthStore } from '../../store/authStore'

const DashboardPage = () => {
  const { user } = useAuthStore()

  const stats = [
    {
      label: 'Active Programs',
      value: '12',
      helpText: '3 new this month'
    },
    {
      label: 'Total Beneficiaries',
      value: '1,234',
      helpText: '↗︎ 12% from last month'
    },
    {
      label: 'Completed Programs',
      value: '45',
      helpText: 'This year'
    },
    {
      label: 'Budget Allocated',
      value: '₱2.5M',
      helpText: 'Current fiscal year'
    }
  ]

  const recentActivities = [
    {
      id: 1,
      title: 'New Livelihood Training Program',
      description: 'Sewing and Tailoring Workshop started',
      date: '2 hours ago',
      status: 'active'
    },
    {
      id: 2,
      title: 'Beneficiary Application Approved',
      description: 'Maria Santos - Bakery Business',
      date: '4 hours ago',
      status: 'approved'
    },
    {
      id: 3,
      title: 'Program Completion',
      description: 'Organic Farming Workshop completed',
      date: '1 day ago',
      status: 'completed'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'blue'
      case 'approved': return 'green'
      case 'completed': return 'gray'
      default: return 'gray'
    }
  }

  return (
    <Box>
      <VStack align="start" spacing={6} mb={8}>
        <Box>
          <Heading size="lg" mb={2}>
            Welcome back, {user?.name}!
          </Heading>
          <Text color="gray.600">
            Here's what's happening with your livelihood programs today.
          </Text>
        </Box>
      </VStack>

      {/* Stats Grid */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={6} mb={8}>
        {stats.map((stat, index) => (
          <GridItem key={index}>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>{stat.label}</StatLabel>
                  <StatNumber>{stat.value}</StatNumber>
                  <StatHelpText>{stat.helpText}</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
        ))}
      </Grid>

      {/* Recent Activities */}
      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
        <GridItem>
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>Recent Activities</Heading>
              <VStack align="stretch" spacing={4}>
                {recentActivities.map((activity) => (
                  <Box key={activity.id} p={4} borderWidth={1} borderRadius="md">
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="semibold">{activity.title}</Text>
                      <Badge colorScheme={getStatusColor(activity.status)}>
                        {activity.status}
                      </Badge>
                    </HStack>
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      {activity.description}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {activity.date}
                    </Text>
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
        
        <GridItem>
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>Quick Actions</Heading>
              <VStack align="stretch" spacing={3}>
                <Box p={3} bg="primary.50" borderRadius="md" cursor="pointer">
                  <Text fontWeight="semibold" color="primary.700">
                    Add New Program
                  </Text>
                  <Text fontSize="sm" color="primary.600">
                    Create a new livelihood program
                  </Text>
                </Box>
                <Box p={3} bg="green.50" borderRadius="md" cursor="pointer">
                  <Text fontWeight="semibold" color="green.700">
                    Review Applications
                  </Text>
                  <Text fontSize="sm" color="green.600">
                    5 pending applications
                  </Text>
                </Box>
                <Box p={3} bg="orange.50" borderRadius="md" cursor="pointer">
                  <Text fontWeight="semibold" color="orange.700">
                    Generate Report
                  </Text>
                  <Text fontSize="sm" color="orange.600">
                    Monthly progress report
                  </Text>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  )
}

export default DashboardPage