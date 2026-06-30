import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { connectToDB } from "@/lib/db";
import { UserModel } from "@/app/user.type";
import { requireAdmin } from "@/lib/adminAuth";
import { hashPassword } from "@/lib/auth";

const UpdateUserSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters.").optional(),
  email: z.string().email("Please enter a valid email.").optional(),
  password: z.string().min(8, "Password must be at least 8 characters.").optional(),
  role: z.enum(["user", "admin"]).optional(),
});

type RouteCtx = { params: Promise<Record<string, string>> };

export const GET = requireAdmin(async (_req: NextRequest, ctx: RouteCtx) => {
  try {
    const { id } = await ctx.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID." }, { status: 400 });
    }

    await connectToDB();
    const user = await UserModel.findById(id).select("-password").lean();

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
});

export const PUT = requireAdmin(async (req: NextRequest, ctx: RouteCtx) => {
  try {
    const { id } = await ctx.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID." }, { status: 400 });
    }

    const body = await req.json();
    const parseResult = UpdateUserSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parseResult.error.format() },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = { ...parseResult.data };

    if (updates.password) {
      updates.password = await hashPassword(updates.password as string);
    }

    await connectToDB();

    if (updates.email) {
      const existing = await UserModel.findOne({ email: updates.email, _id: { $ne: id } });
      if (existing) {
        return NextResponse.json({ error: "Email already in use by another user." }, { status: 409 });
      }
    }

    const user = await UserModel.findByIdAndUpdate(id, updates, { new: true })
      .select("-password")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "User updated successfully.", data: user });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
});

export const PATCH = PUT;

export const DELETE = requireAdmin(async (_req: NextRequest, ctx: RouteCtx) => {
  try {
    const { id } = await ctx.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID." }, { status: 400 });
    }

    await connectToDB();
    const user = await UserModel.findByIdAndDelete(id).lean();

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
});
