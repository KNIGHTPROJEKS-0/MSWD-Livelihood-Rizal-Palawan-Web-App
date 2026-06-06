import { useState } from 'react'
import {
  Box, VStack, HStack, Text, Button, Icon, Card, CardBody, Heading,
  Divider, Flex, useToast, Input, Select, Textarea, SimpleGrid,
  Badge, Progress, IconButton, Table, Thead, Tbody, Tr, Th, Td
} from '@chakra-ui/react'
import { MdArrowBack, MdArrowForward, MdFactCheck, MdCheckCircle, MdAdd, MdDelete } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { formsApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

const BARANGAYS = ['Aramaywan', 'Banbanan', 'Burirao', 'Culandanum', 'Iwahig', 'Labog', 'Malihud', 'Malinao', 'Maoyon', 'Maroyog', 'Panitian', 'Pulot Center', 'Pulot Ibaba', 'Pulot Interior', 'Ransang', 'Rosario', 'Sicsican', 'Sowangan', 'Taburi']
const CIVIL_STATUSES = ['Single', 'Married', 'Widowed', 'Separated', 'Annulled', 'Live-in']
const EDUCATION_LEVELS = ['No formal education', 'Elementary – incomplete', 'Elementary – graduate', 'High School – incomplete', 'High School – graduate', 'Vocational/Technical', 'College – incomplete', 'College – graduate', 'Post-graduate']
const STEPS = ['Identifying Info', 'Presenting Problem', 'Family Background', 'Socio-Economic', 'Assessment', 'Case Plan', 'Confirmation']

const empty_member = () => ({ name: '', relationship: '', age: '', sex: '', civil_status: '', education: '', occupation: '', monthly_income: '' })

export default function SocialCaseStudyPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const toast = useToast()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [createdFormId, setCreatedFormId] = useState<number | null>(null)

  const [identifyingInfo, setIdentifyingInfo] = useState({
    name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
    age: '', sex: '', civil_status: '', nationality: 'Filipino', religion: '',
    address: '', barangay: user?.barangay || '', municipality: 'Rizal', province: 'Palawan',
    contact_number: '', email: user?.email || '', date_of_report: new Date().toISOString().slice(0, 10),
    reason_for_referral: '',
  })
  const [presentingProblem, setPresentingProblem] = useState('')
  const [backgroundOfProblem, setBackgroundOfProblem] = useState('')
  const [familyBackground, setFamilyBackground] = useState({ family_structure: '', family_dynamics: '', parental_background: '' })
  const [familyMembers, setFamilyMembers] = useState([empty_member()])
  const [socioEconomic, setSocioEconomic] = useState({ income_sources: '', monthly_income: '', monthly_expenses: '', housing_condition: '', economic_assessment: '' })
  const [healthStatus, setHealthStatus] = useState({ general_health: '', medical_history: '', disabilities: '' })
  const [educationalBackground, setEducationalBackground] = useState({ highest_level: '', school: '', skills: '' })
  const [psychosocialAssessment, setPsychosocialAssessment] = useState('')
  const [problemAnalysis, setProblemAnalysis] = useState('')
  const [recommendations, setRecommendations] = useState('')
  const [casePlan, setCasePlan] = useState({ goals: '', objectives: '', interventions: '', timeline: '', responsible_person: '' })
  const [worker, setWorker] = useState({ worker_name: '', designation: 'Social Welfare Officer', date: new Date().toISOString().slice(0, 10), supervisor_name: '', supervisor_designation: '' })

  const setId = (k: string, v: string) => setIdentifyingInfo(p => ({ ...p, [k]: v }))
  const setFb = (k: string, v: string) => setFamilyBackground(p => ({ ...p, [k]: v }))
  const setSe = (k: string, v: string) => setSocioEconomic(p => ({ ...p, [k]: v }))
  const setHs = (k: string, v: string) => setHealthStatus(p => ({ ...p, [k]: v }))
  const setEb = (k: string, v: string) => setEducationalBackground(p => ({ ...p, [k]: v }))
  const setCp = (k: string, v: string) => setCasePlan(p => ({ ...p, [k]: v }))
  const setW = (k: string, v: string) => setWorker(p => ({ ...p, [k]: v }))

  const updateMember = (idx: number, key: string, val: string) =>
    setFamilyMembers(prev => prev.map((m, i) => i === idx ? { ...m, [key]: val } : m))

  const buildFormData = () => ({ identifying_info: identifyingInfo, presenting_problem: presentingProblem, background_of_problem: backgroundOfProblem, family_background: { ...familyBackground, family_members: familyMembers }, socio_economic: socioEconomic, health_status: healthStatus, educational_background: educationalBackground, psychosocial_assessment: psychosocialAssessment, problem_analysis: problemAnalysis, recommendations, case_plan: casePlan, worker })

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const createRes = await formsApi.create({ form_type: 'social_case_study', form_data: buildFormData() })
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
          <Text color="gray.500" textAlign="center">Your Social Case Study Report has been submitted. Please upload the required supporting documents.</Text>
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

      <Card borderRadius="xl" boxShadow="sm" borderTopWidth={4} borderTopColor="purple.400">
        <CardBody pb={2}>
          <HStack spacing={3} mb={4}>
            <Box bg="purple.50" p={2} borderRadius="lg"><Icon as={MdFactCheck} color="purple.600" boxSize={6} /></Box>
            <VStack align="start" spacing={0}>
              <Heading size="sm">Social Case Study Report</Heading>
              <Text fontSize="xs" color="gray.500">Comprehensive Social Case Assessment – MSWD Rizal, Palawan</Text>
            </VStack>
          </HStack>
          <HStack spacing={1} mb={2} flexWrap="wrap">
            {STEPS.map((s, i) => (
              <Badge key={i} colorScheme={i < step ? 'green' : i === step ? 'purple' : 'gray'} borderRadius="full" fontSize="xs" px={2}>{i < step ? '✓ ' : ''}{s}</Badge>
            ))}
          </HStack>
          <Progress value={((step) / (STEPS.length - 1)) * 100} colorScheme="purple" borderRadius="full" size="xs" />
        </CardBody>
      </Card>

      <Card borderRadius="xl" boxShadow="sm">
        <CardBody>
          {step === 0 && (
            <VStack spacing={4} align="stretch">
              <Text fontWeight={700} color="purple.700" fontSize="sm" textTransform="uppercase">I. Identifying Data</Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                <Field label="Full Name" required><Input size="sm" borderRadius="lg" value={identifyingInfo.name} onChange={e => setId('name', e.target.value)} /></Field>
                <Field label="Date of Report"><Input type="date" size="sm" borderRadius="lg" value={identifyingInfo.date_of_report} onChange={e => setId('date_of_report', e.target.value)} /></Field>
                <Field label="Age"><Input size="sm" borderRadius="lg" type="number" value={identifyingInfo.age} onChange={e => setId('age', e.target.value)} /></Field>
                <Field label="Sex">
                  <Select size="sm" borderRadius="lg" value={identifyingInfo.sex} onChange={e => setId('sex', e.target.value)} placeholder="Select...">
                    <option>Male</option><option>Female</option>
                  </Select>
                </Field>
                <Field label="Civil Status">
                  <Select size="sm" borderRadius="lg" value={identifyingInfo.civil_status} onChange={e => setId('civil_status', e.target.value)} placeholder="Select...">
                    {CIVIL_STATUSES.map(s => <option key={s}>{s}</option>)}
                  </Select>
                </Field>
                <Field label="Nationality"><Input size="sm" borderRadius="lg" value={identifyingInfo.nationality} onChange={e => setId('nationality', e.target.value)} /></Field>
                <Field label="Religion"><Input size="sm" borderRadius="lg" value={identifyingInfo.religion} onChange={e => setId('religion', e.target.value)} /></Field>
                <Field label="Contact Number"><Input size="sm" borderRadius="lg" value={identifyingInfo.contact_number} onChange={e => setId('contact_number', e.target.value)} /></Field>
                <Field label="Street / Sitio"><Input size="sm" borderRadius="lg" value={identifyingInfo.address} onChange={e => setId('address', e.target.value)} /></Field>
                <Field label="Barangay">
                  <Select size="sm" borderRadius="lg" value={identifyingInfo.barangay} onChange={e => setId('barangay', e.target.value)} placeholder="Select...">
                    {BARANGAYS.map(b => <option key={b}>{b}</option>)}
                  </Select>
                </Field>
                <Field label="Municipality"><Input size="sm" borderRadius="lg" value={identifyingInfo.municipality} onChange={e => setId('municipality', e.target.value)} /></Field>
                <Field label="Province"><Input size="sm" borderRadius="lg" value={identifyingInfo.province} onChange={e => setId('province', e.target.value)} /></Field>
              </SimpleGrid>
              <Field label="Reason for Referral / Nature of Request">
                <Textarea size="sm" borderRadius="lg" rows={3} value={identifyingInfo.reason_for_referral} onChange={e => setId('reason_for_referral', e.target.value)} placeholder="State the reason for referral or what type of assistance is being sought..." />
              </Field>
            </VStack>
          )}

          {step === 1 && (
            <VStack spacing={4} align="stretch">
              <Text fontWeight={700} color="purple.700" fontSize="sm" textTransform="uppercase">II. Presenting Problem</Text>
              <Field label="Presenting Problem / Chief Complaint" required>
                <Textarea size="sm" borderRadius="lg" rows={5} value={presentingProblem} onChange={e => setPresentingProblem(e.target.value)} placeholder="Describe the presenting problem as stated by the client. Include the specific situation that led to seeking MSWD assistance..." />
              </Field>
              <Divider />
              <Text fontWeight={700} color="purple.700" fontSize="sm" textTransform="uppercase">Background / History of the Problem</Text>
              <Field label="History and Development of the Problem">
                <Textarea size="sm" borderRadius="lg" rows={5} value={backgroundOfProblem} onChange={e => setBackgroundOfProblem(e.target.value)} placeholder="Describe how the problem developed over time. Include any precipitating events, previous interventions, and factors that have contributed to the current situation..." />
              </Field>
            </VStack>
          )}

          {step === 2 && (
            <VStack spacing={4} align="stretch">
              <Text fontWeight={700} color="purple.700" fontSize="sm" textTransform="uppercase">III. Family Background and Dynamics</Text>
              <Field label="Family Structure">
                <Select size="sm" borderRadius="lg" value={familyBackground.family_structure} onChange={e => setFb('family_structure', e.target.value)} placeholder="Select...">
                  <option>Nuclear Family</option><option>Extended Family</option><option>Single Parent Family</option><option>Blended Family</option><option>Grandparent-headed</option><option>Other</option>
                </Select>
              </Field>
              <Field label="Parental Background">
                <Textarea size="sm" borderRadius="lg" rows={3} value={familyBackground.parental_background} onChange={e => setFb('parental_background', e.target.value)} placeholder="Information about parents — education, occupation, health status, relationship history..." />
              </Field>
              <Field label="Family Dynamics and Relationships">
                <Textarea size="sm" borderRadius="lg" rows={3} value={familyBackground.family_dynamics} onChange={e => setFb('family_dynamics', e.target.value)} placeholder="Describe family relationships, communication patterns, roles, strengths, and problem areas..." />
              </Field>
              <Divider />
              <HStack justify="space-between">
                <Text fontWeight={700} color="purple.700" fontSize="sm" textTransform="uppercase">Family Members</Text>
                <Button size="xs" leftIcon={<MdAdd />} colorScheme="purple" variant="outline" borderRadius="lg" onClick={() => setFamilyMembers(p => [...p, empty_member()])}>Add Member</Button>
              </HStack>
              <Box overflowX="auto">
                <Table size="sm" variant="simple">
                  <Thead bg="gray.50">
                    <Tr>{['Name', 'Relationship', 'Age', 'Sex', 'Civil Status', 'Education', 'Occupation', 'Income', ''].map(h => <Th key={h} fontSize="10px" py={2}>{h}</Th>)}</Tr>
                  </Thead>
                  <Tbody>
                    {familyMembers.map((m, i) => (
                      <Tr key={i}>
                        {[
                          { k: 'name', ph: 'Full name' }, { k: 'relationship', ph: 'Spouse/Son...' },
                          { k: 'age', ph: 'Age' }, { k: 'sex', ph: '' }, { k: 'civil_status', ph: '' },
                          { k: 'education', ph: '' }, { k: 'occupation', ph: 'Occupation' }, { k: 'monthly_income', ph: '0' }
                        ].map(({ k, ph }) => (
                          <Td key={k} py={1}>
                            {k === 'sex' ? (
                              <Select size="xs" borderRadius="md" value={m[k as keyof typeof m] as string} onChange={e => updateMember(i, k, e.target.value)} placeholder="-" minW="70px"><option>Male</option><option>Female</option></Select>
                            ) : k === 'civil_status' ? (
                              <Select size="xs" borderRadius="md" value={m[k as keyof typeof m] as string} onChange={e => updateMember(i, k, e.target.value)} placeholder="-" minW="90px">{CIVIL_STATUSES.map(s => <option key={s}>{s}</option>)}</Select>
                            ) : k === 'education' ? (
                              <Select size="xs" borderRadius="md" value={m[k as keyof typeof m] as string} onChange={e => updateMember(i, k, e.target.value)} placeholder="-" minW="100px">{EDUCATION_LEVELS.map(l => <option key={l}>{l}</option>)}</Select>
                            ) : (
                              <Input size="xs" borderRadius="md" value={m[k as keyof typeof m] as string} onChange={e => updateMember(i, k, e.target.value)} placeholder={ph} minW={k === 'name' ? '130px' : '60px'} type={k === 'age' || k === 'monthly_income' ? 'number' : 'text'} />
                            )}
                          </Td>
                        ))}
                        <Td py={1}>
                          <IconButton aria-label="Remove" icon={<MdDelete />} size="xs" colorScheme="red" variant="ghost" borderRadius="md" isDisabled={familyMembers.length === 1} onClick={() => setFamilyMembers(p => p.filter((_, ii) => ii !== i))} />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </VStack>
          )}

          {step === 3 && (
            <VStack spacing={5} align="stretch">
              <Text fontWeight={700} color="purple.700" fontSize="sm" textTransform="uppercase">IV. Socio-Economic Situation</Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                <Field label="Income Sources"><Input size="sm" borderRadius="lg" value={socioEconomic.income_sources} onChange={e => setSe('income_sources', e.target.value)} placeholder="e.g., Farming, Fishing, Daily labor..." /></Field>
                <Field label="Monthly Family Income (PHP)"><Input size="sm" borderRadius="lg" type="number" value={socioEconomic.monthly_income} onChange={e => setSe('monthly_income', e.target.value)} /></Field>
                <Field label="Monthly Expenses (PHP)"><Input size="sm" borderRadius="lg" type="number" value={socioEconomic.monthly_expenses} onChange={e => setSe('monthly_expenses', e.target.value)} /></Field>
              </SimpleGrid>
              <Field label="Housing / Living Conditions">
                <Textarea size="sm" borderRadius="lg" rows={3} value={socioEconomic.housing_condition} onChange={e => setSe('housing_condition', e.target.value)} placeholder="Describe housing type, condition, ownership, and basic utilities available..." />
              </Field>
              <Field label="Economic Assessment">
                <Textarea size="sm" borderRadius="lg" rows={3} value={socioEconomic.economic_assessment} onChange={e => setSe('economic_assessment', e.target.value)} placeholder="Overall assessment of the family's economic situation and financial needs..." />
              </Field>
              <Divider />
              <Text fontWeight={700} color="purple.700" fontSize="sm" textTransform="uppercase">V. Health Status</Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                <Field label="General Health Condition">
                  <Select size="sm" borderRadius="lg" value={healthStatus.general_health} onChange={e => setHs('general_health', e.target.value)} placeholder="Select...">
                    <option>Good</option><option>Fair</option><option>Poor</option>
                  </Select>
                </Field>
                <Field label="Medical History / Existing Illness"><Input size="sm" borderRadius="lg" value={healthStatus.medical_history} onChange={e => setHs('medical_history', e.target.value)} placeholder="e.g., Hypertension, Diabetes..." /></Field>
                <Field label="Disabilities / Special Needs"><Input size="sm" borderRadius="lg" value={healthStatus.disabilities} onChange={e => setHs('disabilities', e.target.value)} placeholder="If none, leave blank" /></Field>
              </SimpleGrid>
              <Divider />
              <Text fontWeight={700} color="purple.700" fontSize="sm" textTransform="uppercase">VI. Educational Background</Text>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                <Field label="Highest Educational Level">
                  <Select size="sm" borderRadius="lg" value={educationalBackground.highest_level} onChange={e => setEb('highest_level', e.target.value)} placeholder="Select...">
                    {EDUCATION_LEVELS.map(l => <option key={l}>{l}</option>)}
                  </Select>
                </Field>
                <Field label="School Last Attended"><Input size="sm" borderRadius="lg" value={educationalBackground.school} onChange={e => setEb('school', e.target.value)} /></Field>
                <Field label="Skills / Vocational Training"><Input size="sm" borderRadius="lg" value={educationalBackground.skills} onChange={e => setEb('skills', e.target.value)} placeholder="e.g., Weaving, Carpentry..." /></Field>
              </SimpleGrid>
            </VStack>
          )}

          {step === 4 && (
            <VStack spacing={5} align="stretch">
              <Text fontWeight={700} color="purple.700" fontSize="sm" textTransform="uppercase">VII. Psychosocial Assessment</Text>
              <Field label="Psychosocial Assessment">
                <Textarea size="sm" borderRadius="lg" rows={4} value={psychosocialAssessment} onChange={e => setPsychosocialAssessment(e.target.value)} placeholder="Describe the client's psychological/emotional state, coping mechanisms, attitude, behavior, and social functioning. Include observed strengths and areas of concern..." />
              </Field>
              <Divider />
              <Text fontWeight={700} color="purple.700" fontSize="sm" textTransform="uppercase">VIII. Problem Analysis</Text>
              <Field label="Analysis of the Problem" required>
                <Textarea size="sm" borderRadius="lg" rows={4} value={problemAnalysis} onChange={e => setProblemAnalysis(e.target.value)} placeholder="Provide a comprehensive analysis of the problem based on gathered data. Identify root causes, contributing factors, risks, and the impact on the client and family..." />
              </Field>
              <Divider />
              <Text fontWeight={700} color="purple.700" fontSize="sm" textTransform="uppercase">IX. Recommendations</Text>
              <Field label="Recommendations" required>
                <Textarea size="sm" borderRadius="lg" rows={4} value={recommendations} onChange={e => setRecommendations(e.target.value)} placeholder="State specific recommendations for intervention, services to be provided, referrals to other agencies, and follow-up actions..." />
              </Field>
            </VStack>
          )}

          {step === 5 && (
            <VStack spacing={5} align="stretch">
              <Text fontWeight={700} color="purple.700" fontSize="sm" textTransform="uppercase">X. Case Plan</Text>
              <Field label="Goals">
                <Textarea size="sm" borderRadius="lg" rows={2} value={casePlan.goals} onChange={e => setCp('goals', e.target.value)} placeholder="Long-term goals for the client and family..." />
              </Field>
              <Field label="Objectives">
                <Textarea size="sm" borderRadius="lg" rows={2} value={casePlan.objectives} onChange={e => setCp('objectives', e.target.value)} placeholder="Specific, measurable objectives to achieve the goals..." />
              </Field>
              <Field label="Interventions / Services">
                <Textarea size="sm" borderRadius="lg" rows={3} value={casePlan.interventions} onChange={e => setCp('interventions', e.target.value)} placeholder="Planned interventions, services, and activities to be implemented..." />
              </Field>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                <Field label="Timeline"><Input size="sm" borderRadius="lg" value={casePlan.timeline} onChange={e => setCp('timeline', e.target.value)} placeholder="e.g., 3 months, 6 months..." /></Field>
                <Field label="Responsible Person"><Input size="sm" borderRadius="lg" value={casePlan.responsible_person} onChange={e => setCp('responsible_person', e.target.value)} placeholder="Name of assigned social worker" /></Field>
              </SimpleGrid>
              <Divider />
              <Text fontWeight={700} color="purple.700" fontSize="sm" textTransform="uppercase">XI. Prepared By</Text>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                <Field label="Social Worker's Name"><Input size="sm" borderRadius="lg" value={worker.worker_name} onChange={e => setW('worker_name', e.target.value)} /></Field>
                <Field label="Designation"><Input size="sm" borderRadius="lg" value={worker.designation} onChange={e => setW('designation', e.target.value)} /></Field>
                <Field label="Date"><Input type="date" size="sm" borderRadius="lg" value={worker.date} onChange={e => setW('date', e.target.value)} /></Field>
                <Field label="Supervisor's Name"><Input size="sm" borderRadius="lg" value={worker.supervisor_name} onChange={e => setW('supervisor_name', e.target.value)} /></Field>
                <Field label="Supervisor's Designation"><Input size="sm" borderRadius="lg" value={worker.supervisor_designation} onChange={e => setW('supervisor_designation', e.target.value)} /></Field>
              </SimpleGrid>
            </VStack>
          )}

          {step === 6 && (
            <VStack spacing={4} align="stretch">
              <Box bg="purple.50" p={4} borderRadius="xl" border="1px solid" borderColor="purple.200">
                <Text fontWeight={700} color="purple.800" mb={2}>Ready to Submit?</Text>
                <Text fontSize="sm" color="purple.700">After submission, upload 4 required supporting documents:</Text>
                <VStack align="start" mt={2} spacing={1}>
                  {['Barangay Certificate of Indigency', 'Medical Certificate / Abstract', 'Valid Government ID', 'Hospital Bill or Receipt'].map(d => (
                    <Text key={d} fontSize="sm" color="purple.700">• {d}</Text>
                  ))}
                </VStack>
              </Box>
              <Box bg="gray.50" p={4} borderRadius="xl">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                  {[
                    ['Client Name', identifyingInfo.name],
                    ['Barangay', identifyingInfo.barangay],
                    ['Presenting Problem', presentingProblem ? presentingProblem.slice(0, 80) + '...' : '—'],
                  ].map(([k, v]) => (
                    <Box key={k}><Text fontSize="xs" color="gray.400" fontWeight={600}>{k}</Text><Text fontSize="sm">{v || '—'}</Text></Box>
                  ))}
                </SimpleGrid>
              </Box>
              <Box bg="yellow.50" p={3} borderRadius="xl" border="1px solid" borderColor="yellow.200">
                <Text fontSize="xs" color="yellow.800">I certify that all information provided in this Social Case Study Report is true and accurate to the best of my knowledge.</Text>
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
              <Button rightIcon={<MdArrowForward />} colorScheme="purple" size="sm" borderRadius="lg" onClick={() => setStep(s => s + 1)}>Next</Button>
            ) : (
              <Button colorScheme="green" size="sm" borderRadius="lg" isLoading={submitting} onClick={handleSubmit}>Submit Form</Button>
            )}
          </HStack>
        </CardBody>
      </Card>
    </VStack>
  )
}
