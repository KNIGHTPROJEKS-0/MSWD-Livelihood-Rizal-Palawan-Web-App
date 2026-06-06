import { useEffect, useRef, useState } from 'react'
import {
  Box, VStack, HStack, Text, Badge, Button, Icon, Card, CardBody,
  Heading, Divider, Flex, Spinner, useToast, Progress, Input
} from '@chakra-ui/react'
import {
  MdArrowBack, MdCheckCircle, MdCloudUpload, MdDescription,
  MdCancel, MdArrowForward
} from 'react-icons/md'
import { useParams, useNavigate } from 'react-router-dom'
import { formsApi } from '../../services/api'

const REQUIRED_DOCS = [
  { key: 'barangay_certificate', label: 'Barangay Certificate of Indigency', desc: 'Official certificate from your Barangay Captain confirming your status as an indigent resident.', accept: '.pdf,.jpg,.jpeg,.png' },
  { key: 'medical_certificate', label: 'Medical Certificate / Abstract', desc: 'Medical certificate or abstract from a licensed physician or hospital.', accept: '.pdf,.jpg,.jpeg,.png' },
  { key: 'government_id', label: 'Valid Government ID', desc: 'Any valid government-issued ID (PhilSys, SSS, GSIS, Voter\'s ID, Passport, etc.)', accept: '.pdf,.jpg,.jpeg,.png' },
  { key: 'hospital_bill', label: 'Hospital Bill or Receipt', desc: 'Official hospital bill, receipt, or statement of account for medical services.', accept: '.pdf,.jpg,.jpeg,.png' },
]

