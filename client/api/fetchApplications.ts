import { parseJwt } from "../lib/parsejwt";

export async function fetchApplicationsByStudentId(rawToken: string) {
  if (rawToken) {
    const token = parseJwt(rawToken);
    const id = token.id;
    if (id) {
      const response = await fetch(
        `http://localhost:8000/api/auth/applications`
      );
      const data = await response.json();
      return data.applications;
    }
  }
  return null;
}
