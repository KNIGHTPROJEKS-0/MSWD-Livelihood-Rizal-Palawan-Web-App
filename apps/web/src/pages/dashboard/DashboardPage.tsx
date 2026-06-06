import { useEffect, useState } from 'react'
import {
  Box, Flex, VStack, HStack, Text, Avatar, Badge,
  Button, Icon, Divider, IconButton,
  Drawer, DrawerOverlay, DrawerContent, DrawerBody, useDisclosure
} from '@chakra-ui/react'
import { Routes, Route, useNavigate, Link as RouterLink, useLocation } from 'react-router-dom'
import {
  MdDashboard, MdPeople, MdAssignment, MdBarChart, MdLocationCity,
  MdMenu, MdLogout, MdWork, MdPerson, MdDescription, MdTrendingUp,
  MdChat, MdFactCheck
} from 'react-icons/md'
import { useAuthStore } from '../../store/authStore'
import { messagesApi } from '../../services/api'
import SuperadminDashboard from './SuperadminDashboard'
import AdminDashboard from './AdminDashboard'
import BeneficiaryDashboard from './BeneficiaryDashboard'
import ProgramsPage from './ProgramsPage'
import ApplicationsPage from './ApplicationsPage'
import UsersPage from './UsersPage'
import ReportsPage from './ReportsPage'
import FormsPage from './FormsPage'
import LivelihoodUpdatesPage from './LivelihoodUpdatesPage'
import MessagesPage from './MessagesPage'
import ProfilePage from '../profile/ProfilePage'
import MSWDForm3Page from '../forms/MSWDForm3Page'
import IntakeAssessmentPage from '../forms/IntakeAssessmentPage'
import SocialCaseStudyPage from '../forms/SocialCaseStudyPage'
import DocumentUploadPage from '../forms/DocumentUploadPage'
import FormDetailPage from '../forms/FormDetailPage'

const ROLE_COLOR = { superadmin: 'red', admin: 'blue', beneficiary: 'green' } as const
const ROLE_LABEL = { superadmin: 'Superadmin', admin: 'Admin', beneficiary: 'Beneficiary' } as const

function NavItem({ icon, label, to, active, badge }: { icon: any; label: string; to: string; active: boolean; badge?: number }) {
  return (
    <Box as={RouterLink} to={to} w="full" display="block" _hover={{ textDecoration: 'none' }}>
      <HStack
        px={4} py={2.5} borderRadius="lg"
        bg={active ? 'primary.600' : 'transparent'}
        color={active ? 'white' : 'gray.600'}
        _hover={{ bg: active ? 'primary.700' : 'gray.100' }}
        transition="all 0.15s"
        spacing={3}
        position="relative"
      >
        <Icon as={icon} boxSize={5} />
        <Text fontWeight={active ? 700 : 500} fontSize="sm" flex={1}>{label}</Text>
        {badge && badge > 0 ? (
          <Badge colorScheme="red" borderRadius="full" fontSize="xs" px={1.5} minW="18px" textAlign="center">
            {badge > 99 ? '99+' : badge}
          </Badge>
        ) : null}
      </HStack>
    </Box>
  )
}

