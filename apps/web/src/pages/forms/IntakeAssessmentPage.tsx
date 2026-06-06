import { useState } from 'react'
import {
  Box, VStack, HStack, Text, Button, Icon, Card, CardBody, Heading,
  Divider, Flex, useToast, Input, Select, Textarea, SimpleGrid,
  Badge, Progress, Checkbox, CheckboxGroup
} from '@chakra-ui/react'
import { MdArrowBack, MdArrowForward, MdDescription, MdCheckCircle } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { formsApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

const BARANGAYS = ['Aramaywan', 'Banbanan', 'Burirao', 'Culandanum', 'Iwahig', 'Labog', 'Malihud', 'Malinao', 'Maoyon', 'Maroyog', 'Panitian', 'Pulot Center', 'Pulot Ibaba', 'Pulot Interior', 'Ransang', 'Rosario', 'Sicsican', 'Sowangan', 'Taburi']
const CIVIL_STATUSES = ['Single', 'Married', 'Widowed', 'Separated', 'Annulled', 'Live-in']
const CASE_TYPES = ['Financial Assistance', 'Medical Assistance', 'Livelihood Assistance', 'Educational Assistance', 'Housing Assistance', 'Food Assistance', 'Burial Assistance', 'Solo Parent', 'Senior Citizen', 'PWD Support', 'Child Welfare', 'VAWC (Violence Against Women)', 'Disaster/Calamity', 'Counseling']
const REFERRAL_SOURCES = ['Self-referral / Walk-in', 'Barangay', 'Hospital', 'School', 'Other Government Agency', 'NGO / Civil Society', 'Family/Neighbor', 'DSWD', 'PhilHealth', 'LGU Official']
const SERVICES = ['Financial Assistance', 'Medical Assistance', 'Livelihood Program', 'Skills Training', 'Housing Assistance', 'Food Assistance', 'Referral to Other Agency', 'Educational Assistance', 'Burial Assistance', 'Counseling/Psychosocial']
const STEPS = ['Case Information', 'Personal Data', 'Presenting Problem', 'Economic & Support', 'Assessment & Plan', 'Confirmation']

export default function IntakeAssessmentPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const toast = useToast()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [createdFormId, setCreatedFormId] = useState<number | null>(null)

  const [caseInfo, setCaseInfo] = useState({ case_number: '', date: new Date().toISOString().slice(0, 10), referred_by: '', source_of_referral: '' })
  const [personal, setPersonal] = useState({ last_name: '', first_name: user?.first_name || '', middle_name: '', age: '', sex: '', civil_status: '', address: '', barangay: user?.barangay || '', contact_number: '', email: user?.email || '', occupation: '', monthly_income: '' })
  const [presentingProblem, setPresentingProblem] = useState({ type_of_case: '', nature_of_problem: '', brief_background: '' })
  const [economicStatus, setEconomicStatus] = useState({ family_income: '', source_of_income: '', assets: '' })
  const [supportSystem, setSupportSystem] = useState({ family_support: '', community_support: '', other_agencies: '' })
  const [initialAssessment, setInitialAssessment] = useState('')
  const [planOfAction, setPlanOfAction] = useState<{ services: string[]; target_date: string; responsible_person: string }>({ services: [], target_date: '', responsible_person: '' })
  const [worker, setWorker] = useState({ worker_name: '', designation: 'Social Welfare Officer', date: new Date().toISOString().slice(0, 10) })

  const setCi = (k: string, v: string) => setCaseInfo(p => ({ ...p, [k]: v }))
  const setPe = (k: string, v: string) => setPersonal(p => ({ ...p, [k]: v }))
  const setPp = (k: string, v: string) => setPresentingProblem(p => ({ ...p, [k]: v }))
  const setEs = (k: string, v: string) => setEconomicStatus(p => ({ ...p, [k]: v }))
  const setSs = (k: string, v: string) => setSupportSystem(p => ({ ...p, [k]: v }))
  const setPoa = (k: string, v: any) => setPlanOfAction(p => ({ ...p, [k]: v }))
  const setW = (k: string, v: string) => setWorker(p => ({ ...p, [k]: v }))

  const buildFormData = () => ({ case_info: caseInfo, personal, presenting_problem: presentingProblem, economic_status: economicStatus, support_system: supportSystem, initial_assessment: initialAssessment, plan_of_action: planOfAction, worker })

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const createRes = await formsApi.create({ form_type: 'intake_assessment', form_data: buildFormData() })
      const formId = createRes.data.id
      await formsApi.submit(formId)
      setCreatedFormId(formId)
      setSubmitted(true)
      toast({ title: 'Form submitted!', status: 'success', duration: 3000 })
    } catch (err: any) {
      toast({ title: err?.response?.data?.detail || 'Submission failed', status: 'error', duration: 3000 })
    } finally { setSubmitting(false) }
  }

  const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
    <Box>
      <Text fontSize="xs" fontWeight={600} color="gray.600" mb={1}>{label}{required && <Text as="span" color="red.400"> *</Text>}</Text>
      {children}
    </Box>
  )

  if (submitted && createdFormId) {
    return (
      <Flex direction="column" align="center" justify="center" py={16} gap={5}>
        <Box bg="green.50" p={6} borderRadius="full"><Icon as={MdCheckCircle} color="green.500" boxSize={16} /></Box>
        <VStack spacing={1}>
          <Heading size="md" color="green.700">Form Submitted!</Heading>
          <Text color="gray.500" textAlign="center">Your Intake/Assessment Form has been submitted. Please upload the required supporting documents.</Text>
        </VStack>
        <HStack spacing={3} flexWrap="wrap" justify="center">
          <Button colorScheme="teal" borderRadius="lg" onClick={() => navigate(`/dashboard/forms/${createdFormId}/documents`)}>Upload Documents</Button>
          <Button variant="outline" colorScheme="primary" borderRadius="lg" onClick={() => navigate('/dashboard/forms')}>View My Forms</Button>
        </HStack>
      </Flex>
    )
  }

  return (
    <VStack spacing={5} align="stretch" maxW="860px">
      <HStack>
        <Button leftIcon={<MdArrowBack />} variant="ghost" size="sm" onClick={() => navigate('/dashboard/forms')} colorScheme="gray">Back</Button>
      </HStack>

      <Card borderRadius="xl" boxShadow="sm" borderTopWidth={4} borderTopColor="teal.400">
        <CardBody pb={2}>
          <HStack spacing={3} mb={4}>
            <Box bg="teal.50" p={2} borderRadius="lg"><Icon as={MdDescription} color="teal.600" boxSize={6} /></Box>
            <VStack align="start" spacing={0}>
              <Heading size="sm">Intake / Assessment Form</Heading>
              <Text fontSize="xs" color="gray.500">Social Case Record & Assessment – MSWD Rizal, Palawan</Text>
            </VStack>
          </HStack>
          <HStack spacing={1} mb={2} flexWrap="wrap">
            {STEPS.map((s, i) => (
              <Badge key={i} colorScheme={i < step ? 'green' : i === step ? 'teal' : 'gray'} borderRadius="full" fontSize="xs" px={2}>{i < step ? '✓ ' : ''}{s}</Badge>
            ))}
          </HStack>
          <Progress value={((step) / (STEPS.length - 1)) * 100} colorScheme="teal" borderRadius="full" size="xs" />
        </CardBody>
      </Card>

      <Card borderRadius="xl" boxShadow="sm">
        <CardBody>
          {step === 0 && (
            <VStack spacing={4} align="stretch">
              <Text fontWeight={700} color="teal.700" fontSize="sm" textTransform="uppercase">I. Case Information</Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                <Field label="Case Number"><Input size="sm" borderRadius="lg" value={caseInfo.case_number} onChange={e => setCi('case_number', e.target.value)} placeholder="Leave blank if not assigned" /></Field>
                <Field label="Date"><Input type="date" size="sm" borderRadius="lg" value={caseInfo.date} onChange={e => setCi('date', e.target.value)} /></Field>
                <Field label="Referred By (Name)"><Input size="sm" borderRadius="lg" value={caseInfo.referred_by} onChange={e => setCi('referred_by', e.target.value)} placeholder="Name of referring person/agency" /></Field>
                <Field label="Source of Referral">
                  <Select size="sm" borderRadius="lg" value={caseInfo.source_of_referral} onChange={e => setCi('source_of_referral', e.target.value)} placeholder="Select...">
                    {REFERRAL_SOURCES.map(r => <option key={r}>{r}</option>)}
                  </Select>
                </Field>
              </SimpleGrid>
            </VStack>
          )}

          {step === 1 && (
            <VStack spacing={4} align="stretch">
              <Text fontWeight={700} color="teal.700" fontSize="sm" textTransform="uppercase">II. Personal Data</Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                <Field label="Last Name" required><Input size="sm" borderRadius="lg" value={personal.last_name} onChange={e => setPe('last_name', e.target.value)} /></Field>
                <Field label="First Name" required><Input size="sm" borderRadius="lg" value={personal.first_name} onChange={e => setPe('first_name', e.target.value)} /></Field>
                <Field label="Middle Name"><Input size="sm" borderRadius="lg" value={personal.middle_name} onChange={e => setPe('middle_name', e.target.value)} /></Field>
                <Field label="Age"><Input size="sm" borderRadius="lg" type="number" value={personal.age} onChange={e => setPe('age', e.target.value)} /></Field>
                <Field label="Sex">
                  <Select size="sm" borderRadius="lg" value={personal.sex} onChange={e => setPe('sex', e.target.value)} placeholder="Select...">
                    <option>Male</option><option>Female</option>
                  </Select>
                </Field>
                <Field label="Civil Status">
                  <Select size="sm" borderRadius="lg" value={personal.civil_status} onChange={e => setPe('civil_status', e.target.value)} placeholder="Select...">
                    {CIVIL_STATUSES.map(s => <option key={s}>{s}</option>)}
                  </Select>
                </Field>
                <Field label="Street Address / Sitio"><Input size="sm" borderRadius="lg" value={personal.address} onChange={e => setPe('address', e.target.value)} /></Field>
                <Field label="Barangay">
                  <Select size="sm" borderRadius="lg" value={personal.barangay} onChange={e => setPe('barangay', e.target.value)} placeholder="Select...">
                    {BARANGAYS.map(b => <option key={b}>{b}</option>)}
                  </Select>
                </Field>
                <Field label="Contact Number"><Input size="sm" borderRadius="lg" value={personal.contact_number} onChange={e => setPe('contact_number', e.target.value)} /></Field>
                <Field label="Email"><Input size="sm" borderRadius="lg" type="email" value={personal.email} onChange={e => setPe('email', e.target.value)} /></Field>
                <Field label="Occupation"><Input size="sm" borderRadius="lg" value={personal.occupation} onChange={e => setPe('occupation', e.target.value)} /></Field>
                <Field label="Monthly Income (PHP)"><Input size="sm" borderRadius="lg" type="number" value={personal.monthly_income} onChange={e => setPe('monthly_income', e.target.value)} /></Field>
              </SimpleGrid>
            </VStack>
          )}

          {step === 2 && (
            <VStack spacing={4} align="stretch">
              <Text fontWeight={700} color="teal.700" fontSize="sm" textTransform="uppercase">III. Presenting Problem / Concern</Text>
              <Field label="Type of Case / Category" required>
                <Select size="sm" borderRadius="lg" value={presentingProblem.type_of_case} onChange={e => setPp('type_of_case', e.target.value)} placeholder="Select type of case...">
                  {CASE_TYPES.map(c => <option key={c}>{c}</option>)}
                </Select>
              </Field>
              <Field label="Nature of Problem / Concern" required>
                <Textarea size="sm" borderRadius="lg" rows={4} value={presentingProblem.nature_of_problem} onChange={e => setPp('nature_of_problem', e.target.value)} placeholder="Describe the nature of the problem or concern being presented by the client..." />
              </Field>
              <Field label="Brief History / Background of the Problem">
                <Textarea size="sm" borderRadius="lg" rows={4} value={presentingProblem.brief_background} onChange={e => setPp('brief_background', e.target.value)} placeholder="Provide brief history or background of how the problem started, previous attempts to resolve it, etc..." />
              </Field>
            </VStack>
          )}

          {step === 3 && (
            <VStack spacing={5} align="stretch">
              <Text fontWeight={700} color="teal.700" fontSize="sm" textTransform="uppercase">IV. Economic Status</Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                <Field label="Monthly Family Income (PHP)"><Input size="sm" borderRadius="lg" type="number" value={economicStatus.family_income} onChange={e => setEs('family_income', e.target.value)} /></Field>
                <Field label="Source of Income"><Input size="sm" borderRadius="lg" value={economicStatus.source_of_income} onChange={e => setEs('source_of_income', e.target.value)} placeholder="e.g., Farming, Fishing, Employment..." /></Field>
                <Field label="Assets / Properties (if any)"><Input size="sm" borderRadius="lg" value={economicStatus.assets} onChange={e => setEs('assets', e.target.value)} placeholder="e.g., Land, Vehicle..." /></Field>
              </SimpleGrid>
              <Divider />
              <Text fontWeight={700} color="teal.700" fontSize="sm" textTransform="uppercase">V. Support System</Text>
              <Field label="Family Support Available">
                <Textarea size="sm" borderRadius="lg" rows={2} value={supportSystem.family_support} onChange={e => setSs('family_support', e.target.value)} placeholder="Describe available family support (relatives who can help, etc.)" />
              </Field>
              <Field label="Community / Barangay Support">
                <Textarea size="sm" borderRadius="lg" rows={2} value={supportSystem.community_support} onChange={e => setSs('community_support', e.target.value)} placeholder="Describe community or barangay support systems available" />
              </Field>
              <Field label="Other Agencies / Organizations Providing Assistance">
                <Textarea size="sm" borderRadius="lg" rows={2} value={supportSystem.other_agencies} onChange={e => setSs('other_agencies', e.target.value)} placeholder="List other agencies currently assisting the client (DSWD, NGOs, etc.)" />
              </Field>
            </VStack>
          )}

          {step === 4 && (
            <VStack spacing={5} align="stretch">
              <Text fontWeight={700} color="teal.700" fontSize="sm" textTransform="uppercase">VI. Initial Assessment</Text>
              <Field label="Social Worker's Initial Assessment">
                <Textarea size="sm" borderRadius="lg" rows={4} value={initialAssessment} onChange={e => setInitialAssessment(e.target.value)} placeholder="Provide initial assessment of the client's situation, eligibility, and priority level..." />
              </Field>
              <Divider />
              <Text fontWeight={700} color="teal.700" fontSize="sm" textTransform="uppercase">VII. Plan of Action / Intervention</Text>
              <Box>
                <Text fontSize="xs" fontWeight={600} color="gray.600" mb={2}>Services to be Rendered</Text>
                <CheckboxGroup value={planOfAction.services} onChange={vals => setPoa('services', vals)}>
                  <SimpleGrid columns={{ base: 2, md: 3 }} spacing={2}>
                    {SERVICES.map(s => <Checkbox key={s} value={s} size="sm" colorScheme="teal"><Text fontSize="sm">{s}</Text></Checkbox>)}
                  </SimpleGrid>
                </CheckboxGroup>
              </Box>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                <Field label="Target Date of Service"><Input type="date" size="sm" borderRadius="lg" value={planOfAction.target_date} onChange={e => setPoa('target_date', e.target.value)} /></Field>
                <Field label="Responsible Person / Worker"><Input size="sm" borderRadius="lg" value={planOfAction.responsible_person} onChange={e => setPoa('responsible_person', e.target.value)} placeholder="Name of assigned social worker" /></Field>
              </SimpleGrid>
              <Divider />
              <Text fontWeight={700} color="teal.700" fontSize="sm" textTransform="uppercase">VIII. Social Worker</Text>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                <Field label="Worker's Name"><Input size="sm" borderRadius="lg" value={worker.worker_name} onChange={e => setW('worker_name', e.target.value)} /></Field>
                <Field label="Designation"><Input size="sm" borderRadius="lg" value={worker.designation} onChange={e => setW('designation', e.target.value)} /></Field>
                <Field label="Date"><Input type="date" size="sm" borderRadius="lg" value={worker.date} onChange={e => setW('date', e.target.value)} /></Field>
              </SimpleGrid>
            </VStack>
          )}

          {step === 5 && (
            <VStack spacing={4} align="stretch">
              <Box bg="teal.50" p={4} borderRadius="xl" border="1px solid" borderColor="teal.200">
                <Text fontWeight={700} color="teal.800" mb={2}>Ready to Submit?</Text>
                <Text fontSize="sm" color="teal.700">After submission, upload 4 supporting documents:</Text>
                <VStack align="start" mt={2} spacing={1}>
                  {['Barangay Certificate of Indigency', 'Medical Certificate / Abstract', 'Valid Government ID', 'Hospital Bill or Receipt'].map(d => (
                    <Text key={d} fontSize="sm" color="teal.700">• {d}</Text>
                  ))}
                </VStack>
              </Box>
              <Box bg="gray.50" p={4} borderRadius="xl">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                  {[
                    ['Client Name', `${personal.last_name}, ${personal.first_name}`.trim()],
                    ['Barangay', personal.barangay],
                    ['Type of Case', presentingProblem.type_of_case],
                    ['Source of Referral', caseInfo.source_of_referral],
                  ].map(([k, v]) => (
                    <Box key={k}><Text fontSize="xs" color="gray.400" fontWeight={600}>{k}</Text><Text fontSize="sm">{v || '—'}</Text></Box>
                  ))}
                </SimpleGrid>
              </Box>
              <Box bg="yellow.50" p={3} borderRadius="xl" border="1px solid" borderColor="yellow.200">
                <Text fontSize="xs" color="yellow.800">I certify that all information provided is true and correct. I understand that falsification of information may lead to denial or termination of assistance.</Text>
              </Box>
            </VStack>
          )}
        </CardBody>
      </Card>

      <Card borderRadius="xl" boxShadow="sm">
        <CardBody py={3}>
          <HStack justify="space-between">
            <Button leftIcon={<MdArrowBack />} variant="outline" size="sm" borderRadius="lg" isDisabled={step === 0} onClick={() => setStep(s => s - 1)}>Previous</Button>
            <Text fontSize="xs" color="gray.400">Step {step + 1} of {STEPS.length}</Text>
            {step < STEPS.length - 1 ? (
              <Button rightIcon={<MdArrowForward />} colorScheme="teal" size="sm" borderRadius="lg" onClick={() => setStep(s => s + 1)}>Next</Button>
            ) : (
              <Button colorScheme="green" size="sm" borderRadius="lg" isLoading={submitting} onClick={handleSubmit}>Submit Form</Button>
            )}
          </HStack>
        </CardBody>
      </Card>
    </VStack>
  )
}
