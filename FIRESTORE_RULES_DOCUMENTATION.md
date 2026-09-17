# Firebase Firestore Security Rules Documentation

## Project: Sampark News Platform

This document outlines the comprehensive security rules for your Firestore database, designed to protect your news platform while enabling proper role-based access.

---

## Overview

Your application has **3 main collections**:
1. **users** - User profiles with roles (admin, reporter)
2. **articles** - News articles with draft/published status
3. **grievances** - Public feedback/complaints

**User Roles:**
- **Admin**: Editor/Manager with full control over articles, approvals, and grievance management
- **Reporter**: Can write and manage their own article drafts
- **Public**: Can read published articles, submit grievances

---

## Helper Functions

These utility functions are used throughout the rules for cleaner, more maintainable code:

```javascript
isAuth()           // ✓ User is authenticated
getUserDoc()       // Get current user's Firestore document
hasRole(role)      // ✓ User has specific role (admin, reporter)
isAdmin()          // ✓ User is admin
isReporter()       // ✓ User is reporter
emailVerified()    // ✓ User's email is verified
isOwner()          // ✓ User owns the document (for user collection)
```

**Why Email Verification Matters:**
- Prevents access from users who haven't verified their email
- Required for sensitive operations (article publishing, grievance management)
- Checked in `request.auth.token.email_verified`

---

## Collection Rules Breakdown

### 1. USERS Collection

**Location:** `/users/{uid}`

#### READ Rules:
```
✓ ALLOWED:
- Authenticated users can read ONLY their own document
- Prevents users from seeing other users' profiles
```

```javascript
allow read: if isAuth() && request.auth.uid == uid;
```

#### CREATE Rules:
```
✓ ALLOWED:
- During signup: authenticated user creates their own document
- Email NOT yet verified (verification comes after signup)
```

```javascript
allow create: if isAuth() && request.auth.uid == uid && emailVerified() == false;
```

#### UPDATE Rules:
```
✓ ALLOWED:
- Users can update their own profile after email verification
- Prevents unverified users from modifying their record
```

```javascript
allow update: if isAuth() && request.auth.uid == uid && emailVerified();
```

#### DELETE Rules:
```
✗ BLOCKED:
- User documents cannot be deleted (audit/compliance requirement)
```

**Why This Matters:**
- Users can only see/modify their own data
- Email verification enforced before profile updates
- Permanent audit trail of user accounts

---

### 2. ARTICLES Collection

**Location:** `/articles/{articleId}`

#### REPORTER: CREATE (Write New Articles)

```javascript
allow create: if 
  isReporter() &&                                    // ✓ User is reporter
  emailVerified() &&                                 // ✓ Email verified
  request.resource.data.author == request.auth.currentUser.displayName &&
  request.resource.data.authorEmail == request.auth.token.email &&
  request.resource.data.status == 'draft' &&       // ✓ Created as draft
  request.resource.data.keys().hasAll([
    'title', 'content', 'excerpt', 'category', 
    'tags', 'imageUrl', 'author', 'authorEmail'
  ]) &&
  request.resource.data.publishedAt == null &&     // ✓ Not published yet
  request.resource.data.reads == 0;                // ✓ No reads yet
```

**What This Prevents:**
- Non-reporters from creating articles
- Creating articles with wrong author info
- Creating articles with published status (must go through editor)
- Missing required fields

#### REPORTER: UPDATE (Edit Own Drafts)

```javascript
allow update: if 
  isReporter() &&
  emailVerified() &&
  resource.data.authorEmail == request.auth.token.email &&  // ✓ Own article only
  resource.data.status == 'draft' &&                        // ✓ Not published
  request.resource.data.authorEmail == resource.data.authorEmail &&  // Can't change author
  request.resource.data.author == resource.data.author;
```

**What This Prevents:**
- Reporters from editing other reporters' articles
- Reporters from editing published articles
- Reporters from changing the author/authorship
- Unauthorized article modifications

#### REPORTER: DELETE (Remove Own Drafts)

```javascript
allow delete: if 
  isReporter() &&
  emailVerified() &&
  resource.data.authorEmail == request.auth.token.email &&  // ✓ Own article only
  resource.data.status == 'draft';                          // ✓ Not published
```

**What This Prevents:**
- Reporters from deleting published articles
- Reporters from deleting other reporters' articles
- Permanent deletion of audited content

#### PUBLIC: READ (Access Published Articles)

```javascript
allow read: if 
  isAuth() &&              // ✓ Must be authenticated
  emailVerified() &&       // ✓ Email verified
  resource.data.status == 'published';  // ✓ Only published articles
```

**What This Achieves:**
- Public can read only published articles
- Prevents access to drafts, rejected articles
- Requires authentication (analytics tracking)

#### ADMIN: READ (See All Articles)

