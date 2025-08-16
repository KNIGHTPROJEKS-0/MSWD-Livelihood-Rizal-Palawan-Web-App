import React, { useEffect, useState } from 'react'
import { Box, Heading, Text, Button, VStack, HStack, Card, CardBody, SimpleGrid, Badge, Select, Alert, AlertIcon, Input, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure } from '@chakra-ui/react'
import { auth, db } from './services/firebase'
import { signOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'

function App() {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState('loading')
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [loginType, setLoginType] = useState('select') // 'select', 'superadmin', 'admin', 'beneficiary'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedBarangay, setSelectedBarangay] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        await loadUserRole(currentUser.uid)
      } else {
        setUserRole('loading')
      }
    })
    return () => unsubscribe()
  }, [])

  const loadUserRole = async (userId) => {
    try {
      // Set timeout for Firebase call
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 3000)
      )

      const userDocPromise = getDoc(doc(db, 'users', userId))
      const userDoc = await Promise.race([userDocPromise, timeoutPromise])

      if (userDoc.exists()) {
        setUserRole(userDoc.data().role || 'beneficiary')
      } else {
        // First time user - set as superadmin if it's your email
        const role = user?.email === 'knightprojeks@gmail.com' ? 'superadmin' : 'beneficiary'
        setUserRole(role)
        // Background save (non-blocking)
        setDoc(doc(db, 'users', userId), {
          email: user?.email,
          role: role,
          createdAt: new Date()
        }).catch(console.error)
      }
    } catch (error) {
      console.error('Error loading user role:', error)
      // Default role based on email for faster loading
      const role = user?.email === 'knightprojeks@gmail.com' ? 'superadmin' : 'beneficiary'
      setUserRole(role)
    }
  }

  const handleLogin = async () => {
    setLoading(true)
    setMessage('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
      setMessage('✅ Logged in successfully!')
      setEmail('')
      setPassword('')
    } catch (error) {
      setMessage('❌ Error: ' + error.message)
    }
    setLoading(false)
  }

  const handleRegister = async () => {
    setLoading(true)
    setMessage('')
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      setMessage('✅ Account created successfully!')
      setEmail('')
      setPassword('')
    } catch (error) {
      setMessage('❌ Error: ' + error.message)
    }
    setLoading(false)
  }

  const changeUserRole = (newRole) => {
    // Immediate role change for testing
    setUserRole(newRole)

    // Background Firebase update (non-blocking)
    setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      role: newRole,
      updatedAt: new Date()
    }, { merge: true }).catch(error => {
      console.error('Error saving role:', error)
    })
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'superadmin': return 'red'
      case 'admin': return 'blue'
      case 'beneficiary': return 'green'
      default: return 'gray'
    }
  }

  const getRolePermissions = (role) => {
    switch (role) {
      case 'superadmin':
        return ['👑 Full System Access', '👥 User Management', '📊 All Reports', '⚙️ System Settings']
      case 'admin':
        return ['📋 Program Management', '👥 Beneficiary Management', '📊 Reports', '✅ Application Review']
      case 'beneficiary':
        return ['📝 Apply for Programs', '👤 View My Profile', '📋 Track Applications']
      default:
        return []
    }
  }

  const handleLoginWithRole = async (role) => {
    setLoading(true)
    setMessage('')
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      // Set role immediately after login
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        role: role,
        updatedAt: new Date()
      }, { merge: true })
      setUserRole(role)
      setMessage('✅ Logged in successfully!')
      setEmail('')
      setPassword('')
    } catch (error) {
      setMessage('❌ Error: ' + error.message)
    }
    setLoading(false)
  }

  const handleRegisterWithRole = async (role) => {
    setLoading(true)
    setMessage('')
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      // Set role immediately after registration
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        role: role,
        createdAt: new Date()
      })
      setUserRole(role)
      setMessage('✅ Account created successfully!')
      setEmail('')
      setPassword('')
    } catch (error) {
      setMessage('❌ Error: ' + error.message)
    }
    setLoading(false)
  }

  // LOGIN SCREEN
  if (!user) {
    // Login Type Selection
    if (loginType === 'select') {
      return React.createElement(Box, {
        minH: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        bg: 'gray.50',
        p: 8
      },
        React.createElement(VStack, { spacing: 8, maxW: 'lg', w: 'full' },
          React.createElement(Box, { position: 'relative', textAlign: 'center' },
            React.createElement(Box, {
              position: 'absolute',
              top: '-70px',
              right: '-70px',
              width: '250px',
              height: '250px',
              backgroundImage: 'url(/MSWD-Livelihood-Roxas-LOGO.png)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              opacity: 0.15,
              zIndex: 0
            }),
            React.createElement(VStack, { spacing: 0, align: 'center', position: 'relative', zIndex: 1 },
              React.createElement(Heading, { size: '4xl', color: 'blue.600', fontWeight: 'bold', letterSpacing: 'wider' },
                'MSWD'
              ),
              React.createElement(Text, {
                fontSize: '2xl',
                color: 'blue.500',
                fontWeight: 'bold',
                letterSpacing: 'widest',
                textAlign: 'center',
                lineHeight: '1',
                fontFamily: 'Inter, system-ui, sans-serif',
                textTransform: 'uppercase'
              },
                'Livelihood System'
              )
            )
          ),
          React.createElement(Text, { fontSize: 'xl', color: 'gray.600', textAlign: 'center' },
            'Select Your Login Type'
          ),
          React.createElement(SimpleGrid, { columns: { base: 1, md: 3 }, spacing: 6, w: 'full' },
            React.createElement(Card, { cursor: 'pointer', _hover: { shadow: 'lg' }, onClick: () => setLoginType('superadmin') },
              React.createElement(CardBody, { textAlign: 'center', p: 8 },
                React.createElement(VStack, { spacing: 4 },
                  React.createElement(Text, { fontSize: '4xl' }, '👑'),
                  React.createElement(Heading, { size: 'md', color: 'red.600' }, 'Superadmin'),
                  React.createElement(Text, { fontSize: 'sm', color: 'gray.600' }, 'Full system access and management')
                )
              )
            ),
            React.createElement(Card, { cursor: 'pointer', _hover: { shadow: 'lg' }, onClick: () => setLoginType('admin') },
              React.createElement(CardBody, { textAlign: 'center', p: 8 },
                React.createElement(VStack, { spacing: 4 },
                  React.createElement(Text, { fontSize: '4xl' }, '👨💼'),
                  React.createElement(Heading, { size: 'md', color: 'blue.600' }, 'Admin'),
                  React.createElement(Text, { fontSize: 'sm', color: 'gray.600' }, 'Program and beneficiary management')
                )
              )
            ),
            React.createElement(Card, { cursor: 'pointer', _hover: { shadow: 'lg' }, onClick: () => setLoginType('beneficiary') },
              React.createElement(CardBody, { textAlign: 'center', p: 8 },
                React.createElement(VStack, { spacing: 4 },
                  React.createElement(Text, { fontSize: '4xl' }, '👤'),
                  React.createElement(Heading, { size: 'md', color: 'green.600' }, 'Beneficiary'),
                  React.createElement(Text, { fontSize: 'sm', color: 'gray.600' }, 'Apply for programs and track status')
                )
              )
            )
          )
        )
      )
    }

    // Specific Login Pages
    const getRoleConfig = () => {
      switch (loginType) {
        case 'superadmin': return { title: '👑 Superadmin Login', color: 'red.600', bg: 'red.50' }
        case 'admin': return { title: '👨💼 Admin Login', color: 'blue.600', bg: 'blue.50' }
        case 'beneficiary': return { title: '👤 Beneficiary Login', color: 'green.600', bg: 'green.50' }
        default: return { title: 'Login', color: 'blue.600', bg: 'gray.50' }
      }
    }

    const config = getRoleConfig()

    return React.createElement(Box, {
      minH: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      bg: config.bg,
      p: 8
    },
      React.createElement(VStack, { spacing: 6, maxW: 'md', w: 'full' },
        React.createElement(Button, {
          variant: 'ghost',
          alignSelf: 'flex-start',
          onClick: () => setLoginType('select')
        }, '← Back to Selection'),
        React.createElement(VStack, { spacing: 1, align: 'center', mb: 2 },
          React.createElement(Box, { position: 'relative', textAlign: 'center' },
            React.createElement(Box, {
              position: 'absolute',
              top: '-35px',
              right: '-40px',
              width: '180px',
              height: '180px',
              backgroundImage: 'url(/MSWD-Livelihood-Roxas-LOGO.png)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              opacity: 0.15,
              zIndex: 0
            }),
            React.createElement(VStack, { spacing: 0, align: 'center', position: 'relative', zIndex: 1 },
              React.createElement(Heading, { size: '3xl', color: 'blue.600', fontWeight: 'bold', letterSpacing: 'wider' },
                'MSWD'
              ),
              React.createElement(Text, {
                fontSize: 'xl',
                color: 'blue.500',
                fontWeight: 'bold',
                letterSpacing: 'widest',
                textAlign: 'center',
                lineHeight: '1',
                fontFamily: 'Inter, system-ui, sans-serif',
                textTransform: 'uppercase'
              },
                'Livelihood System'
              )
            )
          ),
          React.createElement(Heading, { size: 'lg', color: config.color, textAlign: 'center', mt: 4 },
            config.title
          )
        ),
        React.createElement(Text, { fontSize: 'lg', color: 'gray.600', textAlign: 'center' },
          'Enter your credentials to continue'
        ),
        React.createElement(Input, {
          placeholder: loginType === 'superadmin' ? 'Email (use: knightprojeks@gmail.com)' : 'Email Address',
          type: 'email',
          value: email,
          onChange: (e) => setEmail(e.target.value),
          bg: 'white'
        }),
        React.createElement(Input, {
          placeholder: 'Password',
          type: 'password',
          value: password,
          onChange: (e) => setPassword(e.target.value),
          bg: 'white'
        }),
        React.createElement(HStack, { spacing: 4, w: 'full' },
          React.createElement(Button, {
            colorScheme: loginType === 'superadmin' ? 'red' : loginType === 'admin' ? 'blue' : 'green',
            onClick: () => handleLoginWithRole(loginType),
            isLoading: loading,
            flex: 1
          },
            'Login'
          ),
          React.createElement(Button, {
            variant: 'outline',
            colorScheme: loginType === 'superadmin' ? 'red' : loginType === 'admin' ? 'blue' : 'green',
            onClick: () => handleRegisterWithRole(loginType),
            isLoading: loading,
            flex: 1
          },
            'Register'
          )
        ),
        message && React.createElement(Text, {
          color: message.includes('✅') ? 'green.500' : 'red.500',
          textAlign: 'center',
          fontWeight: 'bold'
        }, message),
        loginType === 'superadmin' && React.createElement(Text, { fontSize: 'sm', color: 'gray.500', textAlign: 'center' },
          'Hint: Use knightprojeks@gmail.com for Superadmin access'
        )
      )
    )
  }

  if (userRole === 'loading') {
    // Auto-fallback after 2 seconds to prevent infinite loading
    setTimeout(() => {
      if (userRole === 'loading') {
        const role = user?.email === 'knightprojeks@gmail.com' ? 'superadmin' : 'beneficiary'
        setUserRole(role)
      }
    }, 2000)

    return React.createElement(Box, {
      minH: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bg: 'gray.50'
    },
      React.createElement(VStack, { spacing: 4 },
        React.createElement(Text, { fontSize: 'xl' }, 'Loading your profile...'),
        React.createElement(Text, { fontSize: 'sm', color: 'gray.500' }, 'This should only take a moment')
      )
    )
  }

  const renderRoleSwitcher = () => {
    return React.createElement(Alert, { status: 'info', mb: 6 },
      React.createElement(AlertIcon, null),
      React.createElement(VStack, { align: 'start', spacing: 3, flex: 1 },
        React.createElement(Text, { fontWeight: 'bold' },
          '🔄 ROLE TESTING MODE'
        ),
        React.createElement(HStack, { spacing: 4 },
          React.createElement(Text, null, 'Switch Role to Test:'),
          React.createElement(Select, {
            value: userRole,
            onChange: (e) => changeUserRole(e.target.value),
            maxW: '200px',
            bg: 'white'
          },
            React.createElement('option', { value: 'superadmin' }, '👑 Superadmin'),
            React.createElement('option', { value: 'admin' }, '👨💼 Admin'),
            React.createElement('option', { value: 'beneficiary' }, '👤 Beneficiary')
          )
        ),
        React.createElement(Text, { fontSize: 'sm', color: 'gray.600' },
          'Change your role to see how different users experience the system'
        )
      )
    )
  }

  const renderDashboard = () => {
    if (userRole === 'superadmin') {
      return React.createElement(VStack, { spacing: 6, align: 'stretch' },
        renderRoleSwitcher(),

        // Stats Overview
        React.createElement(SimpleGrid, { columns: { base: 2, md: 4 }, spacing: 4, mb: 6 },
          React.createElement(Card, { bg: 'blue.50' },
            React.createElement(CardBody, { textAlign: 'center' },
              React.createElement(Text, { fontSize: '2xl', fontWeight: 'bold', color: 'blue.600' }, '1,247'),
              React.createElement(Text, { color: 'gray.600' }, 'Total Beneficiaries')
            )
          ),
          React.createElement(Card, { bg: 'green.50' },
            React.createElement(CardBody, { textAlign: 'center' },
              React.createElement(Text, { fontSize: '2xl', fontWeight: 'bold', color: 'green.600' }, '23'),
              React.createElement(Text, { color: 'gray.600' }, 'Active Programs')
            )
          ),
          React.createElement(Card, { bg: 'orange.50' },
            React.createElement(CardBody, { textAlign: 'center' },
              React.createElement(Text, { fontSize: '2xl', fontWeight: 'bold', color: 'orange.600' }, '156'),
              React.createElement(Text, { color: 'gray.600' }, 'Pending Applications')
            )
          ),
          React.createElement(Card, { bg: 'purple.50' },
            React.createElement(CardBody, { textAlign: 'center' },
              React.createElement(Text, { fontSize: '2xl', fontWeight: 'bold', color: 'purple.600' }, '₱2.1M'),
              React.createElement(Text, { color: 'gray.600' }, 'Total Disbursed')
            )
          )
        ),

        // Management Panels
        React.createElement(Heading, { size: 'lg', color: 'red.600', mb: 4 },
          '👑 Superadmin Control Panel'
        ),
        React.createElement(SimpleGrid, { columns: { base: 1, md: 2, lg: 3 }, spacing: 6 },
          React.createElement(Card, { borderColor: 'red.200', borderWidth: 2 },
            React.createElement(CardBody, null,
              React.createElement(VStack, { align: 'start', spacing: 3 },
                React.createElement(Heading, { size: 'md', color: 'red.600' }, '👥 User Management'),
                React.createElement(Text, { fontSize: 'sm' }, 'Manage admin accounts, roles, and permissions'),
                React.createElement(HStack, { spacing: 2 },
                  React.createElement(Button, { colorScheme: 'red', size: 'sm', onClick: () => setCurrentPage('users') }, 'Manage Users'),
                  React.createElement(Button, { variant: 'outline', size: 'sm' }, 'Add Admin')
                )
              )
            )
          ),
          React.createElement(Card, null,
            React.createElement(CardBody, null,
              React.createElement(VStack, { align: 'start', spacing: 3 },
                React.createElement(Heading, { size: 'md', color: 'green.600' }, '📋 Program Management'),
                React.createElement(Text, { fontSize: 'sm' }, 'Create, edit, and monitor all MSWD programs'),
                React.createElement(HStack, { spacing: 2 },
                  React.createElement(Button, { colorScheme: 'green', size: 'sm', onClick: () => setCurrentPage('programs') }, 'All Programs'),
                  React.createElement(Button, { variant: 'outline', size: 'sm' }, 'New Program')
                )
              )
            )
          ),
          React.createElement(Card, null,
            React.createElement(CardBody, null,
              React.createElement(VStack, { align: 'start', spacing: 3 },
                React.createElement(Heading, { size: 'md', color: 'blue.600' }, '👥 Beneficiary Database'),
                React.createElement(Text, { fontSize: 'sm' }, 'Complete beneficiary records and applications'),
                React.createElement(HStack, { spacing: 2 },
                  React.createElement(Button, { colorScheme: 'blue', size: 'sm', onClick: () => setCurrentPage('beneficiaries') }, 'All Beneficiaries'),
                  React.createElement(Button, { variant: 'outline', size: 'sm' }, 'Export Data')
                )
              )
            )
          ),
          React.createElement(Card, null,
            React.createElement(CardBody, null,
              React.createElement(VStack, { align: 'start', spacing: 3 },
                React.createElement(Heading, { size: 'md', color: 'purple.600' }, '📊 Analytics & Reports'),
                React.createElement(Text, { fontSize: 'sm' }, 'System analytics and comprehensive reports'),
                React.createElement(HStack, { spacing: 2 },
                  React.createElement(Button, { colorScheme: 'purple', size: 'sm', onClick: () => setCurrentPage('reports') }, 'View Reports'),
                  React.createElement(Button, { variant: 'outline', size: 'sm' }, 'Generate Report')
                )
              )
            )
          ),
          React.createElement(Card, null,
            React.createElement(CardBody, null,
              React.createElement(VStack, { align: 'start', spacing: 3 },
                React.createElement(Heading, { size: 'md', color: 'teal.600' }, '⚙️ System Settings'),
                React.createElement(Text, { fontSize: 'sm' }, 'Configure system parameters and preferences'),
                React.createElement(HStack, { spacing: 2 },
                  React.createElement(Button, { colorScheme: 'teal', size: 'sm', onClick: () => setCurrentPage('settings') }, 'Settings'),
                  React.createElement(Button, { variant: 'outline', size: 'sm' }, 'Backup')
                )
              )
            )
          ),
          React.createElement(Card, null,
            React.createElement(CardBody, null,
              React.createElement(VStack, { align: 'start', spacing: 3 },
                React.createElement(Heading, { size: 'md', color: 'orange.600' }, '🏘️ Barangay Management'),
                React.createElement(Text, { fontSize: 'sm' }, 'Manage all 11 barangays in Rizal, Palawan'),
                React.createElement(HStack, { spacing: 2 },
                  React.createElement(Button, { colorScheme: 'orange', size: 'sm', onClick: () => setCurrentPage('barangays') }, 'All Barangays'),
                  React.createElement(Button, { variant: 'outline', size: 'sm' }, 'Add Barangay')
                )
              )
            )
          ),
          React.createElement(Card, { borderColor: 'purple.200', borderWidth: 2 },
            React.createElement(CardBody, null,
              React.createElement(VStack, { align: 'start', spacing: 3 },
                React.createElement(Heading, { size: 'md', color: 'purple.600' }, '🎨 Webstudio Integration'),
                React.createElement(Text, { fontSize: 'sm' }, 'Visual form builder and content management'),
                React.createElement(HStack, { spacing: 2 },
                  React.createElement(Button, { colorScheme: 'purple', size: 'sm', onClick: () => setCurrentPage('webstudio-demo') }, 'Visual Editor'),
                  React.createElement(Button, { variant: 'outline', size: 'sm' }, 'Components')
                )
              )
            )
          )
        )
      )
    }

    // Admin Dashboard
    if (userRole === 'admin') {
      return React.createElement(VStack, { spacing: 6, align: 'stretch' },
        renderRoleSwitcher(),
        React.createElement(Heading, { size: 'lg', color: 'blue.600', mb: 4 },
          '👨💼 Admin Dashboard'
        ),
        React.createElement(SimpleGrid, { columns: { base: 1, md: 2 }, spacing: 6 },
          React.createElement(Card, null,
            React.createElement(CardBody, null,
              React.createElement(VStack, { align: 'start', spacing: 3 },
                React.createElement(Heading, { size: 'md', color: 'green.600' }, '📋 Program Management'),
                React.createElement(Text, null, 'Manage assigned programs and applications'),
                React.createElement(Button, { colorScheme: 'green', onClick: () => setCurrentPage('programs') }, 'Manage Programs')
              )
            )
          ),
          React.createElement(Card, null,
            React.createElement(CardBody, null,
              React.createElement(VStack, { align: 'start', spacing: 3 },
                React.createElement(Heading, { size: 'md', color: 'blue.600' }, '👥 Beneficiary Review'),
                React.createElement(Text, null, 'Review and process beneficiary applications'),
                React.createElement(Button, { colorScheme: 'blue', onClick: () => setCurrentPage('beneficiaries') }, 'Review Applications')
              )
            )
          )
        )
      )
    }

    // Beneficiary Dashboard
    return React.createElement(VStack, { spacing: 6, align: 'stretch' },
      renderRoleSwitcher(),
      React.createElement(Heading, { size: 'lg', color: 'green.600', mb: 4 },
        '👤 My Dashboard'
      ),
      React.createElement(SimpleGrid, { columns: { base: 1, md: 2 }, spacing: 6 },
        React.createElement(Card, null,
          React.createElement(CardBody, null,
            React.createElement(VStack, { align: 'start', spacing: 3 },
              React.createElement(Heading, { size: 'md', color: 'green.600' }, '📝 Apply for Programs'),
              React.createElement(Text, null, 'Browse and apply for available programs'),
              React.createElement(Button, { colorScheme: 'green', onClick: () => setCurrentPage('programs') }, 'View Programs')
            )
          )
        ),
        React.createElement(Card, null,
          React.createElement(CardBody, null,
            React.createElement(VStack, { align: 'start', spacing: 3 },
              React.createElement(Heading, { size: 'md', color: 'blue.600' }, '📋 My Applications'),
              React.createElement(Text, null, 'Track your application status'),
              React.createElement(HStack, { spacing: 2 },
                React.createElement(Button, { colorScheme: 'blue', size: 'sm', onClick: () => setCurrentPage('applications') }, 'My Applications'),
                React.createElement(Button, { colorScheme: 'green', size: 'sm', onClick: () => setCurrentPage('messages') }, 'Messages')
              )
            )
          )
        )
      )
    )
  }

  const renderPrograms = () => {
    const programs = [
      { name: 'Livelihood Assistance Program', type: 'Financial Aid', status: 'Active' },
      { name: 'Senior Citizens Pension', type: 'Social Pension', status: 'Active' },
      { name: 'Child Development Services', type: 'Child Welfare', status: 'Active' },
      { name: 'Solo Parent Support', type: 'Family Support', status: 'Active' }
    ]

    return React.createElement(VStack, { spacing: 6, align: 'stretch' },
      React.createElement(HStack, { justify: 'space-between' },
        React.createElement(Heading, { size: 'lg', color: 'green.600' },
          userRole === 'beneficiary' ? 'Available Programs' : 'MSWD Programs'
        ),
        React.createElement(Button, {
          colorScheme: 'gray',
          onClick: () => setCurrentPage('dashboard')
        }, 'Back to Dashboard')
      ),
      React.createElement(SimpleGrid, { columns: { base: 1, md: 2 }, spacing: 4 },
        ...programs.map((program, index) =>
          React.createElement(Card, { key: index },
            React.createElement(CardBody, null,
              React.createElement(VStack, { align: 'start', spacing: 3 },
                React.createElement(Heading, { size: 'md' }, program.name),
                React.createElement(Text, { color: 'gray.600' }, 'Type: ' + program.type),
                React.createElement(Text, { color: 'green.500', fontWeight: 'bold' },
                  'Status: ' + program.status
                ),
                React.createElement(Button, {
                  colorScheme: userRole === 'beneficiary' ? 'blue' : 'green',
                  size: 'sm'
                }, userRole === 'beneficiary' ? 'Apply Now' : 'Manage Program')
              )
            )
          )
        )
      )
    )
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'programs': return renderPrograms()
      case 'users':
        return React.createElement(VStack, { spacing: 6 },
          React.createElement(HStack, { justify: 'space-between' },
            React.createElement(Heading, { size: 'lg', color: 'red.600' }, '👥 User Management'),
            React.createElement(Button, { onClick: () => setCurrentPage('dashboard') }, 'Back to Dashboard')
          ),
          React.createElement(SimpleGrid, { columns: { base: 1, md: 2, lg: 3 }, spacing: 4 },
            React.createElement(Card, null,
              React.createElement(CardBody, null,
                React.createElement(VStack, { align: 'start', spacing: 2 },
                  React.createElement(Text, { fontWeight: 'bold' }, 'Maria Santos'),
                  React.createElement(Badge, { colorScheme: 'blue' }, 'ADMIN'),
                  React.createElement(Text, { fontSize: 'sm', color: 'gray.600' }, 'maria@mswd.gov.ph'),
                  React.createElement(Text, { fontSize: 'sm' }, 'Barangay: Poblacion')
                )
              )
            ),
            React.createElement(Card, null,
              React.createElement(CardBody, null,
                React.createElement(VStack, { align: 'start', spacing: 2 },
                  React.createElement(Text, { fontWeight: 'bold' }, 'Juan Dela Cruz'),
                  React.createElement(Badge, { colorScheme: 'blue' }, 'ADMIN'),
                  React.createElement(Text, { fontSize: 'sm', color: 'gray.600' }, 'juan@mswd.gov.ph'),
                  React.createElement(Text, { fontSize: 'sm' }, 'Barangay: Aramaywan')
                )
              )
            )
          )
        )
      case 'beneficiaries':
        return React.createElement(VStack, { spacing: 6 },
          React.createElement(HStack, { justify: 'space-between' },
            React.createElement(Heading, { size: 'lg', color: 'blue.600' }, '👥 Beneficiary Database'),
            React.createElement(Button, { onClick: () => setCurrentPage('dashboard') }, 'Back to Dashboard')
          ),
          React.createElement(SimpleGrid, { columns: { base: 1, md: 2 }, spacing: 4 },
            React.createElement(Card, null,
              React.createElement(CardBody, null,
                React.createElement(VStack, { align: 'start', spacing: 2 },
                  React.createElement(Text, { fontWeight: 'bold' }, 'Ana Reyes'),
                  React.createElement(Badge, { colorScheme: 'green' }, 'ACTIVE'),
                  React.createElement(Text, { fontSize: 'sm' }, 'Program: Livelihood Assistance'),
                  React.createElement(Text, { fontSize: 'sm', color: 'gray.600' }, 'Barangay: Poblacion')
                )
              )
            ),
            React.createElement(Card, null,
              React.createElement(CardBody, null,
                React.createElement(VStack, { align: 'start', spacing: 2 },
                  React.createElement(Text, { fontWeight: 'bold' }, 'Pedro Garcia'),
                  React.createElement(Badge, { colorScheme: 'orange' }, 'PENDING'),
                  React.createElement(Text, { fontSize: 'sm' }, 'Program: Senior Citizen Pension'),
                  React.createElement(Text, { fontSize: 'sm', color: 'gray.600' }, 'Barangay: Aramaywan')
                )
              )
            )
          )
        )
      case 'reports':
        return React.createElement(VStack, { spacing: 6 },
          React.createElement(HStack, { justify: 'space-between' },
            React.createElement(Heading, { size: 'lg', color: 'purple.600' }, '📊 Analytics & Reports'),
            React.createElement(Button, { onClick: () => setCurrentPage('dashboard') }, 'Back to Dashboard')
          ),
          React.createElement(SimpleGrid, { columns: { base: 1, md: 2 }, spacing: 6 },
            React.createElement(Card, null,
              React.createElement(CardBody, null,
                React.createElement(VStack, { align: 'start', spacing: 3 },
                  React.createElement(Heading, { size: 'md' }, 'Monthly Report'),
                  React.createElement(Text, { color: 'gray.600' }, 'Applications processed this month'),
                  React.createElement(Text, { fontSize: '2xl', fontWeight: 'bold', color: 'purple.600' }, '234'),
                  React.createElement(Button, { size: 'sm', colorScheme: 'purple' }, 'View Details')
                )
              )
            ),
            React.createElement(Card, null,
              React.createElement(CardBody, null,
                React.createElement(VStack, { align: 'start', spacing: 3 },
                  React.createElement(Heading, { size: 'md' }, 'Budget Utilization'),
                  React.createElement(Text, { color: 'gray.600' }, 'Total budget utilized'),
                  React.createElement(Text, { fontSize: '2xl', fontWeight: 'bold', color: 'green.600' }, '78%'),
                  React.createElement(Button, { size: 'sm', colorScheme: 'green' }, 'View Breakdown')
                )
              )
            )
          )
        )
      case 'settings':
        return React.createElement(VStack, { spacing: 6 },
          React.createElement(HStack, { justify: 'space-between' },
            React.createElement(Heading, { size: 'lg', color: 'teal.600' }, '⚙️ System Settings'),
            React.createElement(Button, { onClick: () => setCurrentPage('dashboard') }, 'Back to Dashboard')
          ),
          React.createElement(VStack, { spacing: 4, align: 'stretch' },
            React.createElement(Card, null,
              React.createElement(CardBody, null,
                React.createElement(HStack, { justify: 'space-between' },
                  React.createElement(VStack, { align: 'start' },
                    React.createElement(Text, { fontWeight: 'bold' }, 'Email Notifications'),
                    React.createElement(Text, { fontSize: 'sm', color: 'gray.600' }, 'Send email updates to beneficiaries')
                  ),
                  React.createElement(Button, { colorScheme: 'teal', size: 'sm' }, 'Configure')
                )
              )
            ),
            React.createElement(Card, null,
              React.createElement(CardBody, null,
                React.createElement(HStack, { justify: 'space-between' },
                  React.createElement(VStack, { align: 'start' },
                    React.createElement(Text, { fontWeight: 'bold' }, 'Data Backup'),
                    React.createElement(Text, { fontSize: 'sm', color: 'gray.600' }, 'Automated daily backups')
                  ),
                  React.createElement(Button, { colorScheme: 'blue', size: 'sm' }, 'Schedule')
                )
              )
            )
          )
        )
      case 'barangays':
        const barangayData = [
          { name: 'Poblacion', beneficiaries: 187, applications: 45 },
          { name: 'Aramaywan', beneficiaries: 134, applications: 32 },
          { name: 'Batong Buhay', beneficiaries: 98, applications: 28 },
          { name: 'Culasian', beneficiaries: 156, applications: 41 },
          { name: 'Dumarao', beneficiaries: 89, applications: 19 },
          { name: 'Latud', beneficiaries: 112, applications: 25 },
          { name: 'Panacan', beneficiaries: 145, applications: 38 },
          { name: 'Ransang', beneficiaries: 76, applications: 15 },
          { name: 'Rizal', beneficiaries: 123, applications: 29 },
          { name: 'Salvacion', beneficiaries: 91, applications: 22 },
          { name: 'Taburi', beneficiaries: 67, applications: 18 }
        ]

        const sampleBeneficiaries = [
          { firstName: 'Maria', lastName: 'Santos', age: 34, birthday: '1989-05-15', program: 'Livelihood Assistance', status: 'Active', contact: '09123456789' },
          { firstName: 'Juan', lastName: 'Dela Cruz', age: 45, birthday: '1978-12-03', program: 'Senior Citizen Pension', status: 'Pending', contact: '09234567890' },
          { firstName: 'Ana', lastName: 'Reyes', age: 28, birthday: '1995-08-22', program: 'Solo Parent Support', status: 'Active', contact: '09345678901' },
          { firstName: 'Pedro', lastName: 'Garcia', age: 52, birthday: '1971-03-10', program: 'Livelihood Assistance', status: 'Under Review', contact: '09456789012' },
          { firstName: 'Rosa', lastName: 'Martinez', age: 39, birthday: '1984-11-28', program: 'Child Development', status: 'Active', contact: '09567890123' }
        ]

        return React.createElement(VStack, { spacing: 6 },
          React.createElement(HStack, { justify: 'space-between' },
            React.createElement(Heading, { size: 'lg', color: 'orange.600' }, '🏘️ Barangay Management'),
            React.createElement(Button, { onClick: () => setCurrentPage('dashboard') }, 'Back to Dashboard')
          ),

          // Horizontal Wide Chart
          React.createElement(Card, { mb: 6, w: 'full' },
            React.createElement(CardBody, null,
              React.createElement(Heading, { size: 'md', mb: 4 }, '📊 Beneficiaries by Barangay'),
              React.createElement(Box, { overflowX: 'auto' },
                React.createElement(HStack, { spacing: 6, minW: 'max-content', pb: 4 },
                  ...barangayData.map((item, index) =>
                    React.createElement(VStack, { key: index, spacing: 2, minW: '120px', align: 'center' },
                      React.createElement(Text, { fontWeight: 'bold', fontSize: 'sm' }, item.name),
                      React.createElement(Box, { w: '100px', h: `${(item.beneficiaries / 200) * 100 + 20}px`, bg: 'orange.500', borderRadius: 'md', position: 'relative', display: 'flex', alignItems: 'end', justifyContent: 'center' },
                        React.createElement(Text, { color: 'white', fontWeight: 'bold', fontSize: 'xs', mb: 1 }, item.beneficiaries)
                      ),
                      React.createElement(Text, { fontSize: 'xs', color: 'blue.600' }, `${item.applications} pending`)
                    )
                  )
                )
              )
            )
          ),

          // Barangay Cards with Modal
          React.createElement(SimpleGrid, { columns: { base: 1, md: 2, lg: 4 }, spacing: 4 },
            ...barangayData.map((item, index) =>
              React.createElement(Card, { key: index, cursor: 'pointer', _hover: { shadow: 'lg' } },
                React.createElement(CardBody, null,
                  React.createElement(VStack, { spacing: 3, align: 'center' },
                    React.createElement(Text, { fontWeight: 'bold', fontSize: 'lg' }, item.name),
                    React.createElement(Text, { fontSize: 'sm', color: 'orange.600' }, `${item.beneficiaries} beneficiaries`),
                    React.createElement(Text, { fontSize: 'sm', color: 'blue.600' }, `${item.applications} pending`),
                    React.createElement(Button, {
                      size: 'sm',
                      colorScheme: 'orange',
                      onClick: () => {
                        setSelectedBarangay(item)
                        onOpen()
                      }
                    }, 'View Details')
                  )
                )
              )
            )
          ),

          // Modal for Beneficiary Details
          React.createElement(Modal, { isOpen: isOpen, onClose: onClose, size: 'full' },
            React.createElement(ModalOverlay, null),
            React.createElement(ModalContent, null,
              React.createElement(ModalHeader, null,
                selectedBarangay ? `Beneficiaries in ${selectedBarangay.name}` : 'Beneficiary Details'
              ),
              React.createElement(ModalCloseButton, null),
              React.createElement(ModalBody, null,
                selectedBarangay && React.createElement(Box, { overflowX: 'auto' },
                  React.createElement('table', {
                    style: { width: '100%', borderCollapse: 'collapse', fontSize: '16px' }
                  },
                    React.createElement('thead', null,
                      React.createElement('tr', { style: { backgroundColor: '#f7fafc' } },
                        React.createElement('th', { style: { padding: '16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' } }, 'First Name'),
                        React.createElement('th', { style: { padding: '16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' } }, 'Last Name'),
                        React.createElement('th', { style: { padding: '16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' } }, 'Age'),
                        React.createElement('th', { style: { padding: '16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' } }, 'Birthday'),
                        React.createElement('th', { style: { padding: '16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' } }, 'Program'),
                        React.createElement('th', { style: { padding: '16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' } }, 'Status'),
                        React.createElement('th', { style: { padding: '16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' } }, 'Contact')
                      )
                    ),
                    React.createElement('tbody', null,
                      ...sampleBeneficiaries.map((beneficiary, bIndex) =>
                        React.createElement('tr', { key: bIndex, style: { borderBottom: '1px solid #e2e8f0' } },
                          React.createElement('td', { style: { padding: '16px' } }, beneficiary.firstName),
                          React.createElement('td', { style: { padding: '16px' } }, beneficiary.lastName),
                          React.createElement('td', { style: { padding: '16px' } }, beneficiary.age),
                          React.createElement('td', { style: { padding: '16px' } }, beneficiary.birthday),
                          React.createElement('td', { style: { padding: '16px' } }, beneficiary.program),
                          React.createElement('td', { style: { padding: '16px' } },
                            React.createElement('span', {
                              style: {
                                padding: '6px 12px',
                                borderRadius: '16px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                backgroundColor: beneficiary.status === 'Active' ? '#c6f6d5' : beneficiary.status === 'Pending' ? '#fed7d7' : '#bee3f8',
                                color: beneficiary.status === 'Active' ? '#22543d' : beneficiary.status === 'Pending' ? '#742a2a' : '#2a4365'
                              }
                            }, beneficiary.status)
                          ),
                          React.createElement('td', { style: { padding: '16px' } }, beneficiary.contact)
                        )
                      )
                    )
                  )
                )
              ),
              React.createElement(ModalFooter, null,
                React.createElement(Button, { colorScheme: 'blue', mr: 3, onClick: onClose }, 'Close'),
                React.createElement(Button, { variant: 'ghost' }, 'Export Data')
              )
            )
          )
        )
      case 'applications':
        return React.createElement(VStack, { spacing: 6 },
          React.createElement(HStack, { justify: 'space-between' },
            React.createElement(Heading, { size: 'lg', color: 'blue.600' }, '📋 My Applications'),
            React.createElement(Button, { onClick: () => setCurrentPage('dashboard') }, 'Back to Dashboard')
          ),
          React.createElement(HStack, { spacing: 4, mb: 4 },
            React.createElement(Button, { colorScheme: 'green', onClick: () => setCurrentPage('household-form') }, '🏠 Household Case Record'),
            React.createElement(Button, { colorScheme: 'blue', onClick: () => setCurrentPage('livelihood-form') }, '💼 Livelihood Program')
          ),
          React.createElement(Text, { color: 'gray.500', textAlign: 'center', py: 8 },
            'No applications submitted yet. Use the buttons above to apply for programs.'
          )
        )
      case 'messages':
        return React.createElement(VStack, { spacing: 6 },
          React.createElement(HStack, { justify: 'space-between' },
            React.createElement(Heading, { size: 'lg', color: 'green.600' }, '💬 Messages'),
            React.createElement(Button, { onClick: () => setCurrentPage('dashboard') }, 'Back to Dashboard')
          ),
          React.createElement(HStack, { spacing: 6, align: 'start', h: '500px' },
            React.createElement(Card, { w: '300px', h: 'full' },
              React.createElement(CardBody, null,
                React.createElement(VStack, { spacing: 3, align: 'stretch' },
                  React.createElement(Heading, { size: 'sm', mb: 2 }, 'Conversations'),
                  React.createElement(Card, { bg: 'blue.50', cursor: 'pointer' },
                    React.createElement(CardBody, { p: 3 },
                      React.createElement(VStack, { align: 'start', spacing: 1 },
                        React.createElement(Text, { fontWeight: 'bold', fontSize: 'sm' }, 'MSWD Officer'),
                        React.createElement(Text, { fontSize: 'xs', color: 'gray.600' }, 'Your application is being reviewed...')
                      )
                    )
                  )
                )
              )
            ),
            React.createElement(Card, { flex: 1, h: 'full' },
              React.createElement(CardBody, { display: 'flex', flexDirection: 'column', h: 'full' },
                React.createElement(VStack, { spacing: 3, flex: 1, overflowY: 'auto', align: 'stretch' },
                  React.createElement(Box, { alignSelf: 'flex-start', bg: 'gray.100', p: 3, borderRadius: 'lg', maxW: '70%' },
                    React.createElement(Text, { fontSize: 'sm' }, 'Hello! I have a question about my livelihood application.')
                  ),
                  React.createElement(Box, { alignSelf: 'flex-end', bg: 'blue.500', color: 'white', p: 3, borderRadius: 'lg', maxW: '70%' },
                    React.createElement(Text, { fontSize: 'sm' }, 'Hi! I\'ll be happy to help. What specific information do you need?')
                  )
                ),
                React.createElement(HStack, { mt: 4 },
                  React.createElement(Input, { placeholder: 'Type your message...', flex: 1 }),
                  React.createElement(Button, { colorScheme: 'blue' }, 'Send')
                )
              )
            )
          )
        )
      case 'household-form':
        return React.createElement(VStack, { spacing: 6, maxW: '4xl', mx: 'auto' },
          React.createElement(HStack, { justify: 'space-between' },
            React.createElement(Heading, { size: 'lg', color: 'green.600' }, '🏠 Household Case Record'),
            React.createElement(Button, { onClick: () => setCurrentPage('applications') }, 'Back')
          ),
          React.createElement(Card, null,
            React.createElement(CardBody, null,
              React.createElement(VStack, { spacing: 6, align: 'stretch' },
                React.createElement(Box, null,
                  React.createElement(Heading, { size: 'md', mb: 3, color: 'blue.600' }, 'Interviewed By'),
                  React.createElement(SimpleGrid, { columns: { base: 1, md: 2 }, spacing: 4 },
                    React.createElement(Input, { placeholder: 'Last Name' }),
                    React.createElement(Input, { placeholder: 'First Name' }),
                    React.createElement(Input, { placeholder: 'Middle Name' }),
                    React.createElement(Input, { placeholder: 'Position' })
                  )
                ),
                React.createElement(Box, null,
                  React.createElement(Heading, { size: 'md', mb: 3, color: 'green.600' }, 'Beneficiary Information'),
                  React.createElement(SimpleGrid, { columns: { base: 1, md: 2 }, spacing: 4 },
                    React.createElement(Input, { placeholder: 'Last Name' }),
                    React.createElement(Input, { placeholder: 'First Name' }),
                    React.createElement(Input, { placeholder: 'Middle Name' }),
                    React.createElement(Input, { placeholder: 'Relationship' }),
                    React.createElement(Input, { placeholder: 'Age', type: 'number' }),
                    React.createElement(Input, { placeholder: 'Birth Date', type: 'date' }),
                    React.createElement(Select, { placeholder: 'Marital Status' },
                      React.createElement('option', { value: 'single' }, 'Single'),
                      React.createElement('option', { value: 'married' }, 'Married'),
                      React.createElement('option', { value: 'widowed' }, 'Widowed'),
                      React.createElement('option', { value: 'separated' }, 'Separated')
                    ),
                    React.createElement(Input, { placeholder: 'Educational Attainment' }),
                    React.createElement(Input, { placeholder: 'Occupation' })
                  )
                ),
                React.createElement(Box, null,
                  React.createElement(Heading, { size: 'md', mb: 3, color: 'purple.600' }, 'Complete Address'),
                  React.createElement(VStack, { spacing: 4 },
                    React.createElement(Input, { placeholder: 'Complete Address' }),
                    React.createElement(SimpleGrid, { columns: { base: 1, md: 2 }, spacing: 4 },
                      React.createElement(Input, { placeholder: 'Sitio/Purok' }),
                      React.createElement(Select, { placeholder: 'Barangay' },
                        ['Poblacion', 'Aramaywan', 'Batong Buhay', 'Culasian', 'Dumarao', 'Latud', 'Panacan', 'Ransang', 'Rizal', 'Salvacion', 'Taburi'].map(b =>
                          React.createElement('option', { key: b, value: b }, b)
                        )
                      ),
                      React.createElement(Input, { placeholder: 'Town', value: 'Rizal', readOnly: true }),
                      React.createElement(Input, { placeholder: 'Province', value: 'Palawan', readOnly: true })
                    )
                  )
                ),
                React.createElement(Box, null,
                  React.createElement(Heading, { size: 'md', mb: 3, color: 'orange.600' }, 'Other Information'),
                  React.createElement(SimpleGrid, { columns: { base: 1, md: 2 }, spacing: 4 },
                    React.createElement(Input, { placeholder: 'Religion' }),
                    React.createElement(Input, { placeholder: 'Sector' }),
                    React.createElement(Input, { placeholder: 'Monthly Income', type: 'number' }),
                    React.createElement(Input, { placeholder: 'Contact Number' })
                  )
                ),
                React.createElement(Box, null,
                  React.createElement(Heading, { size: 'md', mb: 3, color: 'red.600' }, 'Problem Presented'),
                  React.createElement('textarea', {
                    placeholder: 'Describe the problem or concern...',
                    style: { width: '100%', minHeight: '100px', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px' }
                  })
                ),
                React.createElement(Button, { colorScheme: 'green', size: 'lg' }, 'Submit Application')
              )
            )
          )
        )
      case 'webstudio-demo':
        // Import WebstudioDemo component dynamically
        const WebstudioDemo = React.lazy(() => import('./pages/webstudio/WebstudioDemo').then(module => ({ default: module.WebstudioDemo })))
        return React.createElement(React.Suspense, { fallback: React.createElement(Text, null, 'Loading Webstudio Demo...') },
          React.createElement(VStack, { spacing: 6 },
            React.createElement(HStack, { justify: 'space-between' },
              React.createElement(Heading, { size: 'lg', color: 'purple.600' }, '🎨 Webstudio Integration Demo'),
              React.createElement(Button, { onClick: () => setCurrentPage('dashboard') }, 'Back to Dashboard')
            ),
            React.createElement(WebstudioDemo, null)
          )
        )
      case 'livelihood-form':
        return React.createElement(VStack, { spacing: 6, maxW: '4xl', mx: 'auto' },
          React.createElement(HStack, { justify: 'space-between' },
            React.createElement(Heading, { size: 'lg', color: 'blue.600' }, '💼 Livelihood Program Application'),
            React.createElement(Button, { onClick: () => setCurrentPage('applications') }, 'Back')
          ),
          React.createElement(Card, null,
            React.createElement(CardBody, null,
              React.createElement(VStack, { spacing: 6, align: 'stretch' },
                React.createElement(Box, null,
                  React.createElement(Heading, { size: 'md', mb: 3, color: 'blue.600' }, 'Personal Information'),
                  React.createElement(SimpleGrid, { columns: { base: 1, md: 2 }, spacing: 4 },
                    React.createElement(Input, { placeholder: 'Full Name' }),
                    React.createElement(Input, { placeholder: 'Age', type: 'number' }),
                    React.createElement(Input, { placeholder: 'Contact Number' }),
                    React.createElement(Input, { placeholder: 'Email Address', type: 'email' })
                  )
                ),
                React.createElement(Box, null,
                  React.createElement(Heading, { size: 'md', mb: 3, color: 'green.600' }, 'Business Proposal'),
                  React.createElement(VStack, { spacing: 4 },
                    React.createElement(Input, { placeholder: 'Business Name/Type' }),
                    React.createElement('textarea', {
                      placeholder: 'Business Description and Plan...',
                      style: { width: '100%', minHeight: '100px', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px' }
                    }),
                    React.createElement(SimpleGrid, { columns: { base: 1, md: 2 }, spacing: 4 },
                      React.createElement(Input, { placeholder: 'Requested Amount', type: 'number' }),
                      React.createElement(Select, { placeholder: 'Business Category' },
                        React.createElement('option', { value: 'agriculture' }, 'Agriculture'),
                        React.createElement('option', { value: 'retail' }, 'Retail/Trading'),
                        React.createElement('option', { value: 'services' }, 'Services'),
                        React.createElement('option', { value: 'manufacturing' }, 'Manufacturing')
                      )
                    )
                  )
                ),
                React.createElement(Button, { colorScheme: 'blue', size: 'lg' }, 'Submit Application')
              )
            )
          )
        )
      default: return renderDashboard()
    }
  }

  return React.createElement(Box, { minH: '100vh', bg: 'gray.50' },
    React.createElement(Box, { bg: 'white', shadow: 'sm', p: 4, mb: 6 },
      React.createElement(HStack, { justify: 'space-between', maxW: '6xl', mx: 'auto' },
        React.createElement(Heading, { size: 'md', color: 'blue.600' },
          'MSWD Livelihood Rizal Palawan'
        ),
        React.createElement(HStack, { spacing: 4 },
          React.createElement(Badge, {
            colorScheme: getRoleColor(userRole),
            fontSize: 'sm',
            px: 3,
            py: 1
          }, userRole.toUpperCase()),
          React.createElement(Text, { color: 'gray.600' }, user.email),
          React.createElement(Button, {
            colorScheme: 'red',
            size: 'sm',
            onClick: handleLogout
          }, 'Logout')
        )
      )
    ),
    React.createElement(Box, { maxW: '6xl', mx: 'auto', p: 6 },
      renderCurrentPage()
    )
  )
}

export default App