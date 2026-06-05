import { useEffect, useState } from 'react'
import {
  VStack, HStack, Heading, Text, Card, CardBody, Badge, Button, Box,
  Table, Thead, Tbody, Tr, Th, Td, TableContainer, Select, useToast,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, Textarea, FormControl, FormLabel, Skeleton, Flex, Wrap, WrapItem
} from '@chakra-ui/react'
import { applicationsApi, programsApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

const STATUS_COLOR: Record<string, string> = {
  pending: 'yellow', approved: 'green', rejected: 'red', withdrawn: 'gray'
}

export default function ApplicationsPage() {
  const { user } = useAuthStore()
  const [apps, setApps] = useState<any[]>([])
  const [programs, setPrograms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [reviewing, setReviewing] = useState<any>(null)
  const [reviewStatus, setReviewStatus] = useState('approved')
  const [reviewNotes, setReviewNotes] = useState('')
  const toast = useToast()
  const isStaff = user?.role === 'superadmin' || user?.role === 'admin'

  const load = () => {
    Promise.all([applicationsApi.list(), programsApi.list()])
      .then(([a, p]) => { setApps(a.data); setPrograms(p.data) })
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const getProgramTitle = (id: number) => programs.find((p) => p.id === id)?.title || `Program #${id}`

  const filtered = filter === 'all' ? apps : apps.filter((a) => a.status === filter)

  const openReview = (app: any) => { setReviewing(app); setReviewStatus('approved'); setReviewNotes('') }

  const handleReview = async () => {
    try {
      await applicationsApi.review(reviewing.id, reviewStatus, reviewNotes)
      toast({ title: `Application ${reviewStatus}`, status: 'success', duration: 2000 })
      setReviewing(null); load()
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.detail, status: 'error', duration: 4000 })
    }
  }

  const handleWithdraw = async (id: number) => {
    if (!confirm('Withdraw this application?')) return
    try {
      await applicationsApi.withdraw(id)
      toast({ title: 'Application withdrawn', status: 'info', duration: 2000 })
      load()
    } catch (err: any) {
      toast({ title: err.response?.data?.detail || 'Error', status: 'error', duration: 3000 })
    }
  }

  return (
    <VStack spacing={6} align="stretch">
      <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
        <Box>
          <Heading size="lg" color="gray.800">{isStaff ? 'Applications Management' : 'My Applications'}</Heading>
          <Text color="gray.500" fontSize="sm">
            {isStaff ? 'Review and process all program applications' : 'Track the status of your submitted applications'}
          </Text>
        </Box>
        <Wrap spacing={2}>
          {['all','pending','approved','rejected','withdrawn'].map((s) => (
            <WrapItem key={s}>
              <Button size="sm" variant={filter === s ? 'solid' : 'outline'}
                colorScheme={s === 'all' ? 'gray' : STATUS_COLOR[s] || 'gray'}
                onClick={() => setFilter(s)}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
                {s !== 'all' && <Badge ml={2} colorScheme={STATUS_COLOR[s]} variant="solid" borderRadius="full" fontSize="xs">
                  {apps.filter(a => a.status === s).length}
                </Badge>}
              </Button>
            </WrapItem>
          ))}
        </Wrap>
      </Flex>

      {loading ? (
        <VStack spacing={2}>{[1,2,3,4,5].map(i => <Skeleton key={i} h="60px" w="full" borderRadius="md" />)}</VStack>
      ) : filtered.length === 0 ? (
        <Card><CardBody textAlign="center" py={12}>
          <Text fontSize="lg" color="gray.400">No {filter === 'all' ? '' : filter + ' '}applications found</Text>
        </CardBody></Card>
      ) : (
        <Card>
          <CardBody>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>ID</Th>
                    {isStaff && <Th>Applicant ID</Th>}
                    <Th>Program</Th>
                    <Th>Status</Th>
                    <Th>Applied</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filtered.map((app) => (
                    <Tr key={app.id} _hover={{ bg: 'gray.50' }}>
                      <Td><Text fontSize="sm" color="gray.500">#{app.id}</Text></Td>
                      {isStaff && <Td><Text fontSize="sm">User #{app.user_id}</Text></Td>}
                      <Td><Text fontSize="sm" fontWeight={500} noOfLines={1}>{getProgramTitle(app.program_id)}</Text></Td>
                      <Td><Badge colorScheme={STATUS_COLOR[app.status]}>{app.status}</Badge></Td>
                      <Td><Text fontSize="xs" color="gray.500">{app.applied_at?.slice(0, 10)}</Text></Td>
                      <Td>
                        <HStack spacing={2}>
                          {isStaff && app.status === 'pending' && (
                            <Button size="xs" colorScheme="blue" onClick={() => openReview(app)}>Review</Button>
                          )}
                          {!isStaff && app.status === 'pending' && (
                            <Button size="xs" colorScheme="red" variant="outline" onClick={() => handleWithdraw(app.id)}>
                              Withdraw
                            </Button>
                          )}
                          {app.notes && (
                            <Button size="xs" variant="ghost" onClick={() => alert(`Notes: ${app.notes}`)}>Notes</Button>
                          )}
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>
      )}

      {/* Review Modal */}
      <Modal isOpen={!!reviewing} onClose={() => setReviewing(null)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Review Application #{reviewing?.id}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Box bg="gray.50" p={3} borderRadius="md" w="full">
                <Text fontSize="sm" color="gray.600">Program: <b>{getProgramTitle(reviewing?.program_id)}</b></Text>
                {reviewing?.business_name && <Text fontSize="sm" color="gray.600">Business: <b>{reviewing.business_name}</b></Text>}
                {reviewing?.requested_amount && <Text fontSize="sm" color="gray.600">Requested: <b>₱{reviewing.requested_amount}</b></Text>}
                {reviewing?.business_description && <Text fontSize="sm" color="gray.600" mt={2}>{reviewing.business_description}</Text>}
              </Box>
              <FormControl>
                <FormLabel>Decision</FormLabel>
                <Select value={reviewStatus} onChange={(e) => setReviewStatus(e.target.value)}>
                  <option value="approved">Approve</option>
                  <option value="rejected">Reject</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Notes / Feedback</FormLabel>
                <Textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Optional notes for the applicant..." rows={3} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setReviewing(null)}>Cancel</Button>
            <Button colorScheme={reviewStatus === 'approved' ? 'green' : 'red'} onClick={handleReview}>
              Confirm {reviewStatus === 'approved' ? 'Approval' : 'Rejection'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  )
}