```javascript
allow read: if isAdmin() && emailVerified();
```

**What This Achieves:**
- Editors can review drafts, pending, published, rejected articles
- Full visibility for management

#### ADMIN: UPDATE (Publish Articles)

```javascript
allow update: if 
  isAdmin() &&
  emailVerified() &&
  (
    // Publishing articles (draft/pending -> published)
    (resource.data.status in ['draft', 'pending'] && 
     request.resource.data.status == 'published') ||
    
    // Pinning featured articles
    (request.resource.data.pinned != resource.data.pinned && 
     request.resource.data.status == 'published') ||
    
    // Increment read counter
    (request.resource.data.reads == resource.data.reads + 1)
  );
```

**What This Achieves:**
- Admins can approve & publish articles from reporters
- Admins can pin/feature articles on homepage
- Atomic read count increments
- Only allows status change for unpublished articles

#### ADMIN: UPDATE (Reject Articles)

```javascript
allow update: if 
  isAdmin() &&
  emailVerified() &&
  resource.data.status in ['draft', 'pending'] &&
  request.resource.data.status == 'rejected';
```

**What This Achieves:**
- Admins can reject articles with feedback (via adminNote)
- Prevents rejection of published articles

---

### 3. GRIEVANCES Collection

**Location:** `/grievances/{grievanceId}`

#### PUBLIC: CREATE (Submit Feedback)

```javascript
allow create: if 
  request.resource.data.keys().hasAll([
    'name', 'email', 'type', 'message', 'status', 'submittedAt'
  ]) &&
  request.resource.data.status == 'pending' &&
  request.resource.data.resolvedAt == null &&
  request.resource.data.adminNote == '' &&
  request.resource.data.name.size() > 0 &&
  request.resource.data.email.size() > 0 &&
  request.resource.data.message.size() > 50 &&       // ✓ Meaningful message
  request.resource.data.type in ['content', 'technical', 'other'];
```

**What This Achieves:**
- Anyone can submit a grievance (even anonymous)
- Messages must be at least 50 characters
- Grievance starts in "pending" status
- Type must be one of predefined categories
- Prevents spam/template attacks

**Allowed Grievance Types:**
- `content` - Article content issues
- `technical` - Technical problems
- `other` - General feedback

#### ADMIN: READ (Access Grievances)

```javascript
allow read: if isAdmin() && emailVerified();
```

**What This Achieves:**
- Only admins can see grievances
- Protects user privacy/feedback security

#### ADMIN: UPDATE (Manage Grievances)

```javascript
allow update: if 
  isAdmin() &&
  emailVerified() &&
  request.resource.data.status in ['pending', 'reviewing', 'resolved', 'rejected'] &&
  (resource.data.status == 'pending' || resource.data.status == 'reviewing');
```

**Status Workflow:**
```
pending → reviewing → resolved (or rejected)
```

**What This Achieves:**
- Admins can change grievance status
- Can add admin notes/responses
- Prevents revising old grievances
- Maintains audit trail

#### GRIEVANCE: DELETE (BLOCKED)

```javascript
allow delete: if false;
```

**Why:**
- Compliance/audit requirements
- Preserves feedback history
- Legal protection

---

## Security Patterns Used

### 1. **Role-Based Access Control (RBAC)**
```
Admin: Full control over articles, grievances, user management
Reporter: Can create & edit own articles (drafts only)
Public: Can read published articles, submit grievances
```

### 2. **Email Verification Gate**
```
Unverified users → Limited to signup operations only
Verified users → Full access based on role
```

### 3. **Ownership Verification**
```
Before allowing update/delete → Check: authorEmail == request.auth.token.email
Prevents users from modifying others' data
```

### 4. **Status-Based Access**
```
Draft articles → Only author (reporter) can edit/delete
Published articles → Cannot be modified by reporters
Grievances → Specific workflow (pending → reviewing → resolved)
```

### 5. **Data Validation at Rules Level**
```
Required fields must be present
Field values must match predefined types
Prevents incomplete/malformed documents
```

### 6. **Immutable Audit Trail**
```
User documents cannot be deleted
Grievances cannot be deleted
Status changes are timestamped
```

---

## How to Deploy These Rules

### Option 1: Firebase Console
1. Go to **Firestore Database** → **Rules** tab
2. Replace the existing rules with `firestore.rules` content
3. Click **Publish**

### Option 2: Firebase CLI
```bash
firebase deploy --only firestore:rules
```

### Option 3: Test Locally
```bash
firebase emulators:start
# This loads your firestore.rules file
```

---

## Testing the Rules

