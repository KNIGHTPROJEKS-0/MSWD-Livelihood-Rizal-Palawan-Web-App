import {
  Box,
  Button,
  Card,
  CardBody,
  Grid,
  GridItem,
  Heading,
  Text,
  Badge,
  VStack,
  HStack,
  Input,
  Select,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react'
import { FiSearch, FiPlus } from 'react-icons/fi'
import { useState } from 'react'

interface Program {
  id: string
  title: string
  description: string
  category: string
  status: 'active' | 'completed' | 'upcoming'
  participants: number
  maxParticipants: number
  startDate: string
  endDate: string
}

const ProgramsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const programs: Program[] = [
    {
      id: '1',
      title: 'Sewing and Tailoring Workshop',
      description: 'Learn basic to advanced sewing techniques and start your own tailoring business.',
      category: 'Skills Training',
      status: 'active',
      participants: 25,
      maxParticipants: 30,
      startDate: '2024-01-15',
      endDate: '2024-03-15'
    },
    {
      id: '2',
      title: 'Organic Farming Training',
      description: 'Sustainable farming practices and organic vegetable production.',
      category: 'Agriculture',
      status: 'completed',
      participants: 40,
      maxParticipants: 40,
      startDate: '2023-10-01',
      endDate: '2023-12-01'
    },
    {
      id: '3',
      title: 'Small Business Management',
      description: 'Learn how to manage finances, marketing, and operations for small businesses.',
      category: 'Business',
      status: 'upcoming',
      participants: 15,
      maxParticipants: 25,
      startDate: '2024-02-01',
      endDate: '2024-04-01'
    },
    {
      id: '4',
      title: 'Food Processing and Preservation',
      description: 'Learn various food processing techniques to extend shelf life and add value.',
      category: 'Food Technology',
      status: 'active',
      participants: 20,
      maxParticipants: 30,
      startDate: '2024-01-10',
      endDate: '2024-03-10'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green'
      case 'completed': return 'gray'
      case 'upcoming': return 'blue'
      default: return 'gray'
    }
  }

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || program.category === filterCategory
    const matchesStatus = !filterStatus || program.status === filterStatus
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const categories = [...new Set(programs.map(p => p.category))]

  return (
    <Box>
      <VStack align="start" spacing={6} mb={8}>
        <HStack justify="space-between" w="full">
          <Box>
            <Heading size="lg" mb={2}>
              Livelihood Programs
            </Heading>
            <Text color="gray.600">
              Manage and monitor all livelihood training programs.
            </Text>
          </Box>
          <Button leftIcon={<FiPlus />} colorScheme="primary">
            Add New Program
          </Button>
        </HStack>

        {/* Filters */}
        <HStack spacing={4} w="full">
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search programs..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          
          <Select
            placeholder="All Categories"
            maxW="200px"
            value={filterCategory}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Select>
          
          <Select
            placeholder="All Status"
            maxW="150px"
            value={filterStatus}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value)}
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="upcoming">Upcoming</option>
          </Select>
        </HStack>
      </VStack>

      {/* Programs Grid */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
        {filteredPrograms.map((program) => (
          <GridItem key={program.id}>
            <Card h="full">
              <CardBody>
                <VStack align="start" spacing={4} h="full">
                  <HStack justify="space-between" w="full">
                    <Badge colorScheme={getStatusColor(program.status)}>
                      {program.status.toUpperCase()}
                    </Badge>
                    <Text fontSize="sm" color="gray.500">
                      {program.category}
                    </Text>
                  </HStack>
                  
                  <Box flex="1">
                    <Heading size="md" mb={2}>
                      {program.title}
                    </Heading>
                    <Text fontSize="sm" color="gray.600" mb={4}>
                      {program.description}
                    </Text>
                  </Box>
                  
                  <VStack align="start" spacing={2} w="full">
                    <HStack justify="space-between" w="full">
                      <Text fontSize="sm" fontWeight="semibold">
                        Participants:
                      </Text>
                      <Text fontSize="sm">
                        {program.participants}/{program.maxParticipants}
                      </Text>
                    </HStack>
                    
                    <HStack justify="space-between" w="full">
                      <Text fontSize="sm" fontWeight="semibold">
                        Duration:
                      </Text>
                      <Text fontSize="sm">
                        {new Date(program.startDate).toLocaleDateString()} - {new Date(program.endDate).toLocaleDateString()}
                      </Text>
                    </HStack>
                  </VStack>
                  
                  <Button size="sm" variant="outline" w="full">
                    View Details
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
        ))}
      </Grid>

      {filteredPrograms.length === 0 && (
        <Box textAlign="center" py={10}>
          <Text fontSize="lg" color="gray.500">
            No programs found matching your criteria.
          </Text>
        </Box>
      )}
    </Box>
  )
}

export default ProgramsPage