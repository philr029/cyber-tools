import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, createUser } from "@/lib/users";
import { createSession } from "@/lib/session";

// Simple email validation: must contain exactly one @ with non-empty local and domain parts,
// and the domain must contain at least one dot. Uses indexOf to avoid ReDoS.
function isValidEmail(email: string): boolean {
  const atIdx = email.indexOf("@");
  if (atIdx < 1) return false;
  const domain = email.slice(atIdx + 1);
  if (domain.length < 3) return false;
  const dotIdx = domain.lastIndexOf(".");
  return dotIdx > 0 && dotIdx < domain.length - 1;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password } = body as {
      email: string;
      name: string;
      password: string;
    };

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    if (getUserByEmail(email)) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 },
      );
    }

    const user = createUser(email, name, password);
    await createSession(user.id, user.email, user.name, user.plan);

    return NextResponse.json(
      { user: { id: user.id, email: user.email, name: user.name, plan: user.plan } },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
