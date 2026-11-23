# Firebase setup for CampusConnect

## Firestore data model

- `users/{uid}`: user profile. Set `role` to `admin` only for trusted administrators; ordinary accounts use `user`.
- `users/{uid}/courses/{courseId}`: courses owned by that student. Each course stores `ownerUid`, `courseCode`, `courseName`, `credit`, `semester`, `instructor`, `gradePoint`, `createdAt`, and `updatedAt`.
- `allowedEmails/{email}`: email allow-list used by the existing sign-in gate.
- `students`, `notices`, and `events`: existing CampusConnect modules.

## Apply security rules

1. Open Firebase Console → Firestore Database → Rules.
2. Replace the current rules with the contents of `firestore.rules` and click **Publish**.
3. Create/sign in to an account, then in Firestore Console find `users/{that-user-uid}`.
4. For a trusted administrator only, change that document's `role` field from `user` to `admin`. Never let a student choose or edit this field.
5. Add the administrator's email to `allowedEmails/{email}` only if your app's access policy requires it; admins are recognized by their `users/{uid}.role` value.

## Important notes

- Courses are stored under each student's own UID. A student can read/write only their own courses. Admins can read all courses through the `collectionGroup('courses')` query.
- The CGPA calculator uses a 4.00 grade-point scale configured in the app. Confirm the grade scale against your institution's official policy.
- Existing `allowedEmails` documents must be created by an admin. A student's registration will be denied by the app until the email is approved and verified.
- These rules assume the existing student profile documents in `students` use an `email` field matching the signed-in account.
- Test the rules with Firebase Emulator Suite or the Rules Playground before using real student data.

## Complaint box

- `complaints/{complaintId}`: student-submitted complaint with `ownerUid`, `studentEmail`, `studentName`, `title`, `body`, `status` (`Pending` or `Resolved`), and `createdAt`.
- Students can create complaints and read only their own records. Admins can read all complaints and update complaint status.
- After changing Firestore rules, publish the updated `firestore.rules` file.
