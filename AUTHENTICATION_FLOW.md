# MSWD Authentication Flow Documentation

## 🔥 Firebase Authentication (ONLY)

**CRITICAL:** This project uses Firebase Authentication exclusively. GitLab OAuth has been removed.

## Authentication Architecture

### Frontend (React + Firebase Web SDK)
```typescript
// Firebase Auth State Management
const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [customClaims, setCustomClaims] = useState<any>(null);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdTokenResult();
        setCustomClaims(token.claims);
      }
      setUser(user);
    });
    return unsubscribe;
  }, []);
  
  return { user, customClaims };
};
```

### Backend (FastAPI + Firebase Admin SDK)
```python
# Token Verification Middleware
async def verify_firebase_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(401, "Missing or invalid token")
    
    token = authorization.split(' ')[1]
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception:
        raise HTTPException(401, "Invalid Firebase token")
```

## User Roles & Permissions

### Custom Claims Structure
```json
{
  "role": "admin|superadmin|beneficiary",
  "barangay": "barangay-name",
  "permissions": [
    "read:programs",
    "write:applications", 
    "manage:users",
    "publish:webflow"
  ]
}
```

### Role Definitions
- **Superadmin:** Full system access, user management, analytics
- **Admin (MSWD Staff):** Program management, application processing
- **Beneficiary:** Self-service registration, application tracking

## Protected Routes Implementation

### Frontend Route Guards
```typescript
const ProtectedRoute = ({ children, requiredRole }: {
  children: React.ReactNode;
  requiredRole?: string;
}) => {
  const { user, customClaims } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  
  if (requiredRole && customClaims?.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }
  
  return <>{children}</>;
};
```

### Backend Permission Decorators
```python
def require_role(required_role: str):
    def decorator(func):
        async def wrapper(*args, **kwargs):
            token = await verify_firebase_token()
            user_role = token.get('role')
            
            if user_role != required_role:
                raise HTTPException(403, "Insufficient permissions")
                
            return await func(*args, **kwargs)
        return wrapper
    return decorator
```

## Authentication Flow Steps

### 1. User Registration/Login
1. User accesses login page
2. Firebase Auth UI handles authentication
3. User receives Firebase ID token
4. Custom claims assigned via Cloud Function or Admin SDK
5. Frontend stores auth state

### 2. API Request Authorization
1. Frontend includes Bearer token in requests
2. Backend middleware verifies token with Firebase Admin SDK
3. Extract user ID and custom claims
4. Authorize based on required permissions
5. Process request or return 403

### 3. Real-time Updates
1. Firebase Auth state listeners in React
2. Firestore security rules enforce data access
3. Real-time updates via Firestore listeners
4. Push notifications via FCM

## Security Considerations

### Token Management
- ID tokens expire after 1 hour
- Refresh tokens handled automatically by Firebase SDK
- Logout clears all local auth state
- Revoke refresh tokens on security incidents

### Security Rules
```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /programs/{programId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.token.role in ['admin', 'superadmin'];
    }
  }
}
```

## Environment Configuration

### Required Variables
```bash
# Firebase Web SDK
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=project-id

# Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT_JSON_BASE64=base64-service-account
FIREBASE_PROJECT_ID=project-id
```

## Testing Authentication

### Unit Tests
- Mock Firebase Auth in tests
- Test protected route behavior
- Verify token validation logic
- Test custom claims handling

### Integration Tests
- End-to-end auth flows
- Role-based access control
- Token refresh scenarios
- Security rule validation

## Migration from GitLab OAuth

### Removed Components
- All GitLab OAuth configuration
- GitLab callback routes
- GitLab user profile sync
- Mixed authentication providers

### Required Actions
1. Remove GitLab OAuth environment variables
2. Update all auth references to Firebase
3. Migrate existing user accounts to Firebase
4. Update API endpoints to use Firebase tokens only
5. Test all authentication flows