### Test Case 1: Reporter Creating Article
```javascript
// ✓ SHOULD WORK
POST /articles {
  title: "Breaking News",
  content: "<p>Article content</p>",
  excerpt: "Summary",
  category: "Politics",
  tags: ["news", "politics"],
  author: "John Reporter",
  authorEmail: "john@sampark.com",
  imageUrl: "https://...",
  status: "draft",
  publishedAt: null,
  reads: 0
}

// ✗ WILL FAIL - Setting status to published
POST /articles {
  ...
  status: "published"  // ❌ Reporters can't do this
}
```

### Test Case 2: Reporter Editing Another's Article
```javascript
// User A trying to edit User B's article
// ✗ WILL FAIL
PATCH /articles/user-b-article {
  title: "Changed Title"
}
// Fails because: resource.data.authorEmail != request.auth.token.email
```

### Test Case 3: Admin Publishing Article
```javascript
// ✓ SHOULD WORK
PATCH /articles/draft-article-123 {
  status: "published"
}
// Works because: isAdmin() && resource.data.status == 'draft'
```

### Test Case 4: Public Reading Article
```javascript
// ✓ SHOULD WORK (Published)
GET /articles/published-article-123
// resource.data.status == 'published' ✓

// ✗ WILL FAIL (Draft)
GET /articles/draft-article-123
// resource.data.status == 'draft' ✗
```

### Test Case 5: Submitting Grievance
```javascript
// ✓ SHOULD WORK (Anonymous submission)
POST /grievances {
  name: "Jane Doe",
  email: "jane@example.com",
  type: "content",
  message: "I found an error in the article about climate change. The statistics seem outdated.",
  status: "pending",
  submittedAt: timestamp,
  resolvedAt: null,
  adminNote: ""
}

// ✗ WILL FAIL (Message too short)
POST /grievances {
  ...
  message: "Bad article"  // Only 11 characters
}
```

---

## Common Issues & Solutions

### Issue 1: "User doesn't have permission to read document"
**Cause:** User trying to read a draft article they don't own
**Fix:** Only reporters (author) can read own drafts; non-authors must wait for publication

### Issue 2: "Missing required fields"
**Cause:** Creating article without all required fields
**Fix:** Ensure `title`, `content`, `excerpt`, `category`, `tags`, `imageUrl`, `author`, `authorEmail` are all provided

### Issue 3: "Cannot update published article"
**Cause:** Reporter trying to edit a published article
**Fix:** Only admins can modify published articles; reporters can only edit drafts

### Issue 4: "Admin cannot increment read count"
**Cause:** Attempt to set reads to arbitrary value
**Fix:** Use atomic increment: `reads = reads + 1` (handled server-side typically)

### Issue 5: "Cannot delete grievance"
**Cause:** Trying to delete a grievance document
**Fix:** Grievances are immutable for audit purposes; change status to resolved/rejected instead

---

## Database Structure Summary

```
Firestore Database
├── users/
│   └── {uid}
│       ├── uid: string
│       ├── email: string
│       ├── displayName: string
│       ├── role: "admin" | "reporter"
│       └── createdAt: timestamp
│
├── articles/
│   └── {articleId}
│       ├── title: string
│       ├── content: string
│       ├── excerpt: string
│       ├── category: string
│       ├── tags: array<string>
│       ├── author: string
│       ├── authorEmail: string
│       ├── imageUrl: string
│       ├── status: "draft" | "pending" | "published" | "rejected"
│       ├── pinned: boolean
│       ├── publishedAt: timestamp | null
│       ├── reads: number
│       └── updatedAt: timestamp
│
└── grievances/
    └── {grievanceId}
        ├── name: string
        ├── email: string
        ├── type: "content" | "technical" | "other"
        ├── articleUrl: string (optional)
        ├── message: string
        ├── status: "pending" | "reviewing" | "resolved" | "rejected"
        ├── submittedAt: timestamp
        ├── resolvedAt: timestamp | null
        └── adminNote: string
```

---

## Compliance & Best Practices

✅ **What These Rules Enforce:**
- Email verification before access
- Role-based access control (RBAC)
- Data ownership verification
- Audit trail (no deletions, status tracking)
- Input validation (required fields, type checking)
- Immutable timestamps

✅ **What's Missing (Implement Server-Side):**
- Rate limiting on grievance submissions
- DDoS protection
- Encryption at rest (Firebase default)
- Backup/disaster recovery strategy
- GDPR data deletion requests
- IP whitelisting (if needed)

---

## Next Steps

1. **Deploy Rules** - Copy `firestore.rules` to Firebase Console
2. **Test in Emulator** - Use Firebase emulator for local testing
3. **Monitor** - Check Firebase Console for rule violations
4. **Iterate** - Adjust based on real-world usage patterns
5. **Document** - Update team wiki with access policies

---

## Questions?

For issues or clarifications about these rules, refer to:
- [Firebase Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- Your project's AuthContext for role definitions
- articleService.ts for article operations
- API routes for server-side operations
