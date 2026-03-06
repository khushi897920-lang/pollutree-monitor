import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// This endpoint allows the first user to make themselves admin
// After that, only admins can promote other users
export async function POST(request) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { targetUserId, email } = body;

    // Get current user's role
    const currentUserRole = sessionClaims?.metadata?.role || sessionClaims?.publicMetadata?.role;

    // Get all users to check if this is the first user
    const client = await clerkClient();
    const users = await client.users.getUserList({ limit: 100 });
    const isFirstUser = users.data.length === 1;

    // Allow if:
    // 1. This is the first user (auto-admin)
    // 2. Current user is already an admin
    if (!isFirstUser && currentUserRole !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can promote other users' },
        { status: 403 }
      );
    }

    // Find target user
    let targetUser;
    if (targetUserId) {
      targetUser = await client.users.getUser(targetUserId);
    } else if (email) {
      const usersWithEmail = await client.users.getUserList({
        emailAddress: [email],
      });
      if (usersWithEmail.data.length === 0) {
        return NextResponse.json(
          { error: 'User not found with that email' },
          { status: 404 }
        );
      }
      targetUser = usersWithEmail.data[0];
    } else if (isFirstUser) {
      // Make current user admin if they're the first user
      targetUser = await client.users.getUser(userId);
    } else {
      return NextResponse.json(
        { error: 'Please provide targetUserId or email' },
        { status: 400 }
      );
    }

    // Update user metadata to add admin role
    await client.users.updateUserMetadata(targetUser.id, {
      publicMetadata: {
        role: 'admin',
      },
    });

    return NextResponse.json({
      success: true,
      message: `User ${targetUser.emailAddresses[0]?.emailAddress} is now an admin`,
      userId: targetUser.id,
    });
  } catch (error) {
    console.error('Make admin error:', error);
    return NextResponse.json(
      { error: 'Failed to update user role', details: error.message },
      { status: 500 }
    );
  }
}

// Get current user's role
export async function GET() {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const role = sessionClaims?.metadata?.role || sessionClaims?.publicMetadata?.role || 'citizen';

    return NextResponse.json({
      userId,
      role,
      isAdmin: role === 'admin',
    });
  } catch (error) {
    console.error('Get role error:', error);
    return NextResponse.json(
      { error: 'Failed to get user role' },
      { status: 500 }
    );
  }
}
