import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDB } from "@/lib/db";
import { UserModel } from "@/app/user.type";
import { requireAdmin } from "@/lib/adminAuth";
import { hashPassword } from "@/lib/auth";

const CreateUserSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  email: z.string().email("Please enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: z.enum(["user", "admin"]).default("user"),
});

export const GET = requireAdmin(async (req: NextRequest) => {
  try {
    await connectToDB();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));
    const search = searchParams.get("search")?.trim() ?? "";

    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      UserModel.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      UserModel.countDocuments(filter),
    ]);

    return NextResponse.json({
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
});

export const POST = requireAdmin(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const parseResult = CreateUserSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { name, email, password, role } = parseResult.data;
    await connectToDB();

    const existing = await UserModel.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Email already registered." }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const user = await UserModel.create({ name, email, password: hashedPassword, role });

    return NextResponse.json(
      {
        message: "User created successfully.",
        data: { _id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
});
