import { useState } from 'react'
import {
  Box, VStack, HStack, Text, Button, Icon, Card, CardBody, Heading,
  Divider, Flex, useToast, Input, Select, Textarea, SimpleGrid,
  Radio, RadioGroup, Stack, Checkbox, CheckboxGroup, Badge,
  IconButton, Table, Thead, Tbody, Tr, Th, Td, Progress
} from '@chakra-ui/react'
import { MdArrowBack, MdArrowForward, MdAdd, MdDelete, MdAssignment, MdCheckCircle } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { formsApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

const BARANGAYS = ['Aramaywan', 'Banbanan', 'Burirao', 'Culandanum', 'Iwahig', 'Labog', 'Malihud', 'Malinao', 'Maoyon', 'Maroyog', 'Panitian', 'Pulot Center', 'Pulot Ibaba', 'Pulot Interior', 'Ransang', 'Rosario', 'Sicsican', 'Sowangan', 'Taburi']
const EDUCATION_LEVELS = ['No formal education', 'Elementary – incomplete', 'Elementary – graduate', 'High School – incomplete', 'High School – graduate', 'Vocational/Technical', 'College – incomplete', 'College – graduate', 'Post-graduate']
const CIVIL_STATUSES = ['Single', 'Married', 'Widowed', 'Separated', 'Annulled', 'Live-in']
const PROBLEM_TYPES = ['Financial/Economic', 'Medical/Health', 'Housing', 'Food Assistance', 'Educational Assistance', 'Livelihood', 'Burial Assistance', 'Solo Parent', 'Senior Citizen', 'PWD Assistance', 'Child Welfare', 'Women/GAD', 'Disaster/Calamity']
const SERVICES = ['Financial Assistance', 'Medical Assistance', 'Livelihood Program', 'Skills Training', 'Housing Assistance', 'Food Assistance', 'Referral to Other Agency', 'Educational Assistance', 'Burial Assistance', 'Counseling']
const STEPS = ['Personal Info', 'Address', 'Family Composition', 'Health & Housing', 'Problem & Assessment', 'Confirmation']

const empty_member = () => ({ name: '', relationship: '', age: '', sex: '', civil_status: '', education: '', occupation: '', monthly_income: '' })

export default function MSWDForm3Page() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const toast = useToast()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [createdFormId, setCreatedFormId] = useState<number | null>(null)

  const [personal, setPersonal] = useState({
    case_number: '', date: new Date().toISOString().slice(0, 10), last_name: '',
    first_name: user?.first_name || '', middle_name: '', date_of_birth: '',
    age: '', sex: '', civil_status: '', religion: '', nationality: 'Filipino',
    educational_attainment: '', occupation: '', monthly_income: '',
    contact_number: '', email: user?.email || '',
  })
  const [address, setAddress] = useState({
    house_street: '', barangay: user?.barangay || '', municipality: 'Rizal',
    province: 'Palawan', region: 'Region IV-B (MIMAROPA)',
  })
  const [familyMembers, setFamilyMembers] = useState([empty_member()])
  const [health, setHealth] = useState({ general_condition: '', existing_illness: '', is_pwd: 'No', pwd_type: '' })
  const [housing, setHousing] = useState({
    ownership: '', structure_type: '', water_source: '', toilet_type: '', electricity: 'No'
  })
  const [economic, setEconomic] = useState({ main_income_source: '', monthly_family_income: '', monthly_expenses: '', total_debts: '' })
  const [problems, setProblems] = useState<{ types: string[]; description: string; duration: string }>({ types: [], description: '', duration: '' })
  const [assessment, setAssessment] = useState<{ assessment_notes: string; recommended_services: string[]; remarks: string }>({ assessment_notes: '', recommended_services: [], remarks: '' })
  const [worker, setWorker] = useState({ worker_name: '', designation: 'Social Welfare Officer', assessment_date: new Date().toISOString().slice(0, 10) })

  const setP = (k: string, v: string) => setPersonal(prev => ({ ...prev, [k]: v }))
  const setA = (k: string, v: string) => setAddress(prev => ({ ...prev, [k]: v }))
  const setH = (k: string, v: string) => setHealth(prev => ({ ...prev, [k]: v }))
  const setHs = (k: string, v: string) => setHousing(prev => ({ ...prev, [k]: v }))
  const setE = (k: string, v: string) => setEconomic(prev => ({ ...prev, [k]: v }))
  const setW = (k: string, v: string) => setWorker(prev => ({ ...prev, [k]: v }))

  const updateMember = (idx: number, key: string, val: string) => {
    setFamilyMembers(prev => prev.map((m, i) => i === idx ? { ...m, [key]: val } : m))
  }
  const addMember = () => setFamilyMembers(prev => [...prev, empty_member()])
  const removeMember = (idx: number) => setFamilyMembers(prev => prev.filter((_, i) => i !== idx))

  const buildFormData = () => ({ personal, address, family_composition: familyMembers, health, housing, economic, problems, assessment, worker })

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const createRes = await formsApi.create({ form_type: 'assessment_tool', form_data: buildFormData() })
      const formId = createRes.data.id
      await formsApi.submit(formId)
      setCreatedFormId(formId)
      setSubmitted(true)
      toast({ title: 'Form submitted successfully!', status: 'success', duration: 4000 })
    } catch (err: any) {
      toast({ title: err?.response?.data?.detail || 'Submission failed', status: 'error', duration: 3000 })
    } finally { setSubmitting(false) }
  }

  const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
    <Box>
      <Text fontSize="xs" fontWeight={600} color="gray.600" mb={1}>
        {label}{required && <Text as="span" color="red.400"> *</Text>}
      </Text>
      {children}
    </Box>
  )

  if (submitted && createdFormId) {
    return (
      <Flex direction="column" align="center" justify="center" py={16} gap={5}>
        <Box bg="green.50" p={6} borderRadius="full">
          <Icon as={MdCheckCircle} color="green.500" boxSize={16} />
        </Box>
        <VStack spacing={1}>
          <Heading size="md" color="green.700">Form Submitted!</Heading>
          <Text color="gray.500" textAlign="center">Your MSWD Form No. 3 has been submitted. Now please upload the required supporting documents.</Text>
        </VStack>
        <HStack spacing={3} flexWrap="wrap" justify="center">
          <Button colorScheme="teal" borderRadius="lg" onClick={() => navigate(`/dashboard/forms/${createdFormId}/documents`)}>
            Upload Documents Now
          </Button>
          <Button variant="outline" colorScheme="primary" borderRadius="lg" onClick={() => navigate('/dashboard/forms')}>
            View My Forms
          </Button>
        </HStack>
      </Flex>
    )
  }

  return (
    <VStack spacing={5} align="stretch" maxW="860px">
      <HStack>
        <Button leftIcon={<MdArrowBack />} variant="ghost" size="sm" onClick={() => navigate('/dashboard/forms')} colorScheme="gray">Back</Button>
      </HStack>

      <Card borderRadius="xl" boxShadow="sm" borderTopWidth={4} borderTopColor="blue.400">
        <CardBody pb={2}>
          <HStack spacing={3} mb={4}>
            <Box bg="blue.50" p={2} borderRadius="lg"><Icon as={MdAssignment} color="blue.600" boxSize={6} /></Box>
            <VStack align="start" spacing={0}>
              <Heading size="sm">MSWD Form No. 3</Heading>
              <Text fontSize="xs" color="gray.500">Individual / Family Assessment Tool – Republic of the Philippines, MSWD Rizal, Palawan</Text>
            </VStack>
          </HStack>
          <HStack spacing={1} mb={2} flexWrap="wrap">
            {STEPS.map((s, i) => (
              <Badge key={i} colorScheme={i < step ? 'green' : i === step ? 'blue' : 'gray'} borderRadius="full" fontSize="xs" px={2} py={0.5}>
                {i < step ? '✓ ' : ''}{s}
              </Badge>
            ))}
          </HStack>
          <Progress value={((step) / (STEPS.length - 1)) * 100} colorScheme="blue" borderRadius="full" size="xs" />
        </CardBody>
      </Card>

      <Card borderRadius="xl" boxShadow="sm">
        <CardBody>
          {/* Step 0: Personal Info */}
          {step === 0 && (
            <VStack spacing={4} align="stretch">
              <Text fontWeight={700} color="primary.700" fontSize="sm" textTransform="uppercase">I. Personal Information</Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                <Field label="Case Number"><Input size="sm" borderRadius="lg" value={personal.case_number} onChange={e => setP('case_number', e.target.value)} placeholder="Leave blank if not yet assigned" /></Field>
                <Field label="Date"><Input type="date" size="sm" borderRadius="lg" value={personal.date} onChange={e => setP('date', e.target.value)} /></Field>
                <Field label="Last Name" required><Input size="sm" borderRadius="lg" value={personal.last_name} onChange={e => setP('last_name', e.target.value)} /></Field>
                <Field label="First Name" required><Input size="sm" borderRadius="lg" value={personal.first_name} onChange={e => setP('first_name', e.target.value)} /></Field>
                <Field label="Middle Name"><Input size="sm" borderRadius="lg" value={personal.middle_name} onChange={e => setP('middle_name', e.target.value)} /></Field>
                <Field label="Date of Birth"><Input type="date" size="sm" borderRadius="lg" value={personal.date_of_birth} onChange={e => setP('date_of_birth', e.target.value)} /></Field>
                <Field label="Age"><Input size="sm" borderRadius="lg" type="number" value={personal.age} onChange={e => setP('age', e.target.value)} /></Field>
                <Field label="Sex" required>
                  <Select size="sm" borderRadius="lg" value={personal.sex} onChange={e => setP('sex', e.target.value)} placeholder="Select...">
                    <option>Male</option><option>Female</option>
                  </Select>
                </Field>
                <Field label="Civil Status">
                  <Select size="sm" borderRadius="lg" value={personal.civil_status} onChange={e => setP('civil_status', e.target.value)} placeholder="Select...">
                    {CIVIL_STATUSES.map(s => <option key={s}>{s}</option>)}
                  </Select>
                </Field>
                <Field label="Religion"><Input size="sm" borderRadius="lg" value={personal.religion} onChange={e => setP('religion', e.target.value)} /></Field>
                <Field label="Nationality"><Input size="sm" borderRadius="lg" value={personal.nationality} onChange={e => setP('nationality', e.target.value)} /></Field>
                <Field label="Educational Attainment">
                  <Select size="sm" borderRadius="lg" value={personal.educational_attainment} onChange={e => setP('educational_attainment', e.target.value)} placeholder="Select...">
                    {EDUCATION_LEVELS.map(l => <option key={l}>{l}</option>)}
                  </Select>
                </Field>
                <Field label="Occupation / Source of Income"><Input size="sm" borderRadius="lg" value={personal.occupation} onChange={e => setP('occupation', e.target.value)} /></Field>
                <Field label="Monthly Income (PHP)"><Input size="sm" borderRadius="lg" type="number" value={personal.monthly_income} onChange={e => setP('monthly_income', e.target.value)} /></Field>
                <Field label="Contact Number"><Input size="sm" borderRadius="lg" value={personal.contact_number} onChange={e => setP('contact_number', e.target.value)} /></Field>
                <Field label="Email Address"><Input size="sm" borderRadius="lg" type="email" value={personal.email} onChange={e => setP('email', e.target.value)} /></Field>
              </SimpleGrid>
            </VStack>
          )}

          {/* Step 1: Address */}
          {step === 1 && (
            <VStack spacing={4} align="stretch">
              <Text fontWeight={700} color="primary.700" fontSize="sm" textTransform="uppercase">II. Address / Residence</Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                <Field label="House No. / Street / Sitio"><Input size="sm" borderRadius="lg" value={address.house_street} onChange={e => setA('house_street', e.target.value)} /></Field>
                <Field label="Barangay" required>
                  <Select size="sm" borderRadius="lg" value={address.barangay} onChange={e => setA('barangay', e.target.value)} placeholder="Select barangay...">
                    {BARANGAYS.map(b => <option key={b}>{b}</option>)}
                  </Select>
                </Field>
                <Field label="Municipality"><Input size="sm" borderRadius="lg" value={address.municipality} onChange={e => setA('municipality', e.target.value)} /></Field>
                <Field label="Province"><Input size="sm" borderRadius="lg" value={address.province} onChange={e => setA('province', e.target.value)} /></Field>
                <Field label="Region"><Input size="sm" borderRadius="lg" value={address.region} onChange={e => setA('region', e.target.value)} /></Field>
              </SimpleGrid>
            </VStack>
          )}

          {/* Step 2: Family Composition */}
          {step === 2 && (
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Text fontWeight={700} color="primary.700" fontSize="sm" textTransform="uppercase">III. Family Composition</Text>
                <Button size="xs" leftIcon={<MdAdd />} colorScheme="blue" variant="outline" borderRadius="lg" onClick={addMember}>Add Member</Button>
              </HStack>
              <Box overflowX="auto">
                <Table size="sm" variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      {['Name', 'Relationship', 'Age', 'Sex', 'Civil Status', 'Education', 'Occupation', 'Monthly Income', ''].map(h => (
                        <Th key={h} fontSize="10px" py={2}>{h}</Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {familyMembers.map((m, i) => (
                      <Tr key={i}>
                        {[
                          { k: 'name', ph: 'Full name' },
                          { k: 'relationship', ph: 'Spouse/Son...' },
                          { k: 'age', ph: 'Age' },
                          { k: 'sex', ph: '' },
                          { k: 'civil_status', ph: '' },
                          { k: 'education', ph: '' },
                          { k: 'occupation', ph: 'Occupation' },
                          { k: 'monthly_income', ph: '0' },
                        ].map(({ k, ph }) => (
                          <Td key={k} py={1}>
                            {k === 'sex' ? (
                              <Select size="xs" borderRadius="md" value={m[k as keyof typeof m] as string} onChange={e => updateMember(i, k, e.target.value)} placeholder="-" minW="70px">
                                <option>Male</option><option>Female</option>
                              </Select>
                            ) : k === 'civil_status' ? (
                              <Select size="xs" borderRadius="md" value={m[k as keyof typeof m] as string} onChange={e => updateMember(i, k, e.target.value)} placeholder="-" minW="90px">
                                {CIVIL_STATUSES.map(s => <option key={s}>{s}</option>)}
                              </Select>
                            ) : k === 'education' ? (
                              <Select size="xs" borderRadius="md" value={m[k as keyof typeof m] as string} onChange={e => updateMember(i, k, e.target.value)} placeholder="-" minW="100px">
                                {EDUCATION_LEVELS.map(l => <option key={l}>{l}</option>)}
                              </Select>
                            ) : (
                              <Input size="xs" borderRadius="md" value={m[k as keyof typeof m] as string} onChange={e => updateMember(i, k, e.target.value)} placeholder={ph} minW={k === 'name' ? '130px' : '60px'} type={k === 'age' || k === 'monthly_income' ? 'number' : 'text'} />
                            )}
                          </Td>
                        ))}
                        <Td py={1}>
                          <IconButton aria-label="Remove" icon={<MdDelete />} size="xs" colorScheme="red" variant="ghost" borderRadius="md" isDisabled={familyMembers.length === 1} onClick={() => removeMember(i)} />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </VStack>
          )}

          {/* Step 3: Health & Housing */}
          {step === 3 && (
            <VStack spacing={5} align="stretch">
              <Text fontWeight={700} color="primary.700" fontSize="sm" textTransform="uppercase">IV. Health Status</Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                <Field label="General Health Condition">
                  <Select size="sm" borderRadius="lg" value={health.general_condition} onChange={e => setH('general_condition', e.target.value)} placeholder="Select...">
                    <option>Good</option><option>Fair</option><option>Poor</option>
                  </Select>
                </Field>
                <Field label="Existing Illness / Disability (if any)"><Input size="sm" borderRadius="lg" value={health.existing_illness} onChange={e => setH('existing_illness', e.target.value)} placeholder="e.g., Diabetes, Hypertension..." /></Field>
                <Field label="Person with Disability (PWD)?">
                  <Select size="sm" borderRadius="lg" value={health.is_pwd} onChange={e => setH('is_pwd', e.target.value)}>
                    <option>No</option><option>Yes</option>
                  </Select>
                </Field>
                {health.is_pwd === 'Yes' && (
                  <Field label="Type of Disability"><Input size="sm" borderRadius="lg" value={health.pwd_type} onChange={e => setH('pwd_type', e.target.value)} /></Field>
                )}
              </SimpleGrid>
              <Divider />
              <Text fontWeight={700} color="primary.700" fontSize="sm" textTransform="uppercase">V. Housing Status</Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                <Field label="Dwelling Ownership">
                  <Select size="sm" borderRadius="lg" value={housing.ownership} onChange={e => setHs('ownership', e.target.value)} placeholder="Select...">
                    <option>Owned</option><option>Rented</option><option>Shared</option><option>Informal Settler</option><option>Government-provided</option>
                  </Select>
                </Field>
                <Field label="Type of Structure">
                  <Select size="sm" borderRadius="lg" value={housing.structure_type} onChange={e => setHs('structure_type', e.target.value)} placeholder="Select...">
                    <option>Concrete</option><option>Semi-concrete</option><option>Wood</option><option>Light materials (nipa/bamboo)</option>
                  </Select>
                </Field>
                <Field label="Water Source">
                  <Select size="sm" borderRadius="lg" value={housing.water_source} onChange={e => setHs('water_source', e.target.value)} placeholder="Select...">
                    <option>Level III (Piped)</option><option>Level II (Community)</option><option>Level I (Deep well/pump)</option><option>Rainwater</option><option>Spring/River</option>
                  </Select>
                </Field>
                <Field label="Toilet Facility">
                  <Select size="sm" borderRadius="lg" value={housing.toilet_type} onChange={e => setHs('toilet_type', e.target.value)} placeholder="Select...">
                    <option>Water-sealed</option><option>Open pit</option><option>None</option><option>Shared with neighbor</option>
                  </Select>
                </Field>
                <Field label="Electricity">
                  <Select size="sm" borderRadius="lg" value={housing.electricity} onChange={e => setHs('electricity', e.target.value)}>
                    <option>Yes</option><option>No</option>
                  </Select>
                </Field>
              </SimpleGrid>
              <Divider />
              <Text fontWeight={700} color="primary.700" fontSize="sm" textTransform="uppercase">VI. Economic Situation</Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                <Field label="Main Source of Income"><Input size="sm" borderRadius="lg" value={economic.main_income_source} onChange={e => setE('main_income_source', e.target.value)} placeholder="e.g., Farming, Fishing..." /></Field>
                <Field label="Monthly Family Income (PHP)"><Input size="sm" borderRadius="lg" type="number" value={economic.monthly_family_income} onChange={e => setE('monthly_family_income', e.target.value)} /></Field>
                <Field label="Monthly Family Expenses (PHP)"><Input size="sm" borderRadius="lg" type="number" value={economic.monthly_expenses} onChange={e => setE('monthly_expenses', e.target.value)} /></Field>
                <Field label="Total Outstanding Debts (PHP)"><Input size="sm" borderRadius="lg" type="number" value={economic.total_debts} onChange={e => setE('total_debts', e.target.value)} /></Field>
              </SimpleGrid>
            </VStack>
          )}

          {/* Step 4: Problem & Assessment */}
          {step === 4 && (
            <VStack spacing={5} align="stretch">
              <Text fontWeight={700} color="primary.700" fontSize="sm" textTransform="uppercase">VII. Problem Identification</Text>
              <Box>
                <Text fontSize="xs" fontWeight={600} color="gray.600" mb={2}>Type/s of Problem (check all that apply)</Text>
                <CheckboxGroup value={problems.types} onChange={(vals) => setProblems(p => ({ ...p, types: vals as string[] }))}>
                  <SimpleGrid columns={{ base: 2, md: 3 }} spacing={2}>
                    {PROBLEM_TYPES.map(t => <Checkbox key={t} value={t} size="sm" colorScheme="blue"><Text fontSize="sm">{t}</Text></Checkbox>)}
                  </SimpleGrid>
                </CheckboxGroup>
              </Box>
              <Field label="Brief Description of Problem / Situation">
                <Textarea size="sm" borderRadius="lg" rows={4} value={problems.description} onChange={e => setProblems(p => ({ ...p, description: e.target.value }))} placeholder="Describe the problem or situation of the client in detail..." />
              </Field>
              <Field label="Duration of Problem"><Input size="sm" borderRadius="lg" value={problems.duration} onChange={e => setProblems(p => ({ ...p, duration: e.target.value }))} placeholder="e.g., 3 months, since 2022..." /></Field>
              <Divider />
              <Text fontWeight={700} color="primary.700" fontSize="sm" textTransform="uppercase">VIII. Assessment & Recommendations</Text>
              <Field label="Assessment / Social Worker's Findings">
                <Textarea size="sm" borderRadius="lg" rows={3} value={assessment.assessment_notes} onChange={e => setAssessment(a => ({ ...a, assessment_notes: e.target.value }))} placeholder="Social worker's assessment of the situation..." />
              </Field>
              <Box>
                <Text fontSize="xs" fontWeight={600} color="gray.600" mb={2}>Recommended Services</Text>
                <CheckboxGroup value={assessment.recommended_services} onChange={(vals) => setAssessment(a => ({ ...a, recommended_services: vals as string[] }))}>
                  <SimpleGrid columns={{ base: 2, md: 3 }} spacing={2}>
                    {SERVICES.map(s => <Checkbox key={s} value={s} size="sm" colorScheme="green"><Text fontSize="sm">{s}</Text></Checkbox>)}
                  </SimpleGrid>
                </CheckboxGroup>
              </Box>
              <Field label="Remarks"><Textarea size="sm" borderRadius="lg" rows={2} value={assessment.remarks} onChange={e => setAssessment(a => ({ ...a, remarks: e.target.value }))} /></Field>
              <Divider />
              <Text fontWeight={700} color="primary.700" fontSize="sm" textTransform="uppercase">IX. Social Worker Information</Text>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                <Field label="Social Worker's Name"><Input size="sm" borderRadius="lg" value={worker.worker_name} onChange={e => setW('worker_name', e.target.value)} placeholder="Name of the assessing worker" /></Field>
                <Field label="Designation"><Input size="sm" borderRadius="lg" value={worker.designation} onChange={e => setW('designation', e.target.value)} /></Field>
                <Field label="Date of Assessment"><Input type="date" size="sm" borderRadius="lg" value={worker.assessment_date} onChange={e => setW('assessment_date', e.target.value)} /></Field>
              </SimpleGrid>
            </VStack>
          )}

          {/* Step 5: Confirmation */}
          {step === 5 && (
            <VStack spacing={4} align="stretch">
              <Box bg="blue.50" p={4} borderRadius="xl" border="1px solid" borderColor="blue.200">
                <Text fontWeight={700} color="blue.800" mb={2}>Ready to Submit?</Text>
                <Text fontSize="sm" color="blue.700">Please review that all information is correct. After submission, you will be required to upload 4 supporting documents:</Text>
                <VStack align="start" mt={2} spacing={1}>
                  {['Barangay Certificate of Indigency', 'Medical Certificate / Abstract', 'Valid Government ID', 'Hospital Bill or Receipt'].map(d => (
                    <HStack key={d} spacing={2}><Text fontSize="sm" color="blue.600">•</Text><Text fontSize="sm" color="blue.700">{d}</Text></HStack>
                  ))}
                </VStack>
              </Box>
              <Box bg="gray.50" p={4} borderRadius="xl">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                  {[
                    ['Client Name', `${personal.last_name}, ${personal.first_name} ${personal.middle_name}`.trim()],
                    ['Sex', personal.sex], ['Civil Status', personal.civil_status],
                    ['Barangay', address.barangay], ['Municipality', address.municipality],
                    ['Problem Types', problems.types.join(', ') || '—'],
                  ].map(([k, v]) => (
                    <Box key={k}><Text fontSize="xs" color="gray.400" fontWeight={600}>{k}</Text><Text fontSize="sm">{v || '—'}</Text></Box>
                  ))}
                </SimpleGrid>
              </Box>
              <Box bg="yellow.50" p={3} borderRadius="xl" border="1px solid" borderColor="yellow.200">
                <Text fontSize="xs" color="yellow.800">
                  I hereby certify that the information I have provided is true and correct to the best of my knowledge. I understand that providing false information may result in the denial of assistance.
                </Text>
              </Box>
            </VStack>
          )}
        </CardBody>
      </Card>

      {/* Navigation */}
      <Card borderRadius="xl" boxShadow="sm">
        <CardBody py={3}>
          <HStack justify="space-between">
            <Button leftIcon={<MdArrowBack />} variant="outline" size="sm" borderRadius="lg" isDisabled={step === 0} onClick={() => setStep(s => s - 1)}>Previous</Button>
            <Text fontSize="xs" color="gray.400">Step {step + 1} of {STEPS.length}</Text>
            {step < STEPS.length - 1 ? (
              <Button rightIcon={<MdArrowForward />} colorScheme="blue" size="sm" borderRadius="lg" onClick={() => setStep(s => s + 1)}>Next</Button>
            ) : (
              <Button colorScheme="green" size="sm" borderRadius="lg" isLoading={submitting} onClick={handleSubmit}>Submit Form</Button>
            )}
          </HStack>
        </CardBody>
      </Card>
    </VStack>
  )
}
