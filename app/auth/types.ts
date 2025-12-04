// Custom user fields added via Better Auth additionalFields
// since i set up better-auth options as a factory function there doesn't seem to be a good way to infer types like you are supposed to be able to do
export interface CustomUserFields {
  firstName: string | null;
  lastName: string | null;
  unitNumber: number;
}
