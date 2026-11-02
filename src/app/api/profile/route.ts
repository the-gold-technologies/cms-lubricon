import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

const unauthorized = () =>
  NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

export async function GET() {
  try {
    const session = await auth();
    const sessionEmail = session?.user?.email;
    if (!sessionEmail) return unauthorized();

    const user = await prisma.user.findUnique({
      where: { email: sessionEmail },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) return unauthorized();

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ success: false, error: 'Failed to load profile' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    const sessionUserId = (session?.user as any)?.id;
    const sessionEmail = session?.user?.email;

    if (!sessionUserId && !sessionEmail) return unauthorized();

    const body = await request.json();
    const { name, email, currentPassword, newPassword } = body;

    // Only ever update the account that is logged in
    let user = null;
    if (sessionUserId) {
      user = await prisma.user.findUnique({ where: { id: sessionUserId } });
    }
    if (!user && sessionEmail) {
      user = await prisma.user.findUnique({ where: { email: sessionEmail } });
    }
    if (!user) return unauthorized();

    const updateData: { name?: string; email?: string; password?: string } = {};

    if (name && name.trim()) {
      updateData.name = name.trim();
    }

    if (email && email.trim() && email.trim() !== user.email) {
      const trimmedEmail = email.trim().toLowerCase();
      // Check if email is already taken by another user
      const existing = await prisma.user.findUnique({
        where: { email: trimmedEmail },
      });
      if (existing && existing.id !== user.id) {
        return NextResponse.json(
          { success: false, error: 'This email address is already in use by another user' },
          { status: 400 }
        );
      }
      updateData.email = trimmedEmail;
    }

    // Password Update Flow
    if (newPassword && newPassword.trim()) {
      const trimmedNewPassword = newPassword.trim();

      if (trimmedNewPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: 'New password must be at least 6 characters long' },
          { status: 400 }
        );
      }

      if (!currentPassword) {
        return NextResponse.json(
          { success: false, error: 'Please enter your current password to authorize this change' },
          { status: 400 }
        );
      }

      // Verify current password against the hashed database password
      const isMatch = user.password ? await bcrypt.compare(currentPassword, user.password) : false;
      if (!isMatch) {
        return NextResponse.json(
          { success: false, error: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      updateData.password = await bcrypt.hash(trimmedNewPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Profile and credentials updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
