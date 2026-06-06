import { useEffect, useState } from 'react'
import {
  VStack, HStack, Heading, Text, Card, CardBody, Badge, Button, Box,
  Table, Thead, Tbody, Tr, Th, Td, TableContainer, Select, useToast,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, Textarea, FormControl, FormLabel, Skeleton, Flex,
  Wrap, WrapItem, Avatar, Icon, Divider, SimpleGrid
} from '@chakra-ui/react'
import {
  MdAssignment, MdCheckCircle, MdCancel, MdPendingActions,
  MdPerson, MdLocationOn, MdEmail, MdBusiness, MdAttachMoney
} from 'react-icons/md'
import { applicationsApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

const STATUS_COLOR: Record<string, string> = {
  pending: 'yellow', approved: 'green', rejected: 'red', withdrawn: 'gray'
}
const STATUS_ICON: Record<string, any> = {
  pending: MdPendingActions, approved: MdCheckCircle,
  rejected: MdCancel, withdrawn: MdCancel,
}

export default function ApplicationsPage() {
  const { user } = useAuthStore()
  const [apps, setApps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [viewing, setViewing] = useState<any>(null)
  const [reviewing, setReviewing] = useState<any>(null)
  const [reviewStatus, setReviewStatus] = useState('approved')
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)
  const toast = useToast()
  const isStaff = user?.role === 'superadmin' || user?.role === 'admin'

  const load = () => {
    applicationsApi.list()
      .then((a) => setApps(a.data))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const filtered = filter === 'all' ? apps : apps.filter((a) => a.status === filter)

  const openView = (app: any) => setViewing(app)
  const openReview = (app: any) => {
    setReviewing(app)
    setReviewStatus('approved')
    setReviewNotes('')
  }

  const handleReview = async () => {
    setReviewLoading(true)
    try {
      await applicationsApi.review(reviewing.id, reviewStatus, reviewNotes)
      toast({
        title: reviewStatus === 'approved' ? '✅ Application Approved' : '❌ Application Rejected',
        description: `${reviewing.applicant_name}'s application has been ${reviewStatus}.`,
        status: reviewStatus === 'approved' ? 'success' : 'warning',
        duration: 3000,
        isClosable: true,
      })
      setReviewing(null)
      load()
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.detail, status: 'error', duration: 4000 })
    } finally {
      setReviewLoading(false)
    }
  }

  const handleWithdraw = async (id: number, programTitle: string) => {
    if (!confirm(`Withdraw your application for "${programTitle}"?`)) return
    try {
      await applicationsApi.withdraw(id)
      toast({ title: 'Application withdrawn', status: 'info', duration: 2000 })
      load()
    } catch (err: any) {
      toast({ title: err.response?.data?.detail || 'Error', status: 'error', duration: 3000 })
    }
  }

  const countByStatus = (s: string) => apps.filter((a) => a.status === s).length

  return (
    <VStack spacing={6} align="stretch">

      {/* Header */}
      <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
        <Box>
          <Heading size="lg" color="gray.800">
            {isStaff ? 'Applications Management' : 'My Applications'}
          </Heading>
          <Text color="gray.500" fontSize="sm">
            {isStaff
              ? 'Review and process all beneficiary program applications'
              : 'Track the status of your submitted program applications'}
          </Text>
        </Box>
      </Flex>

      {/* Summary Stat Chips */}
      <HStack spacing={3} flexWrap="wrap">
        {[
          { label: 'All', value: apps.length, color: 'gray' },
          { label: 'Pending', value: countByStatus('pending'), color: 'orange' },
          { label: 'Approved', value: countByStatus('approved'), color: 'green' },
          { label: 'Rejected', value: countByStatus('rejected'), color: 'red' },
          { label: 'Withdrawn', value: countByStatus('withdrawn'), color: 'gray' },
        ].map((s) => (
          <Button
            key={s.label}
            size="sm"
            variant={filter === s.label.toLowerCase() ? 'solid' : 'outline'}
            colorScheme={s.color}
            borderRadius="full"
            onClick={() => setFilter(s.label === 'All' ? 'all' : s.label.toLowerCase())}
          >
            {s.label}
            <Badge
              ml={2} colorScheme={s.color}
              variant={filter === s.label.toLowerCase() ? 'solid' : 'subtle'}
              borderRadius="full" fontSize="xs"
            >
              {s.value}
            </Badge>
          </Button>
        ))}
      </HStack>

      {/* Table */}
      {loading ? (
        <VStack spacing={2}>{[1,2,3,4,5].map(i => <Skeleton key={i} h="56px" w="full" borderRadius="lg" />)}</VStack>
      ) : filtered.length === 0 ? (
        <Card borderRadius="xl">
          <CardBody textAlign="center" py={12}>
            <Icon as={MdAssignment} boxSize={12} color="gray.200" mb={3} />
            <Text color="gray.400" fontSize="md">
              No {filter === 'all' ? '' : filter + ' '}applications found
            </Text>
            {!isStaff && filter === 'all' && (
              <Text color="gray.400" fontSize="sm" mt={1}>
                Browse programs and submit your first application!
              </Text>
            )}
          </CardBody>
        </Card>
      ) : (
        <Card borderRadius="xl" boxShadow="sm">
          <CardBody p={0} overflow="hidden">
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>#</Th>
                    {isStaff && <Th>Applicant</Th>}
                    <Th>Program</Th>
                    <Th>Status</Th>
                    <Th>Submitted</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filtered.map((app) => (
                    <Tr key={app.id}
                      _hover={{ bg: app.status === 'pending' && isStaff ? 'orange.50' : 'gray.50' }}
                      bg={app.status === 'pending' && isStaff ? 'orange.25' : 'white'}
                    >
                      <Td>
                        <Text fontSize="xs" color="gray.400" fontWeight={500}>#{app.id}</Text>
                      </Td>
                      {isStaff && (
                        <Td>
                          <HStack spacing={2}>
                            <Avatar size="xs" name={app.applicant_name} bg="blue.400" color="white" />
                            <VStack align="start" spacing={0}>
                              <Text fontSize="sm" fontWeight={600}>{app.applicant_name}</Text>
                              {app.applicant_barangay && (
                                <Text fontSize="10px" color="gray.400">Brgy. {app.applicant_barangay}</Text>
                              )}
                            </VStack>
                          </HStack>
                        </Td>
                      )}
                      <Td>
                        <Text fontSize="sm" fontWeight={500} noOfLines={1}>
                          {app.program_title || `Program #${app.program_id}`}
                        </Text>
                        {app.business_name && (
                          <Text fontSize="xs" color="gray.400" noOfLines={1}>"{app.business_name}"</Text>
                        )}
                      </Td>
                      <Td>
                        <HStack spacing={1}>
                          <Icon as={STATUS_ICON[app.status] || MdAssignment}
                            color={`${STATUS_COLOR[app.status]}.500`} boxSize={3.5} />
                          <Badge colorScheme={STATUS_COLOR[app.status]} borderRadius="full" px={2} fontSize="xs">
                            {app.status}
                          </Badge>
                        </HStack>
                      </Td>
                      <Td>
                        <Text fontSize="xs" color="gray.400">{app.applied_at?.slice(0, 10)}</Text>
                      </Td>
                      <Td>
                        <HStack spacing={1}>
                          <Button size="xs" variant="ghost" colorScheme="blue" borderRadius="lg"
                            onClick={() => openView(app)}>
                            View
                          </Button>
                          {isStaff && app.status === 'pending' && (
                            <Button size="xs" colorScheme="blue" borderRadius="lg"
                              onClick={() => openReview(app)}>
                              Review
                            </Button>
                          )}
                          {!isStaff && app.status === 'pending' && (
                            <Button size="xs" colorScheme="red" variant="outline" borderRadius="lg"
                              onClick={() => handleWithdraw(app.id, app.program_title)}>
                              Withdraw
                            </Button>
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

      {/* ── View Application Detail Modal ── */}
      <Modal isOpen={!!viewing} onClose={() => setViewing(null)} size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="2xl" overflow="hidden">
          <Box h="4px" bgGradient={`linear(to-r, ${STATUS_COLOR[viewing?.status]}.400, ${STATUS_COLOR[viewing?.status]}.600)`} />
          <ModalHeader pb={1}>
            <HStack>
              <Icon as={STATUS_ICON[viewing?.status] || MdAssignment}
                color={`${STATUS_COLOR[viewing?.status]}.500`} boxSize={5} />
              <Text>Application #{viewing?.id}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={5}>
            <VStack spacing={4} align="stretch">
              {/* Status */}
              <HStack justify="space-between">
                <Badge colorScheme={STATUS_COLOR[viewing?.status]} borderRadius="full" px={3} py={1} fontSize="sm">
                  {viewing?.status?.toUpperCase()}
                </Badge>
                <Text fontSize="xs" color="gray.400">
                  Submitted: {viewing?.applied_at?.slice(0, 10)}
                </Text>
              </HStack>

              <Divider />

              {/* Applicant info (staff only) */}
              {isStaff && viewing?.applicant_name && (
                <Box bg="blue.50" p={3} borderRadius="xl">
                  <Text fontSize="xs" fontWeight={700} color="blue.600" mb={2} textTransform="uppercase">
                    Applicant
                  </Text>
                  <SimpleGrid columns={2} spacing={2}>
                    <HStack spacing={1}>
                      <Icon as={MdPerson} color="blue.400" boxSize={4} />
                      <Text fontSize="sm" color="gray.700">{viewing.applicant_name}</Text>
                    </HStack>
                    {viewing.applicant_barangay && (
                      <HStack spacing={1}>
                        <Icon as={MdLocationOn} color="blue.400" boxSize={4} />
                        <Text fontSize="sm" color="gray.700">Brgy. {viewing.applicant_barangay}</Text>
                      </HStack>
                    )}
                    {viewing.applicant_email && (
                      <HStack spacing={1}>
                        <Icon as={MdEmail} color="blue.400" boxSize={4} />
                        <Text fontSize="sm" color="gray.700">{viewing.applicant_email}</Text>
                      </HStack>
                    )}
                  </SimpleGrid>
                </Box>
              )}

              {/* Program */}
              <Box bg="green.50" p={3} borderRadius="xl">
                <Text fontSize="xs" fontWeight={700} color="green.600" mb={1} textTransform="uppercase">
                  Program Applied To
                </Text>
                <Text fontSize="sm" fontWeight={600} color="gray.800">
                  {viewing?.program_title || `Program #${viewing?.program_id}`}
                </Text>
              </Box>

              {/* Business / Livelihood Details */}
              {(viewing?.business_name || viewing?.business_description || viewing?.requested_amount) && (
                <Box bg="gray.50" p={3} borderRadius="xl">
                  <Text fontSize="xs" fontWeight={700} color="gray.500" mb={2} textTransform="uppercase">
                    Application Details
                  </Text>
                  {viewing?.business_name && (
                    <HStack spacing={1} mb={1}>
                      <Icon as={MdBusiness} color="gray.400" boxSize={4} />
                      <Text fontSize="sm" fontWeight={600} color="gray.700">{viewing.business_name}</Text>
                    </HStack>
                  )}
                  {viewing?.business_description && (
                    <Text fontSize="sm" color="gray.600" mt={1} lineHeight={1.7}>
                      {viewing.business_description}
                    </Text>
                  )}
                  {viewing?.requested_amount && (
                    <HStack spacing={1} mt={2}>
                      <Icon as={MdAttachMoney} color="green.500" boxSize={4} />
                      <Text fontSize="sm" fontWeight={600} color="green.700">
                        ₱{viewing.requested_amount.toLocaleString()} requested
                      </Text>
                    </HStack>
                  )}
                </Box>
              )}

              {/* Notes / Feedback */}
              {viewing?.notes && (
                <Box
                  bg={viewing.status === 'rejected' ? 'red.50' : viewing.status === 'approved' ? 'green.50' : 'yellow.50'}
                  p={3} borderRadius="xl"
                  border="1px solid"
                  borderColor={viewing.status === 'rejected' ? 'red.200' : viewing.status === 'approved' ? 'green.200' : 'yellow.200'}
                >
                  <Text fontSize="xs" fontWeight={700}
                    color={viewing.status === 'rejected' ? 'red.600' : viewing.status === 'approved' ? 'green.600' : 'yellow.700'}
                    mb={1} textTransform="uppercase">
                    {isStaff ? 'Notes / Remarks' : 'Feedback from MSWD Staff'}
                  </Text>
                  <Text fontSize="sm" color="gray.700" lineHeight={1.7}>{viewing.notes}</Text>
                </Box>
              )}

              {/* Review date */}
              {viewing?.reviewed_at && (
                <Text fontSize="xs" color="gray.400" textAlign="right">
                  Reviewed on: {viewing.reviewed_at?.slice(0, 10)}
                </Text>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter pt={0}>
            {isStaff && viewing?.status === 'pending' && (
              <Button colorScheme="blue" mr={3} borderRadius="lg" size="sm"
                onClick={() => { setViewing(null); openReview(viewing) }}>
                Review This Application
              </Button>
            )}
            <Button variant="ghost" onClick={() => setViewing(null)} borderRadius="lg">Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ── Review Modal ── */}
      <Modal isOpen={!!reviewing} onClose={() => setReviewing(null)} size="md">
        <ModalOverlay />
        <ModalContent borderRadius="2xl" overflow="hidden">
          <Box h="4px" bgGradient="linear(to-r, blue.400, blue.600)" />
          <ModalHeader>Review Application #{reviewing?.id}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {reviewing?.applicant_name && (
                <Box bg="gray.50" p={3} borderRadius="xl">
                  <HStack spacing={2}>
                    <Avatar size="sm" name={reviewing.applicant_name} bg="blue.400" color="white" />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight={600} fontSize="sm">{reviewing.applicant_name}</Text>
                      <Text fontSize="xs" color="gray.500">{reviewing.program_title}</Text>
                    </VStack>
                  </HStack>
                  {reviewing?.business_name && (
                    <Text fontSize="xs" color="gray.500" mt={2}>
                      Business: <b>{reviewing.business_name}</b>
                      {reviewing?.requested_amount ? ` • ₱${reviewing.requested_amount?.toLocaleString()}` : ''}
                    </Text>
                  )}
                  {reviewing?.business_description && (
                    <Text fontSize="xs" color="gray.600" mt={1} lineHeight={1.6}>
                      {reviewing.business_description}
                    </Text>
                  )}
                </Box>
              )}

              <FormControl>
                <FormLabel fontSize="sm" fontWeight={600}>Decision</FormLabel>
                <Select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                  borderRadius="lg"
                  focusBorderColor="blue.400"
                >
                  <option value="approved">✅ Approve — Accept this application</option>
                  <option value="rejected">❌ Reject — Decline this application</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight={600}>
                  Notes / Feedback for Applicant
                  <Text as="span" fontSize="xs" color="gray.400" fontWeight={400} ml={1}>(optional)</Text>
                </FormLabel>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder={
                    reviewStatus === 'approved'
                      ? 'e.g. Congratulations! Please come to the MSWD office on...'
                      : 'e.g. Application incomplete. Please reapply with complete requirements...'
                  }
                  rows={3}
                  borderRadius="lg"
                  focusBorderColor="blue.400"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setReviewing(null)} borderRadius="lg">
              Cancel
            </Button>
            <Button
              colorScheme={reviewStatus === 'approved' ? 'green' : 'red'}
              onClick={handleReview}
              isLoading={reviewLoading}
              loadingText="Processing…"
              borderRadius="lg"
              leftIcon={<Icon as={reviewStatus === 'approved' ? MdCheckCircle : MdCancel} />}
            >
              {reviewStatus === 'approved' ? 'Approve Application' : 'Reject Application'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  )
}
