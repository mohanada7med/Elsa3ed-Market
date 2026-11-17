import dotenv from 'dotenv';
dotenv.config();
import { getDatabase } from '../server/db/mongodb.ts';
import { register } from '../server/services/authService.ts';
import * as creatorService from '../server/services/creatorService.ts';
import type { AuthenticatedUser } from '../server/models/types.ts';

async function runTests() {
  console.log('--- Starting Creator Workflow Integration Tests ---');
  const { db } = await getDatabase();
  if (!db) {
    throw new Error('Database connection failed');
  }

  const testSuffix = Date.now();
  const testUsername = `creator_test_${testSuffix}`;
  const testEmail = `creator_${testSuffix}@example.com`;
  const testPassword = 'Password123!';

  const adminUser: AuthenticatedUser = {
    id: 'admin-system-test-user',
    username: 'admin',
    name: 'مدير المنصة',
    role: 'admin'
  };

  try {
    // 1. Register Creator
    console.log('\n[1] Testing Creator Registration...');
    const session = await register({
      username: testUsername,
      name: 'محمود الصعيدي التوثيقي',
      email: testEmail,
      password: testPassword,
      phone: '01012345678',
      role: 'creator',
      governorate: 'قنا',
      city: 'دندرة',
      bio: 'أوثق المعالم التاريخية والحرف التقليدية في قرى قنا والصعيد',
      specialties: ['heritage', 'crafts'],
      socialLinks: { instagram: 'https://instagram.com/test_creator' }
    });

    if (session.user.role !== 'creator') {
      throw new Error(`Expected role 'creator', got '${session.user.role}'`);
    }
    if (session.user.creatorStatus !== 'pending') {
      throw new Error(`Expected creatorStatus 'pending', got '${session.user.creatorStatus}'`);
    }
    console.log('✓ Creator registration succeeded with role: creator & status: pending');

    // 2. Verify Creator Document in DB
    console.log('\n[2] Verifying Creator Document in DB...');
    const creator = await creatorService.getCreatorProfile(session.user.id);
    if (!creator) {
      throw new Error('Creator document was not created in DB');
    }
    if (creator.status !== 'pending') {
      throw new Error(`Expected creator status 'pending', got '${creator.status}'`);
    }
    if (creator.bio !== 'أوثق المعالم التاريخية والحرف التقليدية في قرى قنا والصعيد') {
      throw new Error('Creator bio mismatch');
    }
    console.log('✓ Creator document verified with ID:', creator.id);

    // 3. Verify that pending creator cannot publish content
    console.log('\n[3] Testing that pending creator CANNOT publish photo before approval...');
    const pendingCreatorUser: AuthenticatedUser = {
      id: session.user.id,
      username: session.user.username,
      name: session.user.name,
      role: 'creator',
      creatorId: creator.id,
      creatorStatus: 'pending'
    };

    let publishBlocked = false;
    try {
      await creatorService.createCreatorPhoto(pendingCreatorUser, {
        title: 'صناعة الفخار في قنا',
        caption: 'توثيق مراحل تشكيل وتجفيف القلل القناوية الأصيلة',
        images: ['https://res.cloudinary.com/demo/image/upload/sample.jpg'],
        category: 'crafts',
        governorate: 'قنا'
      });
    } catch (err: any) {
      publishBlocked = true;
      console.log('✓ Expected authorization guard triggered:', err.message);
    }
    if (!publishBlocked) {
      throw new Error('Security Breach: Pending creator was allowed to publish photo before approval!');
    }

    // 4. Admin Approves Creator
    console.log('\n[4] Testing Admin Approval of Creator...');
    const approvedCreator = await creatorService.adminUpdateCreatorStatus(adminUser, creator.id, 'approved');
    if (!approvedCreator || approvedCreator.status !== 'approved') {
      throw new Error('Creator status was not updated to approved');
    }
    console.log('✓ Creator approved successfully by admin');

    // 5. Create Photo Post by Approved Creator
    console.log('\n[5] Testing Photo Post Creation by Approved Creator...');
    const approvedCreatorUser: AuthenticatedUser = {
      id: session.user.id,
      username: session.user.username,
      name: session.user.name,
      role: 'creator',
      creatorId: creator.id,
      creatorStatus: 'approved'
    };

    const photoPost = await creatorService.createCreatorPhoto(approvedCreatorUser, {
      title: 'صناعة الفخار في قنا',
      caption: 'توثيق مراحل تشكيل وتجفيف القلل القناوية الأصيلة',
      images: [
        'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        'https://res.cloudinary.com/demo/image/upload/sample2.jpg'
      ],
      category: 'crafts',
      governorate: 'قنا',
      location: 'قرية المحروسة',
      tags: ['فخار', 'قنا', 'تراث']
    });

    if (photoPost.status !== 'pending') {
      throw new Error(`Expected photo status 'pending', got '${photoPost.status}'`);
    }
    console.log('✓ Photo post created with ID:', photoPost.id, 'and status: pending');

    // 6. Verify Isolation: Pending content must NOT appear in public feeds
    console.log('\n[6] Verifying Public Feed Isolation (Pending photo must not be visible)...');
    const publicPhotosBefore = await creatorService.getPublicPhotos();
    const foundInPublicBefore = publicPhotosBefore.photos.find((p) => p.id === photoPost.id);
    if (foundInPublicBefore) {
      throw new Error('Security Breach: Pending photo found in public photos feed!');
    }

    const publicProfileBefore = await creatorService.getPublicCreatorProfile(creator.id);
    if (!publicProfileBefore) {
      throw new Error('Failed to fetch public creator profile');
    }
    const foundInProfileBefore = publicProfileBefore.photos.find((p) => p.id === photoPost.id);
    if (foundInProfileBefore) {
      throw new Error('Security Breach: Pending photo found in public creator profile!');
    }
    console.log('✓ Verified: Pending photo is strictly isolated from public views');

    // 7. Admin Approves Photo Post
    console.log('\n[7] Testing Admin Content Moderation (Approval)...');
    const approvedPhoto = await creatorService.adminModeratePhoto(adminUser, photoPost.id, 'approve');
    if (!approvedPhoto || approvedPhoto.status !== 'approved') {
      throw new Error('Photo status was not updated to approved');
    }
    console.log('✓ Photo moderated and approved by admin');

    // 8. Verify Public Feed Visibility after Approval
    console.log('\n[8] Verifying Public Feed Visibility (Approved photo must be visible)...');
    const publicPhotosAfter = await creatorService.getPublicPhotos();
    const foundInPublicAfter = publicPhotosAfter.photos.find((p) => p.id === photoPost.id);
    if (!foundInPublicAfter) {
      throw new Error('Approved photo not found in public feed');
    }

    const publicProfileAfter = await creatorService.getPublicCreatorProfile(creator.id);
    const foundInProfileAfter = publicProfileAfter?.photos.find((p) => p.id === photoPost.id);
    if (!foundInProfileAfter) {
      throw new Error('Approved photo not found in public creator profile');
    }
    console.log('✓ Verified: Approved photo is now visible in public feeds and profile');

    // 9. Re-moderation Check: Editing Approved Content must reset status to 'pending'
    console.log('\n[9] Testing Re-moderation upon content edit...');
    const editedPhoto = await creatorService.updateCreatorPhoto(approvedCreatorUser, photoPost.id, {
      title: 'صناعة الفخار القديمة في قنا - عنوان محدث'
    });
    if (!editedPhoto || editedPhoto.status !== 'pending') {
      throw new Error(`Expected edited photo status to be reset to 'pending', got '${editedPhoto?.status}'`);
    }

    // Verify it disappeared again from public feed
    const publicPhotosAfterEdit = await creatorService.getPublicPhotos();
    const foundAfterEdit = publicPhotosAfterEdit.photos.find((p) => p.id === photoPost.id);
    if (foundAfterEdit) {
      throw new Error('Security Breach: Edited photo with status pending visible in public feed!');
    }
    console.log('✓ Verified: Editing approved content automatically triggers re-moderation (status: pending)');

    // 10. Admin Rejection with Reason
    console.log('\n[10] Testing Admin Content Moderation (Rejection with reason)...');
    const rejectionReason = 'الصور بحاجة لمزيد من التفاصيل حول موقع الورشة';
    const rejectedPhoto = await creatorService.adminModeratePhoto(adminUser, photoPost.id, 'reject', rejectionReason);
    if (!rejectedPhoto || rejectedPhoto.status !== 'rejected') {
      throw new Error('Photo status was not updated to rejected');
    }
    if (rejectedPhoto.rejectionReason !== rejectionReason) {
      throw new Error('Rejection reason was not preserved correctly');
    }
    console.log('✓ Photo rejected with reason preserved:', rejectedPhoto.rejectionReason);

    // 11. Update Creator Profile
    console.log('\n[11] Testing Creator Profile Update...');
    const updatedProfile = await creatorService.updateCreatorProfile(approvedCreatorUser, {
      bio: 'نبذة محدثة: مصور وثائقي وموثق للتراث المصري الصعيدي الأصيل',
      specialties: ['heritage', 'crafts', 'festivals']
    });
    if (!updatedProfile || updatedProfile.specialties.length !== 3) {
      throw new Error('Creator profile update failed');
    }
    console.log('✓ Creator profile updated successfully');

    // Clean up
    console.log('\n[12] Cleaning up test data...');
    await db.collection('creator_photos').deleteOne({ id: photoPost.id });
    await db.collection('creators').deleteOne({ id: creator.id });
    await db.collection('users').deleteOne({ id: session.user.id });
    await db.collection('notifications').deleteMany({ recipientId: session.user.id });
    console.log('✓ Test data cleaned up cleanly');

    console.log('\n========================================');
    console.log('🎉 ALL 11 CREATOR INTEGRATION TESTS PASSED!');
    console.log('========================================\n');
  } catch (error) {
    console.error('❌ Integration Test Failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

runTests();
