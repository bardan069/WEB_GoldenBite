import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDB } from "@/lib/db";
import { UserModel } from "@/app/user.type";
import { verifyPassword, signToken } from "@/lib/auth";

const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email."),
  password: z.string().min(8, "Password must contain at least 8 characters."),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = LoginSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { email, password } = parseResult.data;
    await connectToDB();

    const user = await UserModel.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const passwordMatches = await verifyPassword(password, user.password);
    if (!passwordMatches) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const token = signToken({ sub: user._id.toString(), email: user.email, name: user.name, role: user.role ?? "user" });
    const response = NextResponse.json(
      { message: "Login successful.", user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role ?? "user" } },
      { status: 200 }
    );

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error. Please try again later." }, { status: 500 });
  }
}
