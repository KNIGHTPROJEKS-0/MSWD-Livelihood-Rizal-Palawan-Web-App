import { useEffect, useState } from 'react'
import {
  Box, VStack, HStack, Text, Badge, Button, Icon, Card, CardBody,
  SimpleGrid, Heading, Divider, Flex, Skeleton, useToast, Modal,
  ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  useDisclosure, Textarea, Select
} from '@chakra-ui/react'
import {
  MdDescription, MdAdd, MdCheckCircle, MdPendingActions, MdCancel,
  MdVisibility, MdSchedule, MdAssignment, MdFactCheck, MdUndo
} from 'react-icons/md'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { formsApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

const FORM_TYPE_LABELS: Record<string, string> = {
  assessment_tool: 'MSWD Form No. 3 – Assessment Tool',
  intake_assessment: 'Intake / Assessment Form',
  social_case_study: 'Social Case Study Report',
}

const STATUS_COLOR: Record<string, string> = {
  draft: 'gray',
  submitted: 'blue',
  under_review: 'orange',
  approved: 'green',
  rejected: 'red',
  returned: 'yellow',
}

const STATUS_ICON: Record<string, any> = {
  draft: MdDescription,
  submitted: MdPendingActions,
  under_review: MdSchedule,
  approved: MdCheckCircle,
  rejected: MdCancel,
  returned: MdUndo,
}

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
  returned: 'Returned for Revision',
}

