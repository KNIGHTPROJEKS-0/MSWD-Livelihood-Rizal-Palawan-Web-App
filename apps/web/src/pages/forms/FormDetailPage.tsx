import { useEffect, useState } from 'react'
import {
  Box, VStack, HStack, Text, Badge, Button, Icon, Card, CardBody,
  Heading, Divider, Flex, Spinner, useToast, Image, Link,
  SimpleGrid, Select, Textarea, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalBody, ModalCloseButton, useDisclosure
} from '@chakra-ui/react'
import { MdArrowBack, MdDescription, MdDownload, MdCheckCircle, MdCancel } from 'react-icons/md'
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom'
import { formsApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

const FORM_TYPE_LABELS: Record<string, string> = {
  assessment_tool: 'MSWD Form No. 3 – Individual/Family Assessment Tool',
  intake_assessment: 'Intake / Assessment Form (Social Case Record)',
  social_case_study: 'Social Case Study Report',
}

const STATUS_COLOR: Record<string, string> = {
  draft: 'gray', submitted: 'blue', under_review: 'orange',
  approved: 'green', rejected: 'red', returned: 'yellow',
}

const DOC_LABELS: Record<string, string> = {
  barangay_certificate: 'Barangay Certificate of Indigency',
  medical_certificate: 'Medical Certificate / Abstract',
  government_id: 'Valid Government ID',
  hospital_bill: 'Hospital Bill or Receipt',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box>
      <Text fontWeight={700} fontSize="sm" color="primary.700" textTransform="uppercase" letterSpacing="wider" mb={2}>
        {title}
      </Text>
      <Box bg="gray.50" p={4} borderRadius="xl" border="1px solid" borderColor="gray.100">
        {children}
      </Box>
    </Box>
  )
}

function Field({ label, value }: { label: string; value: any }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <Box>
      <Text fontSize="xs" color="gray.500" fontWeight={600}>{label}</Text>
      <Text fontSize="sm" color="gray.800">{String(value)}</Text>
    </Box>
  )
}

