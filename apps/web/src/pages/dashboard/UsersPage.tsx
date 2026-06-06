import { useEffect, useState } from 'react'
import {
  VStack, HStack, Heading, Text, Card, CardBody, Badge, Button, Box,
  Table, Thead, Tbody, Tr, Th, Td, TableContainer, Avatar, useToast,
  Select, Flex, Input, InputGroup, InputLeftElement, Tabs, TabList, Tab,
  TabPanels, TabPanel, Icon, Divider, Alert, AlertIcon
} from '@chakra-ui/react'
import {
  MdSearch, MdLockOpen, MdLockOutline, MdCheckCircle,
  MdCancel, MdPeople, MdPersonAdd, MdHourglassEmpty
} from 'react-icons/md'
import { usersApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

const ROLE_COLOR: Record<string, string> = { superadmin: 'red', admin: 'blue', beneficiary: 'green' }

export default function UsersPage() {
  const { user: me } = useAuthStore()
  const [users, setUsers] = useState<any[]>([])
  const [pending, setPending] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingLoading, setPendingLoading] = useState(true)
  const [search, setSearch] = useState('')
  const toast = useToast()

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

  useEffect(() => {
    loadUsers()
    loadPending()
  }, [])

  const filtered = users.filter((u) =>
    (u.email?.toLowerCase() + (u.first_name?.toLowerCase() || '') + (u.last_name?.toLowerCase() || '')).includes(search.toLowerCase())
  )

  const handleRoleChange = async (id: number, role: string) => {
    try {
      await usersApi.updateRole(id, role)
      toast({ title: 'Role updated', status: 'success', duration: 2000 })
      loadUsers()
    } catch { toast({ title: 'Error updating role', status: 'error', duration: 3000 }) }
  }

  const handleToggle = async (id: number) => {
    try {
      const res = await usersApi.toggleActive(id)
      toast({ title: res.data.message, status: 'info', duration: 2000 })
      loadUsers()
    } catch { toast({ title: 'Error', status: 'error', duration: 3000 }) }
  }

  const handleApprove = async (id: number, name: string) => {
    try {
      const res = await usersApi.approve(id)
      toast({ title: '✅ Approved!', description: res.data.message, status: 'success', duration: 3000 })
      loadPending()
      loadUsers()
    } catch { toast({ title: 'Error approving user', status: 'error', duration: 3000 }) }
  }

  const handleReject = async (id: number, name: string) => {
    try {
      await usersApi.reject(id)
      toast({ title: 'Registration rejected', description: `${name}'s registration has been removed.`, status: 'warning', duration: 3000 })
      loadPending()
    } catch { toast({ title: 'Error rejecting registration', status: 'error', duration: 3000 }) }
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
        <Box>
          <Heading size="lg" color="gray.800">User Management</Heading>
          <Text color="gray.500" fontSize="sm">Manage system users, roles, and pending registrations</Text>
        </Box>
        <HStack spacing={2}>
          {pending.length > 0 && (
            <Badge colorScheme="orange" fontSize="sm" px={3} py={1} borderRadius="full">
              🕐 {pending.length} pending approval{pending.length > 1 ? 's' : ''}
            </Badge>
          )}
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
                  <InputGroup maxW="280px">
                    <InputLeftElement pointerEvents="none">
                      <MdSearch color="gray" />
                    </InputLeftElement>
                    <Input
                      placeholder="Search users…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      borderRadius="lg"
                    />
                  </InputGroup>
                  <Text fontSize="sm" color="gray.400">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</Text>
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
                        {me?.role === 'superadmin' && <Th>Actions</Th>}
                      </Tr>
                    </Thead>
                    <Tbody>
                      {loading
                        ? Array(5).fill(0).map((_, i) => (
                          <Tr key={i}><Td colSpan={6}><Box h="40px" bg="gray.100" borderRadius="md" /></Td></Tr>
                        ))
                        : filtered.map((u) => (
                          <Tr key={u.id} _hover={{ bg: 'gray.50' }}>
                            <Td>
                              <HStack>
                                <Avatar size="sm" name={`${u.first_name} ${u.last_name}`}
                                  bg={`${ROLE_COLOR[u.role]}.400`} color="white" />
                                <VStack align="start" spacing={0}>
                                  <Text fontSize="sm" fontWeight={600}>
                                    {u.first_name ? `${u.first_name} ${u.last_name}` : 'No name'}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500">{u.email}</Text>
                                </VStack>
                              </HStack>
                            </Td>
                            <Td><Text fontSize="sm" color="gray.600">{u.barangay || '—'}</Text></Td>
                            <Td>
                              {me?.role === 'superadmin' && u.id !== me.id ? (
                                <Select size="sm" value={u.role} maxW="130px" focusBorderColor="blue.400"
                                  borderRadius="lg"
                                  onChange={(e) => handleRoleChange(u.id, e.target.value)}>
                                  <option value="beneficiary">Beneficiary</option>
                                  <option value="admin">Admin</option>
                                  <option value="superadmin">Superadmin</option>
                                </Select>
                              ) : (
                                <Badge colorScheme={ROLE_COLOR[u.role]} borderRadius="full" px={2}>
                                  {u.role}
                                </Badge>
                              )}
                            </Td>
                            <Td>
                              <Badge colorScheme={u.is_active ? 'green' : 'gray'} borderRadius="full" px={2}>
                                {u.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </Td>
                            <Td><Text fontSize="xs" color="gray.400">{u.created_at?.slice(0, 10)}</Text></Td>
                            {me?.role === 'superadmin' && (
                              <Td>
                                {u.id !== me.id && (
                                  <Button size="xs" variant="outline"
                                    colorScheme={u.is_active ? 'red' : 'green'}
                                    leftIcon={u.is_active ? <MdLockOutline /> : <MdLockOpen />}
                                    borderRadius="lg"
                                    onClick={() => handleToggle(u.id)}>
                                    {u.is_active ? 'Deactivate' : 'Activate'}
                                  </Button>
                                )}
                              </Td>
                            )}
                          </Tr>
                        ))}
                    </Tbody>
                  </Table>
                </TableContainer>
                {!loading && filtered.length === 0 && (
                  <Text textAlign="center" color="gray.400" py={8} fontSize="sm">No users found</Text>
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
                  <strong>{pending.length}</strong> beneficiar{pending.length === 1 ? 'y has' : 'ies have'} registered and {pending.length === 1 ? 'is' : 'are'} waiting for your approval.
                </Text>
              </Alert>
            )}

            <Card borderRadius="xl" boxShadow="sm">
              <CardBody>
                {pendingLoading ? (
                  <VStack spacing={3}>
                    {[1,2,3].map(i => <Box key={i} h="72px" bg="gray.100" borderRadius="xl" w="full" />)}
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
                          key={u.id}
                          p={4}
                          borderRadius="xl"
                          border="1px solid"
                          borderColor="orange.200"
                          bg="orange.50"
                          _hover={{ borderColor: 'orange.300', bg: 'orange.50' }}
                        >
                          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                            <HStack spacing={3} flex={1}>
                              <Avatar size="md" name={name} bg="orange.400" color="white" />
                              <VStack align="start" spacing={0.5}>
                                <Text fontWeight={700} color="gray.800" fontSize="sm">{name}</Text>
                                <Text fontSize="xs" color="gray.500">{u.email}</Text>
                                <HStack spacing={3} mt={0.5}>
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
                                size="sm"
                                colorScheme="green"
                                borderRadius="lg"
                                leftIcon={<MdCheckCircle />}
                                onClick={() => handleApprove(u.id, name)}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                colorScheme="red"
                                variant="outline"
                                borderRadius="lg"
                                leftIcon={<MdCancel />}
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
    </VStack>
  )
}
