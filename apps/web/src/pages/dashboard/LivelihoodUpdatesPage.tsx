import { useEffect, useRef, useState } from 'react'
import {
  Box, VStack, HStack, Text, Badge, Button, Icon, Card, CardBody,
  Heading, Divider, Flex, Skeleton, useToast, Textarea, Input,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalCloseButton, useDisclosure, Image, Link, Select, SimpleGrid
} from '@chakra-ui/react'
import { MdAdd, MdTrendingUp, MdCloudUpload, MdImage, MdCheckCircle, MdDescription } from 'react-icons/md'
import { livelihoodUpdatesApi, programsApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

export default function LivelihoodUpdatesPage() {
  const { user } = useAuthStore()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [updates, setUpdates] = useState<any[]>([])
  const [programs, setPrograms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [programId, setProgramId] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [reviewingId, setReviewingId] = useState<number | null>(null)
  const [reviewNote, setReviewNote] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const { isOpen: reviewOpen, onOpen: openReview, onClose: closeReview } = useDisclosure()
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

  const load = () => {
    setLoading(true)
    Promise.all([
      livelihoodUpdatesApi.list(),
      programsApi.list(),
    ]).then(([updRes, progRes]) => {
      setUpdates(updRes.data)
      setPrograms(progRes.data)
    }).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async () => {
    if (!title.trim()) { toast({ title: 'Title is required', status: 'warning', duration: 2000 }); return }
    setSubmitting(true)
    try {
      await livelihoodUpdatesApi.create({
        title,
        description,
        program_id: programId ? Number(programId) : undefined,
        file: file || undefined,
      })
      toast({ title: 'Progress update submitted!', status: 'success', duration: 3000 })
      setTitle(''); setDescription(''); setProgramId(''); setFile(null)
      onClose()
      load()
    } catch {
      toast({ title: 'Failed to submit update', status: 'error', duration: 3000 })
    } finally { setSubmitting(false) }
  }

  const handleReview = async () => {
    if (!reviewingId) return
    setReviewSubmitting(true)
    try {
      await livelihoodUpdatesApi.review(reviewingId, reviewNote)
      toast({ title: 'Note added', status: 'success', duration: 2000 })
      closeReview()
      setReviewingId(null); setReviewNote('')
      load()
    } catch {
      toast({ title: 'Failed to add note', status: 'error', duration: 3000 })
    } finally { setReviewSubmitting(false) }
  }

  const isImage = (filename: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(filename || '')

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between" wrap="wrap" gap={3}>
        <VStack align="start" spacing={0}>
          <Heading size="md" color="gray.800">{isAdmin ? 'Livelihood Progress Updates' : 'My Livelihood Progress'}</Heading>
          <Text fontSize="sm" color="gray.500">
            {isAdmin
              ? 'View proof of progress submitted by beneficiaries for their assigned livelihood programs'
              : 'Submit photos or updates showing your progress on your assigned livelihood program'}
          </Text>
        </VStack>
        {!isAdmin && (
          <Button leftIcon={<MdAdd />} colorScheme="teal" size="sm" borderRadius="lg" onClick={onOpen}>
            Submit Update
          </Button>
        )}
      </HStack>

      {loading ? (
        <VStack spacing={3}>{[1, 2, 3].map(i => <Skeleton key={i} h="120px" borderRadius="xl" />)}</VStack>
      ) : updates.length === 0 ? (
        <Card borderRadius="xl" boxShadow="sm">
          <CardBody>
            <Flex direction="column" align="center" py={12} gap={3}>
              <Icon as={MdTrendingUp} boxSize={14} color="gray.200" />
              <Heading size="sm" color="gray.400">No updates yet</Heading>
              <Text fontSize="sm" color="gray.400" textAlign="center">
                {isAdmin
                  ? 'Beneficiaries have not submitted any progress updates yet.'
                  : 'Submit photos or updates to show your progress on your livelihood program.'}
              </Text>
              {!isAdmin && (
                <Button leftIcon={<MdAdd />} colorScheme="teal" size="sm" borderRadius="lg" onClick={onOpen}>
                  Submit Your First Update
                </Button>
              )}
            </Flex>
          </CardBody>
        </Card>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {updates.map(upd => (
            <Card key={upd.id} borderRadius="xl" boxShadow="sm" overflow="hidden">
              {upd.file_url && isImage(upd.original_filename) && (
                <Image src={upd.file_url} alt={upd.title} maxH="200px" objectFit="cover" w="full" />
              )}
              <CardBody>
                <VStack align="start" spacing={2}>
                  <HStack justify="space-between" w="full" wrap="wrap" gap={2}>
                    <Text fontWeight={700} fontSize="sm" color="gray.800" flex={1}>{upd.title}</Text>
                    {upd.admin_notes && <Badge colorScheme="green" borderRadius="full" fontSize="xs">Reviewed</Badge>}
                  </HStack>
                  {isAdmin && (
                    <Text fontSize="xs" color="primary.600" fontWeight={600}>
                      {upd.beneficiary_name} · {upd.beneficiary_barangay || ''}
                    </Text>
                  )}
                  {upd.program_title && (
                    <Badge colorScheme="blue" borderRadius="full" fontSize="xs">{upd.program_title}</Badge>
                  )}
                  {upd.description && <Text fontSize="sm" color="gray.600" noOfLines={3}>{upd.description}</Text>}

                  {upd.file_url && !isImage(upd.original_filename) && (
                    <Link href={upd.file_url} isExternal>
                      <Button size="xs" leftIcon={<MdDescription />} variant="outline" colorScheme="teal" borderRadius="lg">
                        View Attachment
                      </Button>
                    </Link>
                  )}

                  {upd.admin_notes && (
                    <Box bg="green.50" p={2} borderRadius="lg" w="full">
                      <Text fontSize="xs" color="green.700" fontWeight={600}>Admin Feedback:</Text>
                      <Text fontSize="xs" color="green.800">{upd.admin_notes}</Text>
                      {upd.reviewer_name && <Text fontSize="10px" color="green.500" mt={0.5}>By {upd.reviewer_name}</Text>}
                    </Box>
                  )}

                  <HStack justify="space-between" w="full">
                    <Text fontSize="10px" color="gray.400">{upd.created_at?.slice(0, 10)}</Text>
                    {isAdmin && (
                      <Button
                        size="xs" colorScheme="primary" variant="outline" borderRadius="lg"
                        onClick={() => { setReviewingId(upd.id); setReviewNote(upd.admin_notes || ''); openReview() }}
                      >
                        {upd.admin_notes ? 'Edit Note' : 'Add Note'}
                      </Button>
                    )}
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}

      {/* Submit Update Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader fontSize="md">Submit Livelihood Progress Update</ModalHeader>
          <ModalCloseButton />
          <Divider />
          <ModalBody pb={6} pt={4}>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontSize="sm" fontWeight={600} mb={1.5}>Title <Text as="span" color="red.400">*</Text></Text>
                <Input value={title} onChange={e => setTitle(e.target.value)} size="sm" borderRadius="lg" placeholder="e.g., Month 2 – Sari-sari Store Progress" />
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight={600} mb={1.5}>Program (optional)</Text>
                <Select value={programId} onChange={e => setProgramId(e.target.value)} size="sm" borderRadius="lg" placeholder="Select program...">
                  {programs.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </Select>
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight={600} mb={1.5}>Description / Update</Text>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} size="sm" borderRadius="lg" rows={3} placeholder="Describe your progress, challenges, and achievements..." />
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight={600} mb={1.5}>Photo or Attachment</Text>
                <Input type="file" ref={fileRef} display="none" accept="image/*,.pdf" onChange={e => setFile(e.target.files?.[0] || null)} />
                {file ? (
                  <HStack bg="teal.50" p={3} borderRadius="lg">
                    <Icon as={MdImage} color="teal.500" />
                    <Text fontSize="sm" flex={1} noOfLines={1}>{file.name}</Text>
                    <Button size="xs" variant="ghost" colorScheme="red" onClick={() => setFile(null)}>Remove</Button>
                  </HStack>
                ) : (
                  <Button leftIcon={<MdCloudUpload />} size="sm" variant="outline" colorScheme="teal" borderRadius="lg" onClick={() => fileRef.current?.click()}>
                    Attach Photo / File
                  </Button>
                )}
              </Box>
              <HStack justify="flex-end">
                <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
                <Button colorScheme="teal" size="sm" isLoading={submitting} onClick={handleSubmit} borderRadius="lg">
                  Submit Update
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Admin Review Note Modal */}
      <Modal isOpen={reviewOpen} onClose={closeReview} size="sm">
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader fontSize="md">Add Feedback Note</ModalHeader>
          <ModalCloseButton />
          <Divider />
          <ModalBody pb={6} pt={4}>
            <VStack spacing={3} align="stretch">
              <Textarea value={reviewNote} onChange={e => setReviewNote(e.target.value)} rows={4} borderRadius="lg" size="sm" placeholder="Write your feedback or acknowledgment..." />
              <HStack justify="flex-end">
                <Button variant="ghost" size="sm" onClick={closeReview}>Cancel</Button>
                <Button colorScheme="primary" size="sm" isLoading={reviewSubmitting} onClick={handleReview} borderRadius="lg">
                  Save Note
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  )
}
