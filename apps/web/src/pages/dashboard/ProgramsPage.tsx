import { useEffect, useState } from 'react'
import {
  VStack, HStack, Heading, Text, Card, CardBody, CardHeader, Button,
  Badge, SimpleGrid, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, ModalCloseButton, FormControl, FormLabel,
  Input, Textarea, Select, useDisclosure, useToast, Icon, Box,
  Skeleton, Flex, Divider
} from '@chakra-ui/react'
import {
  MdAdd, MdWork, MdEdit, MdDelete, MdCheckCircle, MdPeople,
  MdCalendarToday, MdAttachMoney, MdLocationOn
} from 'react-icons/md'
import { programsApi, applicationsApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

const STATUS_COLOR: Record<string, string> = {
  active: 'green', upcoming: 'blue', completed: 'gray', cancelled: 'red', deleted: 'red'
}
const CATEGORIES = [
  'Livelihood Assistance', 'Skills Training', 'Agriculture', 'Business Development',
  'Food Technology', 'Handicrafts', 'Technology', 'Social Pension', 'Child Welfare',
  'Family Support', 'Emergency Relief'
]

export default function ProgramsPage() {
  const { user } = useAuthStore()
  const [programs, setPrograms] = useState<any[]>([])
  const [myApplications, setMyApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<any>({})
  const [editing, setEditing] = useState<any>(null)
  const [applying, setApplying] = useState<any>(null)
  const [appForm, setAppForm] = useState<any>({})
  const [submitting, setSubmitting] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isAppOpen, onOpen: onAppOpen, onClose: onAppClose } = useDisclosure()
  const toast = useToast()
  const isStaff = user?.role === 'superadmin' || user?.role === 'admin'

  const loadData = async () => {
    try {
      const progs = await programsApi.list()
      setPrograms(progs.data.filter((p: any) => p.status !== 'deleted'))
      if (!isStaff) {
        const apps = await applicationsApi.list()
        setMyApplications(apps.data)
      }
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { loadData() }, [])

  // Get my application status for a given program
  const getMyAppStatus = (programId: number) => {
    const app = myApplications.find((a) => a.program_id === programId && a.status !== 'withdrawn')
    return app ? app.status : null
  }

  const openCreate = () => { setEditing(null); setForm({}); onOpen() }
  const openEdit = (p: any) => {
    setEditing(p)
    setForm({
      title: p.title, description: p.description, category: p.category,
      status: p.status, max_participants: p.max_participants, location: p.location,
      requirements: p.requirements, budget: p.budget, start_date: p.start_date, end_date: p.end_date
    })
    onOpen()
  }
  const openApply = (p: any) => { setApplying(p); setAppForm({}); onAppOpen() }

  const handleSave = async () => {
    try {
      if (editing) await programsApi.update(editing.id, form)
      else await programsApi.create(form)
      toast({ title: editing ? 'Program updated' : 'Program created', status: 'success', duration: 2000 })
      onClose(); loadData()
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.detail, status: 'error', duration: 4000 })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this program?')) return
    try {
      await programsApi.delete(id)
      toast({ title: 'Program deleted', status: 'info', duration: 2000 })
      loadData()
    } catch { toast({ title: 'Error deleting', status: 'error', duration: 3000 }) }
  }

  const handleApply = async () => {
    setSubmitting(true)
    try {
      await applicationsApi.create({ program_id: applying.id, ...appForm })
      toast({
        title: '✅ Application Submitted!',
        description: `Your application for "${applying.title}" has been submitted. Please wait for MSWD review.`,
        status: 'success', duration: 4000, isClosable: true,
      })
      onAppClose(); loadData()
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.detail, status: 'error', duration: 4000 })
    } finally {
      setSubmitting(false)
    }
  }

  const setF = (k: string) => (e: any) => setForm((f: any) => ({ ...f, [k]: e.target.value }))
  const setAF = (k: string) => (e: any) => setAppForm((f: any) => ({ ...f, [k]: e.target.value }))

  return (
    <VStack spacing={6} align="stretch">
      <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
        <Box>
          <Heading size="lg" color="gray.800">
            {isStaff ? 'Program Management' : 'Available Programs'}
          </Heading>
          <Text color="gray.500" fontSize="sm">
            {isStaff
              ? 'Create and manage livelihood programs'
              : 'Browse available programs and submit your application'}
          </Text>
        </Box>
        {isStaff && (
          <Button colorScheme="green" leftIcon={<MdAdd />} borderRadius="lg" onClick={openCreate}>
            New Program
          </Button>
        )}
      </Flex>

      {loading ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} h="200px" borderRadius="xl" />)}
        </SimpleGrid>
      ) : programs.length === 0 ? (
        <Card borderRadius="xl">
          <CardBody textAlign="center" py={12}>
            <Icon as={MdWork} boxSize={12} color="gray.200" mb={3} />
            <Heading size="sm" color="gray.400">No programs available</Heading>
            {isStaff && (
              <Button mt={4} colorScheme="green" leftIcon={<MdAdd />} borderRadius="lg" onClick={openCreate}>
                Create First Program
              </Button>
            )}
          </CardBody>
        </Card>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {programs.map((p) => {
            const myStatus = !isStaff ? getMyAppStatus(p.id) : null
            const isFull = p.max_participants && (p.current_participants || 0) >= p.max_participants

            return (
              <Card
                key={p.id}
                borderRadius="xl"
                boxShadow="sm"
                _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
                transition="all 0.2s"
                overflow="hidden"
                borderTopWidth={3}
                borderTopColor={
                  myStatus === 'approved' ? 'green.400' :
                  myStatus === 'pending' ? 'orange.400' :
                  STATUS_COLOR[p.status] === 'green' ? 'green.300' : 'gray.200'
                }
              >
                <CardHeader pb={2}>
                  <HStack justify="space-between" align="start">
                    <Heading size="sm" noOfLines={2} flex={1} color="gray.800">{p.title}</Heading>
                    <Badge
                      colorScheme={STATUS_COLOR[p.status] || 'gray'}
                      borderRadius="full" px={2} flexShrink={0} fontSize="xs"
                    >
                      {p.status}
                    </Badge>
                  </HStack>
                  {p.category && (
                    <Badge colorScheme="purple" variant="subtle" mt={1} fontSize="xs" borderRadius="full">
                      {p.category}
                    </Badge>
                  )}
                  {/* Beneficiary: show applied status */}
                  {!isStaff && myStatus && (
                    <Badge
                      colorScheme={myStatus === 'approved' ? 'green' : myStatus === 'pending' ? 'orange' : 'red'}
                      mt={1} fontSize="xs" borderRadius="full" px={2}
                    >
                      {myStatus === 'approved' ? '✅ Applied & Approved' :
                       myStatus === 'pending' ? '🕐 Application Pending' :
                       '❌ Application Rejected'}
                    </Badge>
                  )}
                </CardHeader>

                <CardBody pt={0}>
                  <VStack align="start" spacing={2}>
                    <Text fontSize="sm" color="gray.600" noOfLines={3} lineHeight={1.6}>
                      {p.description || 'No description provided.'}
                    </Text>

                    <Divider />

                    <VStack align="start" spacing={1.5} w="full">
                      {p.location && (
                        <HStack spacing={1.5}>
                          <Icon as={MdLocationOn} color="gray.400" boxSize={3.5} />
                          <Text fontSize="xs" color="gray.500">{p.location}</Text>
                        </HStack>
                      )}
                      {p.max_participants && (
                        <HStack spacing={1.5}>
                          <Icon as={MdPeople} color={isFull ? 'red.400' : 'gray.400'} boxSize={3.5} />
                          <Text fontSize="xs" color={isFull ? 'red.500' : 'gray.500'} fontWeight={isFull ? 600 : 400}>
                            {p.current_participants || 0} / {p.max_participants} participants
                            {isFull ? ' (Full)' : ''}
                          </Text>
                        </HStack>
                      )}
                      {(p.start_date || p.end_date) && (
                        <HStack spacing={1.5}>
                          <Icon as={MdCalendarToday} color="gray.400" boxSize={3.5} />
                          <Text fontSize="xs" color="gray.500">
                            {p.start_date} {p.end_date ? `– ${p.end_date}` : ''}
                          </Text>
                        </HStack>
                      )}
                      {p.budget && (
                        <HStack spacing={1.5}>
                          <Icon as={MdAttachMoney} color="green.400" boxSize={3.5} />
                          <Text fontSize="xs" color="green.600" fontWeight={600}>{p.budget}</Text>
                        </HStack>
                      )}
                    </VStack>

                    <HStack pt={1} w="full" justify="flex-end" spacing={2}>
                      {isStaff ? (
                        <>
                          <Button size="sm" leftIcon={<MdEdit />} variant="outline"
                            borderRadius="lg" onClick={() => openEdit(p)}>
                            Edit
                          </Button>
                          {user?.role === 'superadmin' && (
                            <Button size="sm" leftIcon={<MdDelete />} colorScheme="red"
                              variant="outline" borderRadius="lg" onClick={() => handleDelete(p.id)}>
                              Delete
                            </Button>
                          )}
                        </>
                      ) : myStatus ? (
                        <Button
                          size="sm" borderRadius="lg"
                          colorScheme={myStatus === 'approved' ? 'green' : myStatus === 'pending' ? 'orange' : 'gray'}
                          variant="outline"
                          leftIcon={<Icon as={MdCheckCircle} />}
                          isDisabled
                        >
                          {myStatus === 'approved' ? 'Approved' : myStatus === 'pending' ? 'Pending Review' : 'Rejected'}
                        </Button>
                      ) : (
                        <Button
                          size="sm" colorScheme="green" borderRadius="lg"
                          onClick={() => openApply(p)}
                          isDisabled={p.status !== 'active' || !!isFull}
                        >
                          {p.status !== 'active' ? p.status : isFull ? 'Program Full' : 'Apply Now'}
                        </Button>
                      )}
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            )
          })}
        </SimpleGrid>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="2xl" overflow="hidden">
          <Box h="4px" bgGradient="linear(to-r, green.400, teal.400)" />
          <ModalHeader>{editing ? 'Edit Program' : 'Create New Program'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input value={form.title || ''} onChange={setF('title')} placeholder="Program name" borderRadius="lg" />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea value={form.description || ''} onChange={setF('description')} rows={3} borderRadius="lg" />
              </FormControl>
              <SimpleGrid columns={2} spacing={3} w="full">
                <FormControl>
                  <FormLabel>Category</FormLabel>
                  <Select value={form.category || ''} onChange={setF('category')} placeholder="Select" borderRadius="lg">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <Select value={form.status || 'active'} onChange={setF('status')} borderRadius="lg">
                    <option value="upcoming">Upcoming</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </Select>
                </FormControl>
              </SimpleGrid>
              <SimpleGrid columns={2} spacing={3} w="full">
                <FormControl>
                  <FormLabel>Max Participants</FormLabel>
                  <Input type="number" value={form.max_participants || ''} onChange={setF('max_participants')} borderRadius="lg" />
                </FormControl>
                <FormControl>
                  <FormLabel>Budget</FormLabel>
                  <Input value={form.budget || ''} onChange={setF('budget')} placeholder="₱50,000" borderRadius="lg" />
                </FormControl>
              </SimpleGrid>
              <FormControl>
                <FormLabel>Location</FormLabel>
                <Input value={form.location || ''} onChange={setF('location')} borderRadius="lg" />
              </FormControl>
              <SimpleGrid columns={2} spacing={3} w="full">
                <FormControl>
                  <FormLabel>Start Date</FormLabel>
                  <Input type="date" value={form.start_date || ''} onChange={setF('start_date')} borderRadius="lg" />
                </FormControl>
                <FormControl>
                  <FormLabel>End Date</FormLabel>
                  <Input type="date" value={form.end_date || ''} onChange={setF('end_date')} borderRadius="lg" />
                </FormControl>
              </SimpleGrid>
              <FormControl>
                <FormLabel>Requirements</FormLabel>
                <Textarea value={form.requirements || ''} onChange={setF('requirements')} rows={2} borderRadius="lg" />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} borderRadius="lg">Cancel</Button>
            <Button colorScheme="green" onClick={handleSave} borderRadius="lg">
              {editing ? 'Save Changes' : 'Create Program'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Apply Modal */}
      <Modal isOpen={isAppOpen} onClose={onAppClose} size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="2xl" overflow="hidden">
          <Box h="4px" bgGradient="linear(to-r, green.400, teal.400)" />
          <ModalHeader>Apply for Program</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {/* Program Info */}
              <Box bg="green.50" p={3} borderRadius="xl" border="1px solid" borderColor="green.100">
                <Text fontSize="xs" fontWeight={700} color="green.600" mb={1} textTransform="uppercase">Program</Text>
                <Text fontWeight={700} color="gray.800">{applying?.title}</Text>
                {applying?.description && (
                  <Text fontSize="sm" color="gray.600" mt={1} noOfLines={2}>{applying.description}</Text>
                )}
                {applying?.requirements && (
                  <Box bg="yellow.50" p={2} borderRadius="lg" mt={2}>
                    <Text fontSize="xs" fontWeight={600} color="yellow.700" mb={0.5}>Requirements:</Text>
                    <Text fontSize="xs" color="yellow.800">{applying.requirements}</Text>
                  </Box>
                )}
              </Box>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight={600}>Business / Livelihood Name</FormLabel>
                <Input
                  value={appForm.business_name || ''} onChange={setAF('business_name')}
                  placeholder="Name of your business or project (optional)"
                  borderRadius="lg" focusBorderColor="green.400"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight={600}>
                  Brief Description / Proposal
                  <Badge ml={2} colorScheme="green" fontSize="9px">Recommended</Badge>
                </FormLabel>
                <Textarea
                  value={appForm.business_description || ''} onChange={setAF('business_description')}
                  rows={3} placeholder="Describe your livelihood plan, what you intend to do, and how the program will help you…"
                  borderRadius="lg" focusBorderColor="green.400"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight={600}>Requested Amount (₱)</FormLabel>
                <Input
                  type="number" value={appForm.requested_amount || ''} onChange={setAF('requested_amount')}
                  placeholder="Optional — leave blank if not requesting financial aid"
                  borderRadius="lg" focusBorderColor="green.400"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight={600}>Additional Notes</FormLabel>
                <Textarea
                  value={appForm.notes || ''} onChange={setAF('notes')}
                  rows={2} placeholder="Any other information you want to share with MSWD staff…"
                  borderRadius="lg" focusBorderColor="green.400"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAppClose} borderRadius="lg">Cancel</Button>
            <Button
              colorScheme="green" onClick={handleApply}
              isLoading={submitting} loadingText="Submitting…"
              borderRadius="lg"
            >
              Submit Application
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  )
}
