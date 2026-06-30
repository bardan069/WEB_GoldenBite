import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./auth";

interface AdminPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
}

export function requireAdmin(
  handler: (req: NextRequest, ctx: { params: Promise<Record<string, string>> }, admin: AdminPayload) => Promise<NextResponse>
) {
  return async (req: NextRequest, ctx: { params: Promise<Record<string, string>> }) => {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    try {
      const payload = verifyToken(token) as AdminPayload;

      if (payload.role !== "admin") {
        return NextResponse.json({ error: "Admin access required." }, { status: 403 });
      }

      return handler(req, ctx, payload);
    } catch {
      return NextResponse.json({ error: "Invalid or expired token." }, { status: 401 });
    }
  };
}
