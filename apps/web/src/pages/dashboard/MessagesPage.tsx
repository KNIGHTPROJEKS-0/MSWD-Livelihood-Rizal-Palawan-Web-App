import { useEffect, useRef, useState } from 'react'
import {
  Box, VStack, HStack, Text, Badge, Button, Icon, Card, CardBody,
  Heading, Divider, Flex, Spinner, useToast, Textarea, Avatar,
  Input
} from '@chakra-ui/react'
import { MdChat, MdSend, MdPerson, MdSearch } from 'react-icons/md'
import { messagesApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

const ROLE_COLOR: Record<string, string> = { superadmin: 'red', admin: 'blue', beneficiary: 'green' }
const ROLE_LABEL: Record<string, string> = { superadmin: 'Superadmin', admin: 'Admin', beneficiary: 'Beneficiary' }

export default function MessagesPage() {
  const { user } = useAuthStore()
  const toast = useToast()
  const bottomRef = useRef<HTMLDivElement>(null)
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

  const [conversations, setConversations] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [activePartner, setActivePartner] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [search, setSearch] = useState('')

  const loadConversations = () => {
    messagesApi.conversations().then(r => setConversations(r.data)).catch(console.error).finally(() => setLoadingConvs(false))
  }

  const loadStaff = () => {
    messagesApi.staff().then(r => setStaff(r.data)).catch(console.error)
  }

  useEffect(() => {
    loadConversations()
    loadStaff()
    const interval = setInterval(loadConversations, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!activePartner) return
    const fetchMsgs = () => {
      messagesApi.getWith(activePartner.id).then(r => {
        setMessages(r.data)
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      }).catch(console.error)
    }
    setLoadingMsgs(true)
    messagesApi.getWith(activePartner.id).then(r => {
      setMessages(r.data)
      setLoadingMsgs(false)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }).catch(() => setLoadingMsgs(false))
    const interval = setInterval(fetchMsgs, 5000)
    return () => clearInterval(interval)
  }, [activePartner?.id])

  const handleSend = async () => {
    if (!messageText.trim() || !activePartner) return
    setSending(true)
    try {
      const res = await messagesApi.send(activePartner.id, messageText.trim())
      setMessages(prev => [...prev, res.data])
      setMessageText('')
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      loadConversations()
    } catch {
      toast({ title: 'Failed to send message', status: 'error', duration: 2000 })
    } finally { setSending(false) }
  }

  const selectPartner = (partner: any) => {
    setActivePartner(partner)
    setMessages([])
  }

  const getConvPartners = () => {
    const ids = new Set(conversations.map(c => c.partner_id))
    const from_convs = conversations
    const extra = staff.filter(s => !ids.has(s.id) && s.id !== user?.id).map(s => ({
      partner_id: s.id, partner_name: s.name, partner_role: s.role, unread_count: 0, last_message: null, last_message_at: null
    }))
    return [...from_convs, ...extra]
  }

  const allPartners = getConvPartners().filter(p => {
    if (!search) return true
    return p.partner_name?.toLowerCase().includes(search.toLowerCase())
  })

  const formatTime = (ts: string) => {
    if (!ts) return ''
    const d = new Date(ts)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    if (diff < 60000) return 'just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString()
  }

  return (
    <VStack spacing={4} align="stretch">
      <HStack justify="space-between">
        <VStack align="start" spacing={0}>
          <Heading size="md" color="gray.800">Messages</Heading>
          <Text fontSize="sm" color="gray.500">
            {isAdmin ? 'Communicate with beneficiaries and staff' : 'Message MSWD staff for assistance'}
          </Text>
        </VStack>
      </HStack>

      <Card borderRadius="xl" boxShadow="sm" overflow="hidden">
        <Flex h={{ base: 'auto', md: '65vh' }} direction={{ base: 'column', md: 'row' }}>
          {/* Left: Conversation List */}
          <Box
            w={{ base: 'full', md: '280px' }}
            borderRightWidth={1}
            borderColor="gray.100"
            flexShrink={0}
            display="flex"
            flexDirection="column"
            h={{ base: '220px', md: 'full' }}
          >
            <Box p={3} borderBottomWidth={1} borderColor="gray.100">
              <HStack bg="gray.50" borderRadius="lg" px={3} py={1.5} spacing={2}>
                <Icon as={MdSearch} color="gray.400" boxSize={4} />
                <Input
                  placeholder="Search..."
                  size="xs"
                  variant="unstyled"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  fontSize="sm"
                />
              </HStack>
            </Box>
            <Box flex={1} overflowY="auto">
              {loadingConvs ? (
                <Flex justify="center" pt={8}><Spinner size="sm" color="primary.400" /></Flex>
              ) : allPartners.length === 0 ? (
                <Flex direction="column" align="center" pt={8} px={4} gap={2}>
                  <Icon as={MdChat} color="gray.200" boxSize={10} />
                  <Text fontSize="xs" color="gray.400" textAlign="center">No conversations yet</Text>
                </Flex>
              ) : (
                allPartners.map(conv => (
                  <Box
                    key={conv.partner_id}
                    p={3}
                    cursor="pointer"
                    bg={activePartner?.id === conv.partner_id ? 'primary.50' : 'white'}
                    borderLeftWidth={activePartner?.id === conv.partner_id ? 3 : 0}
                    borderLeftColor="primary.500"
                    _hover={{ bg: activePartner?.id === conv.partner_id ? 'primary.50' : 'gray.50' }}
                    onClick={() => selectPartner({ id: conv.partner_id, name: conv.partner_name, role: conv.partner_role })}
                    transition="all 0.1s"
                    borderBottomWidth={1}
                    borderBottomColor="gray.50"
                  >
                    <HStack spacing={2.5} align="start">
                      <Avatar size="xs" name={conv.partner_name} bg={`${ROLE_COLOR[conv.partner_role] || 'gray'}.400`} color="white" flexShrink={0} mt={0.5} />
                      <VStack align="start" spacing={0.5} flex={1} minW={0}>
                        <HStack justify="space-between" w="full">
                          <Text fontSize="sm" fontWeight={600} color="gray.800" noOfLines={1} flex={1}>{conv.partner_name}</Text>
                          {conv.unread_count > 0 && (
                            <Badge colorScheme="red" borderRadius="full" fontSize="10px" px={1.5} flexShrink={0}>
                              {conv.unread_count}
                            </Badge>
                          )}
                        </HStack>
                        <Badge colorScheme={ROLE_COLOR[conv.partner_role] || 'gray'} fontSize="9px" borderRadius="full" px={1.5} py={0}>
                          {ROLE_LABEL[conv.partner_role] || conv.partner_role}
                        </Badge>
                        {conv.last_message && (
                          <Text fontSize="xs" color="gray.400" noOfLines={1}>{conv.last_message}</Text>
                        )}
                      </VStack>
                    </HStack>
                  </Box>
                ))
              )}
            </Box>
          </Box>

          {/* Right: Chat Area */}
          <Flex flex={1} direction="column" h="full" minH="300px">
            {!activePartner ? (
              <Flex flex={1} direction="column" align="center" justify="center" gap={3} bg="gray.50">
                <Icon as={MdChat} boxSize={14} color="gray.200" />
                <Text color="gray.400" fontSize="sm">Select a conversation to start messaging</Text>
                {!isAdmin && staff.length === 0 && (
                  <Text fontSize="xs" color="gray.300">No MSWD staff available to message</Text>
                )}
              </Flex>
            ) : (
              <>
                {/* Header */}
                <Box px={4} py={3} borderBottomWidth={1} borderColor="gray.100" bg="white">
                  <HStack spacing={3}>
                    <Avatar size="sm" name={activePartner.name} bg={`${ROLE_COLOR[activePartner.role] || 'gray'}.400`} color="white" />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight={700} fontSize="sm">{activePartner.name}</Text>
                      <Badge colorScheme={ROLE_COLOR[activePartner.role] || 'gray'} fontSize="xs" borderRadius="full">
                        {ROLE_LABEL[activePartner.role] || activePartner.role}
                      </Badge>
                    </VStack>
                  </HStack>
                </Box>

                {/* Messages */}
                <Box flex={1} overflowY="auto" p={4} bg="gray.50">
                  {loadingMsgs ? (
                    <Flex justify="center" pt={8}><Spinner size="sm" color="primary.400" /></Flex>
                  ) : messages.length === 0 ? (
                    <Flex direction="column" align="center" pt={12} gap={2}>
                      <Text fontSize="sm" color="gray.400">No messages yet. Start the conversation!</Text>
                    </Flex>
                  ) : (
                    <VStack spacing={2} align="stretch">
                      {messages.map(msg => {
                        const isMe = msg.sender_id === user?.id
                        return (
                          <Flex key={msg.id} justify={isMe ? 'flex-end' : 'flex-start'}>
                            <Box maxW="75%">
                              {!isMe && (
                                <Text fontSize="10px" color="gray.400" mb={0.5} ml={1}>{msg.sender_name}</Text>
                              )}
                              <Box
                                bg={isMe ? 'primary.500' : 'white'}
                                color={isMe ? 'white' : 'gray.800'}
                                px={3} py={2} borderRadius={isMe ? '2xl 2xl 4px 2xl' : '2xl 2xl 2xl 4px'}
                                fontSize="sm"
                                boxShadow="sm"
                                border={isMe ? 'none' : '1px solid'}
                                borderColor="gray.100"
                              >
                                {msg.content}
                              </Box>
                              <Text fontSize="10px" color="gray.400" mt={0.5} textAlign={isMe ? 'right' : 'left'} mr={isMe ? 1 : 0} ml={isMe ? 0 : 1}>
                                {formatTime(msg.created_at)}
                              </Text>
                            </Box>
                          </Flex>
                        )
                      })}
                      <div ref={bottomRef} />
                    </VStack>
                  )}
                </Box>

                {/* Input */}
                <Box p={3} borderTopWidth={1} borderColor="gray.100" bg="white">
                  <HStack spacing={2}>
                    <Textarea
                      value={messageText}
                      onChange={e => setMessageText(e.target.value)}
                      placeholder="Type your message..."
                      size="sm"
                      borderRadius="xl"
                      rows={1}
                      resize="none"
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSend()
                        }
                      }}
                      flex={1}
                    />
                    <Button
                      colorScheme="primary"
                      size="sm"
                      borderRadius="xl"
                      px={4}
                      isLoading={sending}
                      isDisabled={!messageText.trim()}
                      onClick={handleSend}
                      leftIcon={<MdSend />}
                    >
                      Send
                    </Button>
                  </HStack>
                  <Text fontSize="10px" color="gray.300" mt={1}>Press Enter to send · Shift+Enter for new line</Text>
                </Box>
              </>
            )}
          </Flex>
        </Flex>
      </Card>
    </VStack>
  )
}
