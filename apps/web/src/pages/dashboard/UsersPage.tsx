import { useEffect, useState } from 'react'
import {
  VStack, HStack, Heading, Text, Card, CardBody, Badge, Button, Box,
  Table, Thead, Tbody, Tr, Th, Td, TableContainer, Avatar, useToast,
  Select, Flex, Input, InputGroup, InputLeftElement
} from '@chakra-ui/react'
import { MdSearch, MdLockOpen, MdLockOutline } from 'react-icons/md'
import { usersApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

const ROLE_COLOR: Record<string, string> = { superadmin: 'red', admin: 'blue', beneficiary: 'green' }

export default function UsersPage() {
  const { user: me } = useAuthStore()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const toast = useToast()

  const load = () => {
    usersApi.list().then((res) => setUsers(res.data)).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const filtered = users.filter((u) =>
    (u.email?.toLowerCase() + u.first_name?.toLowerCase() + u.last_name?.toLowerCase()).includes(search.toLowerCase())
  )

  const handleRoleChange = async (id: number, role: string) => {
    try {
      await usersApi.updateRole(id, role)
      toast({ title: 'Role updated', status: 'success', duration: 2000 })
      load()
    } catch { toast({ title: 'Error updating role', status: 'error', duration: 3000 }) }
  }

  const handleToggle = async (id: number) => {
    try {
      const res = await usersApi.toggleActive(id)
      toast({ title: res.data.message, status: 'info', duration: 2000 })
      load()
    } catch { toast({ title: 'Error', status: 'error', duration: 3000 }) }
  }

  return (
    <VStack spacing={6} align="stretch">
      <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
        <Box>
          <Heading size="lg" color="gray.800">User Management</Heading>
          <Text color="gray.500" fontSize="sm">Manage system users, roles and access</Text>
        </Box>
        <InputGroup maxW="260px">
          <InputLeftElement pointerEvents="none">
            <MdSearch color="gray" />
          </InputLeftElement>
          <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </InputGroup>
      </Flex>

      <Card>
        <CardBody>
          <TableContainer>
            <Table variant="simple">
              <Thead>
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
                          <Avatar size="sm" name={`${u.first_name} ${u.last_name}`} bg={`${ROLE_COLOR[u.role]}.400`} color="white" />
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm" fontWeight={500}>
                              {u.first_name ? `${u.first_name} ${u.last_name}` : 'No name'}
                            </Text>
                            <Text fontSize="xs" color="gray.500">{u.email}</Text>
                          </VStack>
                        </HStack>
                      </Td>
                      <Td><Text fontSize="sm">{u.barangay || '—'}</Text></Td>
                      <Td>
                        {me?.role === 'superadmin' && u.id !== me.id ? (
                          <Select size="sm" value={u.role} maxW="130px" focusBorderColor="primary.500"
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}>
                            <option value="beneficiary">Beneficiary</option>
                            <option value="admin">Admin</option>
                            <option value="superadmin">Superadmin</option>
                          </Select>
                        ) : (
                          <Badge colorScheme={ROLE_COLOR[u.role]}>{u.role}</Badge>
                        )}
                      </Td>
                      <Td>
                        <Badge colorScheme={u.is_active ? 'green' : 'gray'}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </Td>
                      <Td><Text fontSize="xs" color="gray.500">{u.created_at?.slice(0, 10)}</Text></Td>
                      {me?.role === 'superadmin' && (
                        <Td>
                          {u.id !== me.id && (
                            <Button size="xs" variant="outline"
                              colorScheme={u.is_active ? 'red' : 'green'}
                              leftIcon={u.is_active ? <MdLockOutline /> : <MdLockOpen />}
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
            <Text textAlign="center" color="gray.500" py={8}>No users found</Text>
          )}
        </CardBody>
      </Card>
    </VStack>
  )
}
