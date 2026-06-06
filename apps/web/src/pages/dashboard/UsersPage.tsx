import { useEffect, useState } from 'react'
import {
  VStack, HStack, Heading, Text, Card, CardBody, Badge, Button, Box,
  Table, Thead, Tbody, Tr, Th, Td, TableContainer, Avatar, useToast,
  Select, Flex, Input, InputGroup, InputLeftElement, Tabs, TabList, Tab,
  TabPanels, TabPanel, Icon, Divider, Alert, AlertIcon,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, FormControl, FormLabel, SimpleGrid, InputRightElement,
  IconButton, FormHelperText, FormErrorMessage
} from '@chakra-ui/react'
import {
  MdSearch, MdLockOpen, MdLockOutline, MdCheckCircle,
  MdCancel, MdPeople, MdPersonAdd, MdHourglassEmpty,
  MdVisibility, MdVisibilityOff, MdAdminPanelSettings,
  MdPerson, MdEmail, MdPhone, MdLocationOn
} from 'react-icons/md'
import { usersApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

const ROLE_COLOR: Record<string, string> = {
  superadmin: 'red', admin: 'blue', beneficiary: 'green'
}
const ROLE_LABEL: Record<string, string> = {
  superadmin: 'Superadmin', admin: 'Admin', beneficiary: 'Beneficiary'
}

const BARANGAYS = [
  'Bunog', 'Campong Ulay', 'Candawaga', 'Canipaan', 'Culasian',
  'Iraan', 'Latud', 'Panalingaan', 'Punta Baja', 'Ransang', 'Taburi',
]

const EMPTY_FORM = {
  first_name: '', last_name: '', email: '',
  password: '', phone: '', barangay: '', role: 'beneficiary',
}

export default function UsersPage() {
  const { user: me } = useAuthStore()
  const [users, setUsers] = useState<any[]>([])
  const [pending, setPending] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingLoading, setPendingLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState<any>(EMPTY_FORM)
  const [showPw, setShowPw] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<any>({})
  const toast = useToast()

  const isSuperadmin = me?.role === 'superadmin'
  const isAdmin = me?.role === 'admin'

  const loadUsers = () => {
    usersApi.list()
      .then((res) => setUsers(res.data))
      .finally(() => setLoading(false))
  }
  const loadPending = () => {
    usersApi.pending()
      .then((res) => setPending(res.data))
      .finally(() => setPendingLoading(false))
  }

  useEffect(() => { loadUsers(); loadPending() }, [])

  const filtered = users.filter((u) =>
    (
      (u.email?.toLowerCase() || '') +
      (u.first_name?.toLowerCase() || '') +
      (u.last_name?.toLowerCase() || '')
    ).includes(search.toLowerCase())
  )

  const handleRoleChange = async (id: number, role: string) => {
    try {
      await usersApi.updateRole(id, role)
      toast({ title: 'Role updated', status: 'success', duration: 2000 })
      loadUsers()
    } catch {
      toast({ title: 'Error updating role', status: 'error', duration: 3000 })
    }
  }

  const handleToggle = async (id: number) => {
    try {
      const res = await usersApi.toggleActive(id)
      toast({ title: res.data.message, status: 'info', duration: 2000 })
      loadUsers()
    } catch {
      toast({ title: 'Error', status: 'error', duration: 3000 })
    }
  }

  const handleApprove = async (id: number, name: string) => {
    try {
      const res = await usersApi.approve(id)
      toast({ title: '✅ Approved!', description: res.data.message, status: 'success', duration: 3000 })
      loadPending(); loadUsers()
    } catch {
      toast({ title: 'Error approving user', status: 'error', duration: 3000 })
    }
  }

  const handleReject = async (id: number, name: string) => {
    try {
      await usersApi.reject(id)
      toast({
        title: 'Registration rejected',
        description: `${name}'s registration has been removed.`,
        status: 'warning', duration: 3000
      })
      loadPending()
    } catch {
      toast({ title: 'Error rejecting registration', status: 'error', duration: 3000 })
    }
  }

  // ── Create User ──
  const setF = (k: string) => (e: any) => {
    setForm((f: any) => ({ ...f, [k]: e.target.value }))
    setErrors((err: any) => ({ ...err, [k]: undefined }))
  }

  const validate = () => {
    const e: any = {}
    if (!form.first_name.trim()) e.first_name = 'Required'
    if (!form.last_name.trim()) e.last_name = 'Required'
    if (!form.email.trim()) e.email = 'Required'
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) e.email = 'Invalid email address'
    if (!form.password) e.password = 'Required'
    else if (form.password.length < 8) e.password = 'At least 8 characters'
    if (isSuperadmin && !form.role) e.role = 'Required'
    return e
  }

  const handleCreate = async () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setSaving(true)
    try {
      const payload: any = {
        email: form.email.trim(),
        password: form.password,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone.trim() || undefined,
        barangay: form.barangay || undefined,
        role: isSuperadmin ? form.role : 'beneficiary',
      }
      await usersApi.create(payload)
      toast({
        title: '✅ Account Created!',
        description: `${form.first_name} ${form.last_name} (${ROLE_LABEL[payload.role]}) can now log in immediately.`,
        status: 'success', duration: 4000, isClosable: true,
      })
      setShowCreate(false)
      setForm(EMPTY_FORM)
      setErrors({})
      loadUsers()
    } catch (err: any) {
      toast({
        title: 'Failed to create account',
        description: err.response?.data?.detail || 'Please check the details and try again.',
        status: 'error', duration: 5000, isClosable: true,
      })
    } finally {
      setSaving(false)
    }
  }

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, role: isAdmin ? 'beneficiary' : 'beneficiary' })
    setErrors({})
    setShowPw(false)
    setShowCreate(true)
  }

  return (
    <VStack spacing={6} align="stretch">

      {/* Header */}
      <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
        <Box>
          <Heading size="lg" color="gray.800">User Management</Heading>
          <Text color="gray.500" fontSize="sm">
            Manage system users, roles, and pending registrations
          </Text>
        </Box>
        <HStack spacing={3}>
          {pending.length > 0 && (
            <Badge colorScheme="orange" fontSize="sm" px={3} py={1} borderRadius="full">
              🕐 {pending.length} pending approval{pending.length > 1 ? 's' : ''}
            </Badge>
          )}
          <Button
            colorScheme="blue" leftIcon={<MdPersonAdd />}
            borderRadius="lg" onClick={openCreate}
          >
            Create User
          </Button>
        </HStack>
      </Flex>

      <Tabs colorScheme="blue" variant="enclosed-colored">
        <TabList>
          <Tab fontWeight={600} gap={2}>
            <Icon as={MdPeople} />
            Active Users
            <Badge colorScheme="blue" borderRadius="full" ml={1}>{users.length}</Badge>
          </Tab>
          <Tab fontWeight={600} gap={2}>
            <Icon as={MdHourglassEmpty} />
            Pending Approval
            {pending.length > 0 && (
              <Badge colorScheme="orange" borderRadius="full" ml={1}>{pending.length}</Badge>
            )}
          </Tab>
        </TabList>

        <TabPanels>
          {/* ── Active Users Tab ── */}
          <TabPanel px={0} pt={4}>
            <Card borderRadius="xl" boxShadow="sm">
              <CardBody>
                <HStack mb={4} justify="space-between">
                  <InputGroup maxW="300px">
                    <InputLeftElement pointerEvents="none">
                      <Icon as={MdSearch} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      placeholder="Search by name or email…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      borderRadius="lg"
                    />
                  </InputGroup>
                  <Text fontSize="sm" color="gray.400">
                    {filtered.length} user{filtered.length !== 1 ? 's' : ''}
                  </Text>
                </HStack>

                <TableContainer>
                  <Table variant="simple" size="sm">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>User</Th>
                        <Th>Barangay</Th>
                        <Th>Role</Th>
                        <Th>Status</Th>
                        <Th>Joined</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {loading
                        ? Array(4).fill(0).map((_, i) => (
                          <Tr key={i}>
                            <Td colSpan={6}>
                              <Box h="44px" bg="gray.100" borderRadius="lg" />
                            </Td>
                          </Tr>
                        ))
                        : filtered.map((u) => (
                          <Tr key={u.id} _hover={{ bg: 'gray.50' }}>
                            <Td>
                              <HStack spacing={3}>
                                <Avatar
                                  size="sm"
                                  name={`${u.first_name} ${u.last_name}`}
                                  bg={`${ROLE_COLOR[u.role]}.400`}
                                  color="white"
                                />
                                <VStack align="start" spacing={0}>
                                  <Text fontSize="sm" fontWeight={600} color="gray.800">
                                    {u.first_name ? `${u.first_name} ${u.last_name}` : 'No name'}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500">{u.email}</Text>
                                </VStack>
                              </HStack>
                            </Td>
                            <Td>
                              <Text fontSize="sm" color="gray.600">{u.barangay || '—'}</Text>
                            </Td>
                            <Td>
                              {isSuperadmin && u.id !== me?.id ? (
                                <Select
                                  size="sm" value={u.role} maxW="130px"
                                  focusBorderColor="blue.400" borderRadius="lg"
                                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                >
                                  <option value="beneficiary">Beneficiary</option>
                                  <option value="admin">Admin</option>
                                  <option value="superadmin">Superadmin</option>
                                </Select>
                              ) : (
                                <Badge
                                  colorScheme={ROLE_COLOR[u.role]}
                                  borderRadius="full" px={2} fontSize="xs"
                                >
                                  {ROLE_LABEL[u.role]}
                                </Badge>
                              )}
                            </Td>
                            <Td>
                              <Badge
                                colorScheme={u.is_active ? 'green' : 'gray'}
                                borderRadius="full" px={2} fontSize="xs"
                              >
                                {u.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </Td>
                            <Td>
                              <Text fontSize="xs" color="gray.400">
                                {u.created_at?.slice(0, 10)}
                              </Text>
                            </Td>
                            <Td>
                              {u.id !== me?.id && isSuperadmin && (
                                <Button
                                  size="xs" variant="outline" borderRadius="lg"
                                  colorScheme={u.is_active ? 'red' : 'green'}
                                  leftIcon={<Icon as={u.is_active ? MdLockOutline : MdLockOpen} />}
                                  onClick={() => handleToggle(u.id)}
                                >
                                  {u.is_active ? 'Deactivate' : 'Activate'}
                                </Button>
                              )}
                            </Td>
                          </Tr>
                        ))}
                    </Tbody>
                  </Table>
                </TableContainer>

                {!loading && filtered.length === 0 && (
                  <Flex direction="column" align="center" py={10} gap={2}>
                    <Icon as={MdPeople} boxSize={10} color="gray.200" />
                    <Text color="gray.400" fontSize="sm">No users found</Text>
                  </Flex>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          {/* ── Pending Approval Tab ── */}
          <TabPanel px={0} pt={4}>
            {!pendingLoading && pending.length > 0 && (
              <Alert status="warning" borderRadius="xl" mb={4} fontSize="sm">
                <AlertIcon />
                <Text>
                  <strong>{pending.length}</strong> beneficiar
                  {pending.length === 1 ? 'y has' : 'ies have'} registered and{' '}
                  {pending.length === 1 ? 'is' : 'are'} waiting for your approval.
                </Text>
              </Alert>
            )}

            <Card borderRadius="xl" boxShadow="sm">
              <CardBody>
                {pendingLoading ? (
                  <VStack spacing={3}>
                    {[1, 2, 3].map(i => (
                      <Box key={i} h="72px" bg="gray.100" borderRadius="xl" w="full" />
                    ))}
                  </VStack>
                ) : pending.length === 0 ? (
                  <Flex direction="column" align="center" py={12} gap={3}>
                    <Icon as={MdCheckCircle} color="green.200" boxSize={14} />
                    <Heading size="sm" color="gray.400">All caught up!</Heading>
                    <Text color="gray.400" fontSize="sm">No pending registrations at this time.</Text>
                  </Flex>
                ) : (
                  <VStack spacing={3} align="stretch">
                    {pending.map((u) => {
                      const name = u.first_name ? `${u.first_name} ${u.last_name}` : u.email
                      return (
                        <Box
                          key={u.id} p={4} borderRadius="xl"
                          border="1px solid" borderColor="orange.200" bg="orange.50"
                        >
                          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                            <HStack spacing={3} flex={1}>
                              <Avatar size="md" name={name} bg="orange.400" color="white" />
                              <VStack align="start" spacing={0.5}>
                                <Text fontWeight={700} color="gray.800" fontSize="sm">{name}</Text>
                                <Text fontSize="xs" color="gray.500">{u.email}</Text>
                                <HStack spacing={3} mt={0.5} flexWrap="wrap">
                                  {u.barangay && (
                                    <Badge colorScheme="blue" fontSize="xs" borderRadius="full" px={2}>
                                      📍 Brgy. {u.barangay}
                                    </Badge>
                                  )}
                                  {u.phone && (
                                    <Text fontSize="xs" color="gray.400">📞 {u.phone}</Text>
                                  )}
                                  <Text fontSize="xs" color="gray.400">
                                    Registered: {u.created_at?.slice(0, 10)}
                                  </Text>
                                </HStack>
                              </VStack>
                            </HStack>
                            <HStack spacing={2}>
                              <Button
                                size="sm" colorScheme="green" borderRadius="lg"
                                leftIcon={<Icon as={MdCheckCircle} />}
                                onClick={() => handleApprove(u.id, name)}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm" colorScheme="red" variant="outline"
                                borderRadius="lg" leftIcon={<Icon as={MdCancel} />}
                                onClick={() => handleReject(u.id, name)}
                              >
                                Reject
                              </Button>
                            </HStack>
                          </Flex>
                        </Box>
                      )
                    })}
                  </VStack>
                )}
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* ══════════════════════════════════════════
          Create User Modal
      ══════════════════════════════════════════ */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} size="lg" closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent borderRadius="2xl" overflow="hidden">
          {/* Colour bar based on selected role */}
          <Box
            h="5px"
            bgGradient={
              form.role === 'admin'
                ? 'linear(to-r, blue.400, blue.600)'
                : form.role === 'superadmin'
                ? 'linear(to-r, red.400, red.600)'
                : 'linear(to-r, green.400, teal.500)'
            }
          />

          <ModalHeader pb={1}>
            <HStack spacing={2}>
              <Icon
                as={form.role === 'admin' || form.role === 'superadmin' ? MdAdminPanelSettings : MdPerson}
                color={
                  form.role === 'admin' ? 'blue.500'
                  : form.role === 'superadmin' ? 'red.500'
                  : 'green.500'
                }
                boxSize={5}
              />
              <Text>Create New {ROLE_LABEL[form.role] || 'User'} Account</Text>
            </HStack>
            <Text fontSize="sm" fontWeight={400} color="gray.500" mt={0.5}>
              {isSuperadmin
                ? 'Account will be active immediately — no approval needed.'
                : 'New beneficiary account will be active immediately.'}
            </Text>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody pb={2}>
            <VStack spacing={5} align="stretch">

              {/* Role selector — superadmin only */}
              {isSuperadmin && (
                <FormControl isInvalid={!!errors.role}>
                  <FormLabel fontSize="sm" fontWeight={600}>
                    <HStack spacing={1}>
                      <Icon as={MdAdminPanelSettings} boxSize={4} />
                      <Text>Account Role</Text>
                    </HStack>
                  </FormLabel>
                  <Select
                    value={form.role}
                    onChange={setF('role')}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                    fontWeight={500}
                  >
                    <option value="beneficiary">👤 Beneficiary — can browse programs &amp; apply</option>
                    <option value="admin">🛡️ Admin — can manage programs &amp; review applications</option>
                    <option value="superadmin">👑 Superadmin — full system access</option>
                  </Select>
                  <FormErrorMessage>{errors.role}</FormErrorMessage>
                </FormControl>
              )}

              {isAdmin && (
                <Box bg="blue.50" px={4} py={2.5} borderRadius="xl">
                  <HStack spacing={2}>
                    <Icon as={MdPerson} color="blue.500" />
                    <Text fontSize="sm" color="blue.700" fontWeight={500}>
                      Creating a <strong>Beneficiary</strong> account. Only Superadmin can create Admin accounts.
                    </Text>
                  </HStack>
                </Box>
              )}

              <Divider />

              {/* Name fields */}
              <SimpleGrid columns={2} spacing={4}>
                <FormControl isRequired isInvalid={!!errors.first_name}>
                  <FormLabel fontSize="sm" fontWeight={600}>
                    <HStack spacing={1}>
                      <Icon as={MdPerson} boxSize={4} color="gray.500" />
                      <Text>First Name</Text>
                    </HStack>
                  </FormLabel>
                  <Input
                    value={form.first_name} onChange={setF('first_name')}
                    placeholder="e.g. Maria" borderRadius="lg" focusBorderColor="blue.400"
                  />
                  <FormErrorMessage>{errors.first_name}</FormErrorMessage>
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.last_name}>
                  <FormLabel fontSize="sm" fontWeight={600}>Last Name</FormLabel>
                  <Input
                    value={form.last_name} onChange={setF('last_name')}
                    placeholder="e.g. Santos" borderRadius="lg" focusBorderColor="blue.400"
                  />
                  <FormErrorMessage>{errors.last_name}</FormErrorMessage>
                </FormControl>
              </SimpleGrid>

              {/* Email */}
              <FormControl isRequired isInvalid={!!errors.email}>
                <FormLabel fontSize="sm" fontWeight={600}>
                  <HStack spacing={1}>
                    <Icon as={MdEmail} boxSize={4} color="gray.500" />
                    <Text>Email Address</Text>
                  </HStack>
                </FormLabel>
                <Input
                  type="email" value={form.email} onChange={setF('email')}
                  placeholder="e.g. maria.santos@email.com"
                  borderRadius="lg" focusBorderColor="blue.400"
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>

              {/* Password */}
              <FormControl isRequired isInvalid={!!errors.password}>
                <FormLabel fontSize="sm" fontWeight={600}>Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPw ? 'text' : 'password'}
                    value={form.password} onChange={setF('password')}
                    placeholder="Minimum 8 characters"
                    borderRadius="lg" focusBorderColor="blue.400"
                    pr="3rem"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label="Toggle password"
                      icon={<Icon as={showPw ? MdVisibilityOff : MdVisibility} />}
                      variant="ghost" size="sm" borderRadius="lg"
                      onClick={() => setShowPw((v) => !v)}
                    />
                  </InputRightElement>
                </InputGroup>
                {!errors.password
                  ? <FormHelperText fontSize="xs" color="gray.400">Share this with the user — they can update it in their profile.</FormHelperText>
                  : <FormErrorMessage>{errors.password}</FormErrorMessage>
                }
              </FormControl>

              {/* Phone + Barangay */}
              <SimpleGrid columns={2} spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight={600}>
                    <HStack spacing={1}>
                      <Icon as={MdPhone} boxSize={4} color="gray.500" />
                      <Text>Phone <Text as="span" color="gray.400" fontWeight={400}>(optional)</Text></Text>
                    </HStack>
                  </FormLabel>
                  <Input
                    value={form.phone} onChange={setF('phone')}
                    placeholder="09XXXXXXXXX" borderRadius="lg" focusBorderColor="blue.400"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight={600}>
                    <HStack spacing={1}>
                      <Icon as={MdLocationOn} boxSize={4} color="gray.500" />
                      <Text>Barangay <Text as="span" color="gray.400" fontWeight={400}>(optional)</Text></Text>
                    </HStack>
                  </FormLabel>
                  <Select
                    value={form.barangay} onChange={setF('barangay')}
                    borderRadius="lg" focusBorderColor="blue.400"
                  >
                    <option value="">Select barangay</option>
                    {BARANGAYS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </Select>
                </FormControl>
              </SimpleGrid>

            </VStack>
          </ModalBody>

          <ModalFooter pt={4} borderTopWidth={1} borderColor="gray.100">
            <Button variant="ghost" mr={3} borderRadius="lg" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button
              colorScheme={
                form.role === 'admin' ? 'blue'
                : form.role === 'superadmin' ? 'red'
                : 'green'
              }
              borderRadius="lg"
              leftIcon={<Icon as={MdPersonAdd} />}
              isLoading={saving}
              loadingText="Creating account…"
              onClick={handleCreate}
            >
              Create {ROLE_LABEL[form.role] || 'User'} Account
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </VStack>
  )
}
