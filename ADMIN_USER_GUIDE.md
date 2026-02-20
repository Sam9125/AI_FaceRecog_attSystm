# Admin User Management Guide

## How Admin Can View All Registered Users

### Step-by-Step Instructions:

1. **Login as Admin**
   - Go to the login page
   - Enter your admin credentials (email and password)
   - Click "Login"

2. **Navigate to Admin Dashboard**
   - After login, click on "Admin Dashboard" in the navigation menu
   - You will see the Admin Dashboard page

3. **Access User Management Tab**
   - On the Admin Dashboard, you'll see two tabs at the top:
     - **Attendance Reports** (default tab)
     - **User Management** (new tab)
   - Click on the "User Management" tab

4. **View All Users**
   - You will see a complete list of all registered users in a table format
   - The table shows:
     - **User**: Name with avatar
     - **Email**: User's email address
     - **Role**: ADMIN or USER badge
     - **Face Registered**: Yes/No indicator (green checkmark or orange X)
     - **Status**: Active/Inactive
     - **Joined Date**: When the user registered

5. **User Information Details**
   - Total user count is displayed at the top right
   - Users with face registered show a green "Yes" chip
   - Users without face registered show an orange "No" chip
   - Admin users have a red "ADMIN" badge
   - Regular users have a gray "USER" badge

### Features Available:

- **View all registered users** in one place
- **Check face registration status** for each user
- **See user roles** (Admin vs Regular User)
- **View registration dates**
- **Monitor active/inactive status**

### API Endpoint Used:

```
GET /api/auth/users
```

This endpoint is protected and only accessible by admin users. Regular users will get a 403 Forbidden error if they try to access it.

### Technical Details:

**Backend:**
- Route: `backend/routes/auth.py`
- Endpoint: `@router.get("/users")`
- Authorization: Admin role required
- Service: `UserService.get_all_users()`

**Frontend:**
- Component: `frontend/src/pages/AdminDashboard.jsx`
- API Call: `authAPI.getAllUsers()`
- Tab: "User Management"

### Security:

- Only users with `role: "admin"` can access this feature
- JWT token authentication required
- Non-admin users are blocked at the API level

---

## Summary

Admin can now easily view all registered users by:
1. Login as admin
2. Go to Admin Dashboard
3. Click "User Management" tab
4. View complete user list with all details

This makes it easy for admins to:
- Monitor user registrations
- Check who has completed face registration
- Manage user accounts
- Track system usage
