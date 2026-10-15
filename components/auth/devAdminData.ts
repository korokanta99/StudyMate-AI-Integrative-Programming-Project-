// ============================================================
// DEV-ONLY FAKE ADMIN
//
// Lets the admin panel be used locally before the real
// POST /admin/login backend exists. Only active when running
// `next dev` (NODE_ENV === "development"); production builds
// always go through the real API.
// ============================================================

export const DEV_ADMIN_ENABLED =
  process.env.NODE_ENV === "development";

export const DEV_ADMIN_EMAIL = "admin@studymate.ai";
export const DEV_ADMIN_PASSWORD = "admin12345";
export const DEV_ADMIN_TOKEN = "dev-admin-token";

// Kept in memory so enabling/disabling a user sticks until reload
const users = [
  {
    id: "u-1001",
    name: "Maria Santos",
    email: "maria.santos@example.com",
    username: "maria",
    status: "active",
    createdAt: "2026-08-03T09:12:00Z",
  },
  {
    id: "u-1002",
    name: "James Reyes",
    email: "james.reyes@example.com",
    username: "jreyes",
    status: "active",
    createdAt: "2026-08-21T14:40:00Z",
  },
  {
    id: "u-1003",
    name: "Ana Cruz",
    email: "ana.cruz@example.com",
    username: "anacruz",
    status: "disabled",
    createdAt: "2026-09-10T07:05:00Z",
  },
];

const activity: Record<string, object[]> = {
  "u-1001": [
    {
      id: "a-1",
      type: "Uploaded material",
      description: "Cell Biology Lecture 3.pdf",
      createdAt: "2026-10-12T10:30:00Z",
    },
    {
      id: "a-2",
      type: "Completed quiz",
      description: "Cell Structure deck — 8/10",
      createdAt: "2026-10-13T16:05:00Z",
    },
  ],
  "u-1002": [
    {
      id: "a-3",
      type: "Asked AI",
      description: "Explain the Krebs cycle",
      createdAt: "2026-10-14T08:45:00Z",
    },
  ],
};

const materials = [
  {
    id: "m-1",
    fileName: "Cell Biology Lecture 3.pdf",
    ownerName: "Maria Santos",
    sizeBytes: 2_480_000,
    uploadedAt: "2026-10-12T10:30:00Z",
  },
  {
    id: "m-2",
    fileName: "Organic Chemistry Notes.docx",
    ownerName: "James Reyes",
    sizeBytes: 860_000,
    uploadedAt: "2026-10-09T13:15:00Z",
  },
];

const subscriptions = [
  {
    id: "s-1",
    userName: "Maria Santos",
    plan: "Pro Monthly",
    status: "active",
    currentPeriodEnd: "2026-11-03T00:00:00Z",
    cancelAtPeriodEnd: false,
  },
  {
    id: "s-2",
    userName: "James Reyes",
    plan: "Pro Monthly",
    status: "canceled",
    currentPeriodEnd: "2026-10-21T00:00:00Z",
    cancelAtPeriodEnd: true,
  },
];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function devAdminResponse(
  path: string,
  init?: RequestInit
) {
  const method = init?.method ?? "GET";

  if (path === "/admin/users") return json(users);
  if (path === "/admin/materials") return json(materials);
  if (path === "/admin/subscriptions") return json(subscriptions);

  const statusMatch = path.match(/^\/admin\/users\/([^/]+)\/status$/);

  if (statusMatch && method === "PUT") {
    const user = users.find((entry) => entry.id === statusMatch[1]);
    if (!user) return json({ message: "User not found" }, 404);

    const { status } = JSON.parse(String(init?.body ?? "{}"));
    user.status = status;

    return json(user);
  }

  const userMatch = path.match(/^\/admin\/users\/([^/]+)$/);

  if (userMatch) {
    const user = users.find((entry) => entry.id === userMatch[1]);
    if (!user) return json({ message: "User not found" }, 404);

    return json({ user, activity: activity[user.id] ?? [] });
  }

  return json({ message: "Not Found" }, 404);
}