export default function FormsPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const toast = useToast()
  const { isOpen: reviewOpen, onOpen: openReview, onClose: closeReview } = useDisclosure()
  const [forms, setForms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewing, setReviewing] = useState<any>(null)
  const [reviewStatus, setReviewStatus] = useState('under_review')
  const [reviewNotes, setReviewNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

  const load = () => {
    setLoading(true)
    formsApi.list().then(r => setForms(r.data)).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleReview = async () => {
    if (!reviewing) return
    setSubmitting(true)
    try {
      await formsApi.review(reviewing.id, reviewStatus, reviewNotes)
      toast({ title: 'Form reviewed successfully', status: 'success', duration: 3000 })
      closeReview()
      setReviewing(null)
      load()
    } catch {
      toast({ title: 'Failed to review form', status: 'error', duration: 3000 })
    } finally {
      setSubmitting(false)
    }
  }

  const pendingReview = forms.filter(f => f.status === 'submitted' || f.status === 'under_review').length
  const approved = forms.filter(f => f.status === 'approved').length
  const total = forms.length

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between" wrap="wrap" gap={3}>
        <VStack align="start" spacing={0}>
          <Heading size="md" color="gray.800">
            {isAdmin ? 'Form Submissions & Reviews' : 'My MSWD Forms'}
          </Heading>
          <Text fontSize="sm" color="gray.500">
            {isAdmin
              ? 'Review and process form submissions from beneficiaries'
              : 'Submit official MSWD forms for social welfare assistance'}
          </Text>
        </VStack>
        {!isAdmin && (
          <Button as={RouterLink} to="/dashboard/forms" colorScheme="primary" leftIcon={<MdAdd />} size="sm" borderRadius="lg">
            New Form
          </Button>
        )}
      </HStack>

      {/* Stats */}
      <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
        {[
          { label: isAdmin ? 'Total Submissions' : 'My Forms', value: total, color: 'blue' },
          { label: isAdmin ? 'Pending Review' : 'Pending/In Review', value: pendingReview, color: 'orange' },
          { label: 'Approved', value: approved, color: 'green' },
        ].map(s => (
          <Card key={s.label} borderRadius="xl" boxShadow="sm">
            <CardBody py={4}>
              <Text fontSize="2xl" fontWeight={800} color={`${s.color}.600`}>{s.value}</Text>
              <Text fontSize="xs" color="gray.500" fontWeight={600}>{s.label}</Text>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* New Form Options (beneficiary only) */}
      {!isAdmin && (
        <Card borderRadius="xl" boxShadow="sm" borderTopWidth={3} borderTopColor="primary.400">
          <CardBody>
            <Text fontWeight={700} color="gray.700" mb={4} fontSize="sm">Submit a New Form</Text>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
              {[
                { key: 'assessment', label: 'MSWD Form No. 3', sub: 'Individual/Family Assessment Tool', icon: MdAssignment, color: 'blue', to: '/dashboard/forms/new/assessment' },
                { key: 'intake', label: 'Intake/Assessment Form', sub: 'Social Case Record & Assessment', icon: MdDescription, color: 'teal', to: '/dashboard/forms/new/intake' },
                { key: 'social-case-study', label: 'Social Case Study Report', sub: 'Comprehensive Case Study', icon: MdFactCheck, color: 'purple', to: '/dashboard/forms/new/social-case-study' },
              ].map(f => (
                <Box
                  key={f.key}
                  as={RouterLink}
                  to={f.to}
                  p={4}
                  borderRadius="xl"
                  border="2px solid"
                  borderColor={`${f.color}.200`}
                  bg={`${f.color}.50`}
                  _hover={{ borderColor: `${f.color}.400`, bg: `${f.color}.100`, textDecoration: 'none', transform: 'translateY(-1px)' }}
                  transition="all 0.2s"
                  display="block"
                  cursor="pointer"
                >
                  <HStack spacing={3} align="start">
                    <Box bg={`${f.color}.100`} p={2} borderRadius="lg">
                      <Icon as={f.icon} color={`${f.color}.600`} boxSize={5} />
                    </Box>
                    <VStack align="start" spacing={0.5}>
                      <Text fontWeight={700} fontSize="sm" color={`${f.color}.800`}>{f.label}</Text>
                      <Text fontSize="xs" color={`${f.color}.600`}>{f.sub}</Text>
                    </VStack>
                  </HStack>
                </Box>
              ))}
            </SimpleGrid>
          </CardBody>
        </Card>
      )}

      {/* Forms List */}
      <Card borderRadius="xl" boxShadow="sm">
        <CardBody>
          <Text fontWeight={700} color="gray.700" mb={4} fontSize="sm">
            {isAdmin ? 'All Form Submissions' : 'My Submitted Forms'}
          </Text>
          {loading ? (
            <VStack spacing={3}>{[1, 2, 3].map(i => <Skeleton key={i} h="80px" borderRadius="xl" />)}</VStack>
          ) : forms.length === 0 ? (
            <Flex direction="column" align="center" py={10} gap={3}>
              <Icon as={MdDescription} boxSize={12} color="gray.200" />
              <Text color="gray.400" fontSize="sm">
                {isAdmin ? 'No form submissions yet.' : 'No forms submitted yet. Start by choosing a form type above.'}
              </Text>
            </Flex>
          ) : (
            <VStack spacing={3} align="stretch">
              {forms.map(form => (
                <Box
                  key={form.id}
                  p={4} borderRadius="xl" border="1px solid" borderColor="gray.100"
                  bg="white" _hover={{ borderColor: 'primary.200', bg: 'primary.50' }}
                  transition="all 0.15s"
                >
                  <HStack justify="space-between" wrap="wrap" gap={3}>
                    <HStack spacing={3} flex={1} minW={0}>
                      <Box bg={`${STATUS_COLOR[form.status]}.100`} p={2} borderRadius="lg" flexShrink={0}>
                        <Icon as={STATUS_ICON[form.status] || MdDescription}
                          color={`${STATUS_COLOR[form.status]}.500`} boxSize={4} />
                      </Box>
                      <VStack align="start" spacing={0.5} minW={0} flex={1}>
                        <Text fontWeight={700} fontSize="sm" color="gray.800" noOfLines={1}>
                          {FORM_TYPE_LABELS[form.form_type] || form.form_type}
                        </Text>
                        {isAdmin && (
                          <Text fontSize="xs" color="gray.500" noOfLines={1}>
                            {form.beneficiary_name} · {form.beneficiary_barangay || 'No barangay'}
                          </Text>
                        )}
                        <HStack spacing={2} flexWrap="wrap">
                          <Badge colorScheme={STATUS_COLOR[form.status]} borderRadius="full" fontSize="xs">
                            {STATUS_LABEL[form.status] || form.status}
                          </Badge>
                          {form.documents?.length > 0 && (
                            <Badge colorScheme="teal" borderRadius="full" fontSize="xs">
                              {form.documents.length} document{form.documents.length !== 1 ? 's' : ''}
                            </Badge>
                          )}
                          <Text fontSize="10px" color="gray.400">
                            {form.submitted_at ? `Submitted ${form.submitted_at.slice(0, 10)}` : `Created ${form.created_at?.slice(0, 10)}`}
                          </Text>
                        </HStack>
                        {form.admin_notes && (
                          <Text fontSize="xs" color="orange.600" fontStyle="italic" noOfLines={1} mt={0.5}>
                            Admin note: {form.admin_notes}
                          </Text>
                        )}
                      </VStack>
                    </HStack>
                    <HStack spacing={2} flexShrink={0}>
                      <Button
                        as={RouterLink}
                        to={`/dashboard/forms/${form.id}`}
                        size="xs" variant="outline" colorScheme="primary" leftIcon={<MdVisibility />} borderRadius="lg"
                      >
                        View
                      </Button>
                      {!isAdmin && form.status === 'submitted' && (
                        <Button
                          as={RouterLink}
                          to={`/dashboard/forms/${form.id}/documents`}
                          size="xs" colorScheme="teal" borderRadius="lg"
                        >
                          Upload Docs
                        </Button>
                      )}
                      {!isAdmin && (form.status === 'draft' || form.status === 'returned') && (
                        <Button
                          as={RouterLink}
                          to={`/dashboard/forms/${form.id}`}
                          size="xs" colorScheme="orange" borderRadius="lg"
                        >
                          Edit
                        </Button>
                      )}
                      {isAdmin && (form.status === 'submitted' || form.status === 'under_review') && (
                        <Button
                          size="xs" colorScheme="primary" borderRadius="lg"
                          onClick={() => { setReviewing(form); setReviewStatus('under_review'); setReviewNotes(''); openReview() }}
                        >
                          Review
                        </Button>
                      )}
                    </HStack>
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}
        </CardBody>
      </Card>

      {/* Review Modal */}
      <Modal isOpen={reviewOpen} onClose={closeReview} size="md">
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader fontSize="md">Review Form Submission</ModalHeader>
          <ModalCloseButton />
          <Divider />
          <ModalBody pb={6} pt={4}>
            <VStack spacing={4} align="stretch">
              {reviewing && (
                <Box bg="gray.50" p={3} borderRadius="lg">
                  <Text fontSize="sm" fontWeight={700}>{FORM_TYPE_LABELS[reviewing.form_type]}</Text>
                  <Text fontSize="xs" color="gray.500">By: {reviewing.beneficiary_name}</Text>
                </Box>
              )}
              <Box>
                <Text fontSize="sm" fontWeight={600} mb={2}>Decision</Text>
                <Select value={reviewStatus} onChange={e => setReviewStatus(e.target.value)} borderRadius="lg" size="sm">
                  <option value="under_review">Mark as Under Review</option>
                  <option value="approved">Approve</option>
                  <option value="rejected">Reject</option>
                  <option value="returned">Return for Revision</option>
                </Select>
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight={600} mb={2}>Notes / Remarks</Text>
                <Textarea
                  value={reviewNotes}
                  onChange={e => setReviewNotes(e.target.value)}
                  placeholder="Add notes or feedback for the beneficiary..."
                  size="sm" borderRadius="lg" rows={3}
                />
              </Box>
              <HStack justify="flex-end" spacing={2}>
                <Button variant="ghost" size="sm" onClick={closeReview}>Cancel</Button>
                <Button colorScheme="primary" size="sm" isLoading={submitting} onClick={handleReview} borderRadius="lg">
                  Submit Review
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  )
}