function Sidebar({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const role = user?.role ?? 'beneficiary'
  const [unreadMsgs, setUnreadMsgs] = useState(0)

  useEffect(() => {
    const fetch = () => messagesApi.unreadCount().then(r => setUnreadMsgs(r.data.unread_count)).catch(() => {})
    fetch()
    const interval = setInterval(fetch, 15000)
    return () => clearInterval(interval)
  }, [])

  const navItems = [
    { icon: MdDashboard,    label: 'Dashboard',           to: '/dashboard',                       roles: ['superadmin', 'admin', 'beneficiary'] },
    { icon: MdWork,         label: 'Programs',            to: '/dashboard/programs',              roles: ['superadmin', 'admin', 'beneficiary'] },
    { icon: MdAssignment,   label: 'Applications',        to: '/dashboard/applications',          roles: ['superadmin', 'admin', 'beneficiary'] },
    { icon: MdDescription,  label: 'MSWD Forms',          to: '/dashboard/forms',                 roles: ['superadmin', 'admin', 'beneficiary'] },
    { icon: MdTrendingUp,   label: 'Livelihood Updates',  to: '/dashboard/livelihood-updates',    roles: ['superadmin', 'admin', 'beneficiary'] },
    { icon: MdChat,         label: 'Messages',            to: '/dashboard/messages',              roles: ['superadmin', 'admin', 'beneficiary'], msgBadge: true },
    { icon: MdPeople,       label: 'Users',               to: '/dashboard/users',                 roles: ['superadmin', 'admin'] },
    { icon: MdBarChart,     label: 'Reports',             to: '/dashboard/reports',               roles: ['superadmin', 'admin'] },
    { icon: MdPerson,       label: 'My Profile',          to: '/dashboard/profile',               roles: ['superadmin', 'admin', 'beneficiary'] },
  ].filter((item) => item.roles.includes(role))

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <Flex direction="column" h="full" bg="white" borderRightWidth={1} py={4}>
      <VStack px={4} pb={4} align="start" spacing={1}>
        <HStack spacing={3} mb={2}>
          <Box bg="primary.600" p={2} borderRadius="lg">
            <Icon as={MdLocationCity} color="white" boxSize={5} />
          </Box>
          <VStack align="start" spacing={0}>
            <Text fontWeight={700} fontSize="sm" color="primary.700" lineHeight="shorter">MSWD Livelihood</Text>
            <Text fontSize="xs" color="gray.500">Rizal, Palawan</Text>
          </VStack>
        </HStack>
        <Divider />
      </VStack>

      <VStack flex={1} px={3} spacing={1} overflowY="auto" align="stretch">
        {navItems.map((item) => (
          <NavItem
            key={item.to}
            icon={item.icon}
            label={item.label}
            to={item.to}
            active={item.to === '/dashboard' ? location.pathname === '/dashboard' : location.pathname.startsWith(item.to)}
            badge={(item as any).msgBadge ? unreadMsgs : undefined}
          />
        ))}
      </VStack>

      <Divider />
      <Box px={4} pt={4}>
        <HStack spacing={3} mb={3}>
          <Avatar size="sm" name={`${user?.first_name} ${user?.last_name}`} bg="primary.500" color="white" />
          <VStack align="start" spacing={0} flex={1} overflow="hidden">
            <Text fontWeight={600} fontSize="sm" noOfLines={1}>
              {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.email}
            </Text>
            <Badge colorScheme={ROLE_COLOR[role as keyof typeof ROLE_COLOR]} fontSize="xs" borderRadius="full">
              {ROLE_LABEL[role as keyof typeof ROLE_LABEL]}
            </Badge>
          </VStack>
        </HStack>
        <Button leftIcon={<MdLogout />} variant="ghost" size="sm" w="full" colorScheme="red"
          justifyContent="flex-start" borderRadius="lg" onClick={handleLogout}>
          Sign Out
        </Button>
      </Box>
    </Flex>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const role = user?.role ?? 'beneficiary'

  const MainContent = () => {
    switch (role) {
      case 'superadmin': return <SuperadminDashboard />
      case 'admin': return <AdminDashboard />
      default: return <BeneficiaryDashboard />
    }
  }

  return (
    <Flex h="100vh" overflow="hidden">
      <Box w="240px" flexShrink={0} display={{ base: 'none', md: 'flex' }} flexDirection="column">
        <Sidebar />
      </Box>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent maxW="240px">
          <DrawerBody p={0}><Sidebar onClose={onClose} /></DrawerBody>
        </DrawerContent>
      </Drawer>

      <Flex flex={1} direction="column" overflow="hidden">
        <HStack display={{ base: 'flex', md: 'none' }} px={4} py={3} bg="white" borderBottomWidth={1} shadow="sm">
          <IconButton aria-label="Menu" icon={<MdMenu />} variant="ghost" onClick={onOpen} size="sm" />
          <Text fontWeight={700} color="primary.700" fontSize="sm">MSWD Livelihood</Text>
          <Box flex={1} />
          <Avatar size="xs" name={`${user?.first_name} ${user?.last_name}`} bg="primary.500" color="white" />
        </HStack>

        <Box flex={1} overflowY="auto" bg="gray.50" p={{ base: 4, md: 6 }}>
          <Routes>
            <Route index element={<MainContent />} />
            <Route path="programs" element={<ProgramsPage />} />
            <Route path="applications" element={<ApplicationsPage />} />
            <Route path="forms" element={<FormsPage />} />
            <Route path="forms/new/assessment" element={<MSWDForm3Page />} />
            <Route path="forms/new/intake" element={<IntakeAssessmentPage />} />
            <Route path="forms/new/social-case-study" element={<SocialCaseStudyPage />} />
            <Route path="forms/:formId/documents" element={<DocumentUploadPage />} />
            <Route path="forms/:formId" element={<FormDetailPage />} />
            <Route path="livelihood-updates" element={<LivelihoodUpdatesPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="*" element={<MainContent />} />
          </Routes>
        </Box>
      </Flex>
    </Flex>
  )
}