export default function DocumentUploadPage() {
  const { formId } = useParams<{ formId: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const [form, setForm] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploads, setUploads] = useState<Record<string, { file: File; uploading: boolean; done: boolean; error: string | null }>>({})
  const [existingDocs, setExistingDocs] = useState<Record<string, any>>({})

  useEffect(() => {
    if (!formId) return
    Promise.all([
      formsApi.get(Number(formId)),
      formsApi.listDocuments(Number(formId)),
    ]).then(([formRes, docsRes]) => {
      setForm(formRes.data)
      const map: Record<string, any> = {}
      docsRes.data.forEach((d: any) => { map[d.document_type] = d })
      setExistingDocs(map)
    }).catch(() => navigate('/dashboard/forms')).finally(() => setLoading(false))
  }, [formId])

  const handleFileSelect = (docType: string, file: File) => {
    setUploads(prev => ({ ...prev, [docType]: { file, uploading: false, done: false, error: null } }))
  }

  const handleUpload = async (docType: string) => {
    const upload = uploads[docType]
    if (!upload) return
    setUploads(prev => ({ ...prev, [docType]: { ...upload, uploading: true, error: null } }))
    try {
      const res = await formsApi.uploadDocument(Number(formId), docType, upload.file)
      setExistingDocs(prev => ({ ...prev, [docType]: res.data }))
      setUploads(prev => ({ ...prev, [docType]: { ...upload, uploading: false, done: true } }))
      toast({ title: 'Document uploaded successfully', status: 'success', duration: 2000 })
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Upload failed'
      setUploads(prev => ({ ...prev, [docType]: { ...upload, uploading: false, done: false, error: msg } }))
      toast({ title: msg, status: 'error', duration: 3000 })
    }
  }

  const uploadedCount = REQUIRED_DOCS.filter(d => existingDocs[d.key]).length
  const allUploaded = uploadedCount === REQUIRED_DOCS.length

  if (loading) return <Flex justify="center" pt={20}><Spinner size="lg" color="primary.500" /></Flex>
  if (!form) return null

  return (
    <VStack spacing={5} align="stretch" maxW="700px">
      <HStack>
        <Button leftIcon={<MdArrowBack />} variant="ghost" size="sm" onClick={() => navigate(`/dashboard/forms/${formId}`)} colorScheme="gray">
          Back to Form
        </Button>
      </HStack>

      <Card borderRadius="xl" boxShadow="sm" borderTopWidth={4} borderTopColor="teal.400">
        <CardBody>
          <HStack spacing={3} mb={2}>
            <Box bg="teal.50" p={2} borderRadius="lg">
              <Icon as={MdCloudUpload} color="teal.500" boxSize={6} />
            </Box>
            <VStack align="start" spacing={0}>
              <Heading size="sm" color="gray.800">Upload Required Documents</Heading>
              <Text fontSize="sm" color="gray.500">
                Upload the 4 required supporting documents for your form submission.
              </Text>
            </VStack>
          </HStack>

          <Box mt={4}>
            <HStack justify="space-between" mb={1}>
              <Text fontSize="xs" color="gray.500" fontWeight={600}>{uploadedCount} of {REQUIRED_DOCS.length} documents uploaded</Text>
              <Text fontSize="xs" color={allUploaded ? 'green.600' : 'orange.500'} fontWeight={600}>
                {allUploaded ? '✓ All documents uploaded' : 'Upload remaining documents'}
              </Text>
            </HStack>
            <Progress value={(uploadedCount / REQUIRED_DOCS.length) * 100} colorScheme={allUploaded ? 'green' : 'teal'} borderRadius="full" size="sm" />
          </Box>
        </CardBody>
      </Card>

      {REQUIRED_DOCS.map((doc, idx) => {
        const existing = existingDocs[doc.key]
        const upload = uploads[doc.key]
        const isDone = existing || upload?.done

        return (
          <Card key={doc.key} borderRadius="xl" boxShadow="sm"
            border="2px solid"
            borderColor={isDone ? 'green.200' : 'gray.100'}>
            <CardBody>
              <HStack align="start" spacing={4}>
                <Box
                  bg={isDone ? 'green.50' : 'gray.50'}
                  p={3} borderRadius="xl" flexShrink={0}
                  border="2px solid"
                  borderColor={isDone ? 'green.300' : 'gray.200'}
                >
                  <Icon
                    as={isDone ? MdCheckCircle : MdDescription}
                    color={isDone ? 'green.500' : 'gray.400'}
                    boxSize={6}
                  />
                </Box>
                <VStack align="start" spacing={2} flex={1}>
                  <HStack justify="space-between" w="full">
                    <VStack align="start" spacing={0.5}>
                      <HStack>
                        <Text fontWeight={700} fontSize="sm" color="gray.800">
                          {idx + 1}. {doc.label}
                        </Text>
                        {isDone && <Badge colorScheme="green" borderRadius="full" fontSize="xs">Uploaded</Badge>}
                      </HStack>
                      <Text fontSize="xs" color="gray.500">{doc.desc}</Text>
                    </VStack>
                  </HStack>

                  {existing && (
                    <Box bg="green.50" px={3} py={2} borderRadius="lg" w="full">
                      <HStack justify="space-between">
                        <Text fontSize="xs" color="green.700" fontWeight={600} noOfLines={1}>{existing.original_filename}</Text>
                        <Button as="a" href={existing.file_url} target="_blank" size="xs" colorScheme="green" variant="ghost" borderRadius="lg">
                          View
                        </Button>
                      </HStack>
                    </Box>
                  )}

                  {upload?.file && !upload.done && (
                    <Box bg="blue.50" px={3} py={2} borderRadius="lg" w="full">
                      <HStack justify="space-between">
                        <Text fontSize="xs" color="blue.700" noOfLines={1}>{upload.file.name}</Text>
                        <Button
                          size="xs" colorScheme="teal" borderRadius="lg"
                          isLoading={upload.uploading}
                          onClick={() => handleUpload(doc.key)}
                        >
                          Upload Now
                        </Button>
                      </HStack>
                    </Box>
                  )}

                  {upload?.error && (
                    <Text fontSize="xs" color="red.500">{upload.error}</Text>
                  )}

                  <HStack spacing={2}>
                    <Input
                      type="file"
                      accept={doc.accept}
                      display="none"
                      ref={el => { fileInputRefs.current[doc.key] = el }}
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) handleFileSelect(doc.key, file)
                      }}
                    />
                    <Button
                      size="sm" variant="outline"
                      colorScheme={isDone ? 'gray' : 'teal'}
                      leftIcon={<MdCloudUpload />}
                      borderRadius="lg"
                      onClick={() => fileInputRefs.current[doc.key]?.click()}
                    >
                      {isDone ? 'Replace File' : 'Choose File'}
                    </Button>
                    {upload?.file && !upload.done && (
                      <Button
                        size="sm" colorScheme="teal" borderRadius="lg"
                        isLoading={upload.uploading}
                        onClick={() => handleUpload(doc.key)}
                      >
                        Upload
                      </Button>
                    )}
                  </HStack>
                </VStack>
              </HStack>
            </CardBody>
          </Card>
        )
      })}

      <Card borderRadius="xl" boxShadow="sm" bg={allUploaded ? 'green.50' : 'gray.50'}>
        <CardBody>
          <HStack justify="space-between" wrap="wrap" gap={3}>
            <VStack align="start" spacing={0.5}>
              <Text fontWeight={700} fontSize="sm" color={allUploaded ? 'green.800' : 'gray.700'}>
                {allUploaded ? '✓ All documents uploaded!' : 'Upload all 4 documents to complete your submission.'}
              </Text>
              <Text fontSize="xs" color="gray.500">
                Documents can be JPG, PNG, or PDF format. Max 10MB each.
              </Text>
            </VStack>
            <Button
              rightIcon={<MdArrowForward />}
              colorScheme={allUploaded ? 'green' : 'gray'}
              size="sm"
              borderRadius="lg"
              onClick={() => navigate('/dashboard/forms')}
              isDisabled={!allUploaded}
            >
              Done – View My Forms
            </Button>
          </HStack>
        </CardBody>
      </Card>
    </VStack>
  )
}
