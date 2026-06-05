import { useEffect, useState } from 'react'
import {
  VStack, HStack, Heading, Text, Card, CardBody, CardHeader, Button,
  Badge, SimpleGrid, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, ModalCloseButton, FormControl, FormLabel,
  Input, Textarea, Select, useDisclosure, useToast, Icon, Box,
  Skeleton, Flex, NumberInput, NumberInputField
} from '@chakra-ui/react'
import { MdAdd, MdWork, MdEdit, MdDelete } from 'react-icons/md'
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
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<any>({})
  const [editing, setEditing] = useState<any>(null)
  const [applying, setApplying] = useState<any>(null)
  const [appForm, setAppForm] = useState<any>({})
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isAppOpen, onOpen: onAppOpen, onClose: onAppClose } = useDisclosure()
  const toast = useToast()
  const isStaff = user?.role === 'superadmin' || user?.role === 'admin'

  const loadPrograms = () => {
    programsApi.list().then((res) => setPrograms(res.data.filter((p: any) => p.status !== 'deleted'))).finally(() => setLoading(false))
  }
  useEffect(() => { loadPrograms() }, [])

  const openCreate = () => { setEditing(null); setForm({}); onOpen() }
  const openEdit = (p: any) => {
    setEditing(p); setForm({ title: p.title, description: p.description, category: p.category,
      status: p.status, max_participants: p.max_participants, location: p.location,
      requirements: p.requirements, budget: p.budget, start_date: p.start_date, end_date: p.end_date })
    onOpen()
  }
  const openApply = (p: any) => { setApplying(p); setAppForm({}); onAppOpen() }

  const handleSave = async () => {
    try {
      if (editing) await programsApi.update(editing.id, form)
      else await programsApi.create(form)
      toast({ title: editing ? 'Program updated' : 'Program created', status: 'success', duration: 2000 })
      onClose(); loadPrograms()
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.detail, status: 'error', duration: 4000 })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this program?')) return
    try {
      await programsApi.delete(id)
      toast({ title: 'Program deleted', status: 'info', duration: 2000 })
      loadPrograms()
    } catch { toast({ title: 'Error deleting', status: 'error', duration: 3000 }) }
  }

  const handleApply = async () => {
    try {
      await applicationsApi.create({ program_id: applying.id, ...appForm })
      toast({ title: 'Application submitted!', status: 'success', duration: 2000 })
      onAppClose()
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.detail, status: 'error', duration: 4000 })
    }
  }

  const setF = (k: string) => (e: any) => setForm((f: any) => ({ ...f, [k]: e.target.value }))
  const setAF = (k: string) => (e: any) => setAppForm((f: any) => ({ ...f, [k]: e.target.value }))

  return (
    <VStack spacing={6} align="stretch">
      <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
        <Box>
          <Heading size="lg" color="gray.800">{isStaff ? 'Program Management' : 'Available Programs'}</Heading>
          <Text color="gray.500" fontSize="sm">{isStaff ? 'Create and manage livelihood programs' : 'Browse and apply for livelihood assistance programs'}</Text>
        </Box>
        {isStaff && (
          <Button colorScheme="green" leftIcon={<MdAdd />} onClick={openCreate}>New Program</Button>
        )}
      </Flex>

      {loading ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} h="200px" borderRadius="lg" />)}
        </SimpleGrid>
      ) : programs.length === 0 ? (
        <Card><CardBody textAlign="center" py={12}>
          <Icon as={MdWork} boxSize={12} color="gray.300" mb={3} />
          <Heading size="sm" color="gray.500">No programs available</Heading>
          {isStaff && <Button mt={4} colorScheme="green" leftIcon={<MdAdd />} onClick={openCreate}>Create First Program</Button>}
        </CardBody></Card>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {programs.map((p) => (
            <Card key={p.id} _hover={{ shadow: 'md', transform: 'translateY(-2px)' }} transition="all 0.2s">
              <CardHeader pb={2}>
                <HStack justify="space-between" align="start">
                  <Heading size="sm" noOfLines={2} flex={1}>{p.title}</Heading>
                  <Badge colorScheme={STATUS_COLOR[p.status] || 'gray'} flexShrink={0}>{p.status}</Badge>
                </HStack>
                {p.category && <Badge colorScheme="purple" variant="subtle" mt={1} fontSize="xs">{p.category}</Badge>}
              </CardHeader>
              <CardBody pt={0}>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600" noOfLines={3}>{p.description || 'No description provided.'}</Text>
                  {p.location && <Text fontSize="xs" color="gray.500">📍 {p.location}</Text>}
                  {p.max_participants && (
                    <Text fontSize="xs" color="gray.500">
                      👥 {p.current_participants || 0} / {p.max_participants} participants
                    </Text>
                  )}
                  {p.start_date && <Text fontSize="xs" color="gray.500">📅 {p.start_date} – {p.end_date || 'TBD'}</Text>}
                  {p.budget && <Text fontSize="xs" color="green.600" fontWeight={600}>💰 {p.budget}</Text>}
                  <HStack pt={2} w="full" justify="flex-end" spacing={2}>
                    {isStaff ? (
                      <>
                        <Button size="sm" leftIcon={<MdEdit />} variant="outline" onClick={() => openEdit(p)}>Edit</Button>
                        {user?.role === 'superadmin' && (
                          <Button size="sm" leftIcon={<MdDelete />} colorScheme="red" variant="outline" onClick={() => handleDelete(p.id)}>Delete</Button>
                        )}
                      </>
                    ) : (
                      <Button size="sm" colorScheme="green" onClick={() => openApply(p)} isDisabled={p.status !== 'active'}>
                        Apply Now
                      </Button>
                    )}
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editing ? 'Edit Program' : 'Create New Program'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired><FormLabel>Title</FormLabel>
                <Input value={form.title || ''} onChange={setF('title')} placeholder="Program name" /></FormControl>
              <FormControl><FormLabel>Description</FormLabel>
                <Textarea value={form.description || ''} onChange={setF('description')} rows={3} /></FormControl>
              <SimpleGrid columns={2} spacing={3} w="full">
                <FormControl><FormLabel>Category</FormLabel>
                  <Select value={form.category || ''} onChange={setF('category')} placeholder="Select category">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </Select></FormControl>
                <FormControl><FormLabel>Status</FormLabel>
                  <Select value={form.status || 'active'} onChange={setF('status')}>
                    <option value="upcoming">Upcoming</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </Select></FormControl>
              </SimpleGrid>
              <SimpleGrid columns={2} spacing={3} w="full">
                <FormControl><FormLabel>Max Participants</FormLabel>
                  <Input type="number" value={form.max_participants || ''} onChange={setF('max_participants')} /></FormControl>
                <FormControl><FormLabel>Budget</FormLabel>
                  <Input value={form.budget || ''} onChange={setF('budget')} placeholder="e.g. ₱50,000" /></FormControl>
              </SimpleGrid>
              <FormControl><FormLabel>Location</FormLabel>
                <Input value={form.location || ''} onChange={setF('location')} /></FormControl>
              <SimpleGrid columns={2} spacing={3} w="full">
                <FormControl><FormLabel>Start Date</FormLabel>
                  <Input type="date" value={form.start_date || ''} onChange={setF('start_date')} /></FormControl>
                <FormControl><FormLabel>End Date</FormLabel>
                  <Input type="date" value={form.end_date || ''} onChange={setF('end_date')} /></FormControl>
              </SimpleGrid>
              <FormControl><FormLabel>Requirements</FormLabel>
                <Textarea value={form.requirements || ''} onChange={setF('requirements')} rows={2} /></FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
            <Button colorScheme="green" onClick={handleSave}>{editing ? 'Save Changes' : 'Create Program'}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Apply Modal */}
      <Modal isOpen={isAppOpen} onClose={onAppClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Apply for: {applying?.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text fontSize="sm" color="gray.600">{applying?.description}</Text>
              {applying?.requirements && (
                <Box bg="yellow.50" p={3} borderRadius="md" w="full">
                  <Text fontSize="xs" fontWeight={600} color="yellow.700" mb={1}>Requirements:</Text>
                  <Text fontSize="sm" color="yellow.800">{applying.requirements}</Text>
                </Box>
              )}
              <FormControl><FormLabel>Business / Livelihood Name</FormLabel>
                <Input value={appForm.business_name || ''} onChange={setAF('business_name')} placeholder="Optional" /></FormControl>
              <FormControl><FormLabel>Brief Description / Proposal</FormLabel>
                <Textarea value={appForm.business_description || ''} onChange={setAF('business_description')} rows={3} placeholder="Describe your livelihood plan..." /></FormControl>
              <FormControl><FormLabel>Requested Amount (₱)</FormLabel>
                <Input type="number" value={appForm.requested_amount || ''} onChange={setAF('requested_amount')} placeholder="Optional" /></FormControl>
              <FormControl><FormLabel>Additional Notes</FormLabel>
                <Textarea value={appForm.notes || ''} onChange={setAF('notes')} rows={2} /></FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAppClose}>Cancel</Button>
            <Button colorScheme="green" onClick={handleApply}>Submit Application</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  )
}