function renderFormData(formType: string, data: any) {
  if (!data || Object.keys(data).length === 0) return <Text color="gray.400" fontSize="sm">No data filled in yet.</Text>

  if (formType === 'assessment_tool') {
    return (
      <VStack spacing={4} align="stretch">
        {data.personal && (
          <Section title="Personal Information">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
              <Field label="Full Name" value={`${data.personal.last_name || ''}, ${data.personal.first_name || ''} ${data.personal.middle_name || ''}`.trim()} />
              <Field label="Date of Birth" value={data.personal.date_of_birth} />
              <Field label="Age" value={data.personal.age} />
              <Field label="Sex" value={data.personal.sex} />
              <Field label="Civil Status" value={data.personal.civil_status} />
              <Field label="Religion" value={data.personal.religion} />
              <Field label="Educational Attainment" value={data.personal.educational_attainment} />
              <Field label="Occupation" value={data.personal.occupation} />
              <Field label="Monthly Income" value={data.personal.monthly_income ? `PHP ${data.personal.monthly_income}` : null} />
              <Field label="Contact Number" value={data.personal.contact_number} />
            </SimpleGrid>
          </Section>
        )}
        {data.address && (
          <Section title="Address">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
              <Field label="House / Street" value={data.address.house_street} />
              <Field label="Barangay" value={data.address.barangay} />
              <Field label="Municipality" value={data.address.municipality} />
              <Field label="Province" value={data.address.province} />
            </SimpleGrid>
          </Section>
        )}
        {data.family_composition?.length > 0 && (
          <Section title="Family Composition">
            {data.family_composition.map((m: any, i: number) => (
              <Box key={i} p={2} bg="white" borderRadius="lg" mb={2} border="1px solid" borderColor="gray.100">
                <Text fontSize="sm" fontWeight={600}>{m.name} ({m.relationship})</Text>
                <Text fontSize="xs" color="gray.500">Age: {m.age} · Sex: {m.sex} · Occupation: {m.occupation}</Text>
              </Box>
            ))}
          </Section>
        )}
        {data.problems && (
          <Section title="Problem Identified">
            <Field label="Description" value={data.problems.description} />
            <Field label="Duration" value={data.problems.duration} />
            {data.problems.types?.length > 0 && (
              <Box mt={1}>
                <Text fontSize="xs" color="gray.500" fontWeight={600}>Types</Text>
                <HStack wrap="wrap" mt={1}>{data.problems.types.map((t: string) => <Badge key={t} colorScheme="orange" fontSize="xs">{t}</Badge>)}</HStack>
              </Box>
            )}
          </Section>
        )}
        {data.assessment && (
          <Section title="Assessment & Recommendations">
            <Field label="Assessment" value={data.assessment.assessment_notes} />
            <Field label="Remarks" value={data.assessment.remarks} />
            {data.assessment.recommended_services?.length > 0 && (
              <Box mt={1}>
                <Text fontSize="xs" color="gray.500" fontWeight={600}>Recommended Services</Text>
                <HStack wrap="wrap" mt={1}>{data.assessment.recommended_services.map((s: string) => <Badge key={s} colorScheme="green" fontSize="xs">{s}</Badge>)}</HStack>
              </Box>
            )}
          </Section>
        )}
      </VStack>
    )
  }

  if (formType === 'intake_assessment') {
    return (
      <VStack spacing={4} align="stretch">
        {data.case_info && (
          <Section title="Case Information">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
              <Field label="Case Number" value={data.case_info.case_number} />
              <Field label="Date" value={data.case_info.date} />
              <Field label="Referred By" value={data.case_info.referred_by} />
              <Field label="Source of Referral" value={data.case_info.source_of_referral} />
            </SimpleGrid>
          </Section>
        )}
        {data.personal && (
          <Section title="Personal Data">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
              <Field label="Full Name" value={`${data.personal.last_name || ''}, ${data.personal.first_name || ''}`.trim()} />
              <Field label="Age" value={data.personal.age} />
              <Field label="Sex" value={data.personal.sex} />
              <Field label="Civil Status" value={data.personal.civil_status} />
              <Field label="Contact Number" value={data.personal.contact_number} />
            </SimpleGrid>
          </Section>
        )}
        {data.presenting_problem && (
          <Section title="Presenting Problem">
            <Field label="Type of Case" value={data.presenting_problem.type_of_case} />
            <Field label="Nature of Problem" value={data.presenting_problem.nature_of_problem} />
            <Field label="Brief Background" value={data.presenting_problem.brief_background} />
          </Section>
        )}
        {data.initial_assessment && (
          <Section title="Initial Assessment">
            <Text fontSize="sm">{data.initial_assessment}</Text>
          </Section>
        )}
      </VStack>
    )
  }

  if (formType === 'social_case_study') {
    return (
      <VStack spacing={4} align="stretch">
        {data.identifying_info && (
          <Section title="Identifying Information">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
              <Field label="Name" value={data.identifying_info.name} />
              <Field label="Age" value={data.identifying_info.age} />
              <Field label="Sex" value={data.identifying_info.sex} />
              <Field label="Civil Status" value={data.identifying_info.civil_status} />
              <Field label="Address" value={data.identifying_info.address} />
            </SimpleGrid>
          </Section>
        )}
        {data.presenting_problem && <Section title="Presenting Problem"><Text fontSize="sm">{data.presenting_problem}</Text></Section>}
        {data.problem_analysis && <Section title="Problem Analysis"><Text fontSize="sm">{data.problem_analysis}</Text></Section>}
        {data.recommendations && <Section title="Recommendations"><Text fontSize="sm">{data.recommendations}</Text></Section>}
        {data.case_plan && (
          <Section title="Case Plan">
            <Field label="Goals" value={data.case_plan.goals} />
            <Field label="Objectives" value={data.case_plan.objectives} />
            <Field label="Interventions" value={data.case_plan.interventions} />
          </Section>
        )}
      </VStack>
    )
  }

  return (
    <Box>
      <Text fontSize="xs" color="gray.400" fontFamily="mono" whiteSpace="pre-wrap">
        {JSON.stringify(data, null, 2)}
      </Text>
    </Box>
  )
}

