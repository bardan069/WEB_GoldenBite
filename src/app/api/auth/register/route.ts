import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDB } from "@/lib/db";
import { UserModel } from "@/app/user.type";
import { hashPassword } from "@/lib/auth";

const RegisterSchema = z
  .object({
    name: z.string().min(3, "Full name must contain at least 3 characters."),
    email: z.string().email("Please enter a valid email."),
    password: z.string().min(8, "Password must contain at least 8 characters."),
    confirmPassword: z.string().min(8, "Confirm password is required."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"],
  });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = RegisterSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { name, email, password } = parseResult.data;
    await connectToDB();

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered." }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const user = await UserModel.create({ name, email, password: hashedPassword });

    return NextResponse.json(
      {
        message: "Registration successful.",
        user: { id: user._id.toString(), name: user.name, email: user.email },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error. Please try again later." }, { status: 500 });
  }
}