export default function FormDetailPage() {
  const { formId } = useParams<{ formId: string }>()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [form, setForm] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [reviewStatus, setReviewStatus] = useState('under_review')
  const [reviewNotes, setReviewNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

  useEffect(() => {
    if (!formId) return
    formsApi.get(Number(formId)).then(r => setForm(r.data)).catch(() => navigate('/dashboard/forms')).finally(() => setLoading(false))
  }, [formId])

  const handleReview = async () => {
    setSubmitting(true)
    try {
      await formsApi.review(Number(formId), reviewStatus, reviewNotes)
      toast({ title: 'Review submitted', status: 'success', duration: 3000 })
      onClose()
      formsApi.get(Number(formId)).then(r => setForm(r.data))
    } catch {
      toast({ title: 'Failed to review', status: 'error', duration: 3000 })
    } finally { setSubmitting(false) }
  }

  if (loading) return <Flex justify="center" pt={20}><Spinner size="lg" color="primary.500" /></Flex>
  if (!form) return null

  return (
    <VStack spacing={5} align="stretch" maxW="900px">
      <HStack>
        <Button leftIcon={<MdArrowBack />} variant="ghost" size="sm" onClick={() => navigate('/dashboard/forms')} colorScheme="gray">
          Back to Forms
        </Button>
      </HStack>

      <Card borderRadius="xl" boxShadow="sm">
        <CardBody>
          <HStack justify="space-between" wrap="wrap" gap={3} mb={4}>
            <VStack align="start" spacing={1}>
              <Heading size="sm" color="gray.800">{FORM_TYPE_LABELS[form.form_type] || form.form_type}</Heading>
              {isAdmin && <Text fontSize="sm" color="gray.500">Submitted by: {form.beneficiary_name} · {form.beneficiary_barangay}</Text>}
              <HStack>
                <Badge colorScheme={STATUS_COLOR[form.status]} borderRadius="full" px={2}>
                  {form.status?.replace(/_/g, ' ').toUpperCase()}
                </Badge>
                {form.documents?.length > 0 && (
                  <Badge colorScheme="teal" borderRadius="full" px={2}>{form.documents.length} docs</Badge>
                )}
              </HStack>
            </VStack>
            <HStack spacing={2}>
              {!isAdmin && form.status === 'submitted' && (
                <Button as={RouterLink} to={`/dashboard/forms/${form.id}/documents`} size="sm" colorScheme="teal" borderRadius="lg">
                  Upload Documents
                </Button>
              )}
              {isAdmin && (form.status === 'submitted' || form.status === 'under_review') && (
                <Button colorScheme="primary" size="sm" borderRadius="lg" onClick={() => { setReviewStatus('under_review'); setReviewNotes(''); onOpen() }}>
                  Review This Form
                </Button>
              )}
            </HStack>
          </HStack>

          {form.admin_notes && (
            <Box bg="orange.50" border="1px solid" borderColor="orange.200" p={3} borderRadius="xl" mb={4}>
              <Text fontSize="xs" fontWeight={700} color="orange.700" mb={1}>Admin Notes</Text>
              <Text fontSize="sm" color="orange.800">{form.admin_notes}</Text>
              {form.reviewer_name && <Text fontSize="xs" color="orange.500" mt={1}>By {form.reviewer_name} on {form.reviewed_at?.slice(0, 10)}</Text>}
            </Box>
          )}

          <Divider mb={4} />
          {renderFormData(form.form_type, form.form_data)}
        </CardBody>
      </Card>

      {/* Documents */}
      <Card borderRadius="xl" boxShadow="sm">
        <CardBody>
          <Text fontWeight={700} fontSize="sm" color="gray.700" mb={3}>Required Documents</Text>
          {['barangay_certificate', 'medical_certificate', 'government_id', 'hospital_bill'].map(docType => {
            const doc = form.documents?.find((d: any) => d.document_type === docType)
            return (
              <HStack key={docType} p={3} bg={doc ? 'green.50' : 'gray.50'} borderRadius="xl" mb={2}
                border="1px solid" borderColor={doc ? 'green.200' : 'gray.200'} justify="space-between">
                <HStack>
                  <Icon as={doc ? MdCheckCircle : MdCancel} color={doc ? 'green.500' : 'gray.300'} boxSize={4} />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" fontWeight={600} color="gray.700">{DOC_LABELS[docType]}</Text>
                    {doc && <Text fontSize="xs" color="gray.500">{doc.original_filename}</Text>}
                  </VStack>
                </HStack>
                {doc && (
                  <Link href={doc.file_url} isExternal>
                    <Button size="xs" leftIcon={<MdDownload />} variant="outline" colorScheme="green" borderRadius="lg">View</Button>
                  </Link>
                )}
              </HStack>
            )
          })}
        </CardBody>
      </Card>

      {/* Review Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader fontSize="md">Review Form</ModalHeader>
          <ModalCloseButton />
          <Divider />
          <ModalBody pb={6} pt={4}>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontSize="sm" fontWeight={600} mb={2}>Decision</Text>
                <Select value={reviewStatus} onChange={e => setReviewStatus(e.target.value)} size="sm" borderRadius="lg">
                  <option value="under_review">Mark as Under Review</option>
                  <option value="approved">Approve</option>
                  <option value="rejected">Reject</option>
                  <option value="returned">Return for Revision</option>
                </Select>
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight={600} mb={2}>Notes</Text>
                <Textarea value={reviewNotes} onChange={e => setReviewNotes(e.target.value)} size="sm" borderRadius="lg" rows={3} placeholder="Add notes for the beneficiary..." />
              </Box>
              <HStack justify="flex-end">
                <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
                <Button colorScheme="primary" size="sm" isLoading={submitting} onClick={handleReview} borderRadius="lg">Submit Review</Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  )
}
