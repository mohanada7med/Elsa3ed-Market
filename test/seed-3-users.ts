import dotenv from 'dotenv';
dotenv.config();
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

async function seedThreeUsers() {
  console.log('====================================================');
  console.log('👥 إعداد وضبط 3 مستخدمين أساسيين في سوق الصعيد');
  console.log('====================================================');

  const uri = process.env.MONGODB_URI?.trim();
  const dbName = process.env.MONGODB_DB?.trim() || 'Elsa3ed_market';

  if (!uri) {
    console.error('⛔ MONGODB_URI غير محدد في ملف .env');
    process.exit(1);
  }

  const client = new MongoClient(uri, {
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000,
  });

  try {
    await client.connect();
    const db = client.db(dbName);
    await db.command({ ping: 1 });
    console.log(`✅ متصل بقاعدة البيانات: [${dbName}]`);

    // 1. حذف جميع المستخدمين القدامى تماماً
    const deleteResult = await db.collection('users').deleteMany({});
    console.log(`🗑️ تم مسح كافة المستخدمين السابقين: ${deleteResult.deletedCount} مستخدم.`);

    // 2. تشفير كلمة المرور الموحدة Sa3ed@2025
    const password = 'Sa3ed@2025';
    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    // 3. المستخدمون الثلاثة المطلوبون (مدير، مشتري، بائع)
    const threeUsers = [
      // 1. مدير المنصة (Admin)
      {
        id: 'user-admin-1',
        name: 'مهند احمد (مدير المنصة)',
        email: 'admin@elsa3ed.eg',
        passwordHash,
        phone: '01158969931',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
        governorate: 'قنا',
        profileImage: null,
        savedAddresses: [],
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: now
      },

      // 2. المشتري (Buyer)
      {
        id: 'user-buyer-1',
        name: 'أحمد محمود الهاشمي',
        email: 'ahmed.hashmi@gmail.com',
        passwordHash,
        phone: '01019882233',
        role: 'buyer',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        governorate: 'القاهرة',
        profileImage: null,
        savedAddresses: [
          {
            fullName: 'أحمد محمود الهاشمي',
            phone: '01019882233',
            governorate: 'القاهرة',
            city: 'المعادي',
            streetAddress: 'شارع 9 - دجلة، عمارة 12، شقة 4',
            buildingNo: 'عمارة 12',
            notes: 'التوصيل مساءً',
            isDefault: true
          }
        ],
        createdAt: '2023-09-01T00:00:00.000Z',
        updatedAt: now
      },

      // 3. البائع الحرفي (Seller)
      {
        id: 'user-seller-1',
        name: 'الأسطى سعيد القناوي',
        email: 'saeed.pottery@elsa3ed.eg',
        passwordHash,
        phone: '01012345678',
        role: 'seller',
        sellerId: 'seller-1',
        sellerStatus: 'approved',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        governorate: 'قنا',
        profileImage: null,
        savedAddresses: [],
        createdAt: '2023-01-15T00:00:00.000Z',
        updatedAt: now
      }
    ];

    // 4. إدراج المستخدمين الثلاثة في MongoDB
    await db.collection('users').insertMany(threeUsers as any[]);
    console.log('✅ تم تسجيل المستخدمين الثلاثة بنجاح:');
    console.log('   1. مدير المنصة (Admin):  admin@elsa3ed.eg       (كلمة السر: Sa3ed@2025)');
    console.log('   2. المشتري (Buyer):       ahmed.hashmi@gmail.com (كلمة السر: Sa3ed@2025)');
    console.log('   3. البائع الحرفي (Seller): saeed.pottery@elsa3ed.eg(كلمة السر: Sa3ed@2025)');

    // 5. ضبط وتحديث ورشة البائع في جدول الورش (sellers)
    const sellerDoc = {
      id: 'seller-1',
      userId: 'user-seller-1',
      name: 'الأسطى سعيد القناوي',
      brandName: 'ورشة عم سعيد الفخاري',
      phone: '01012345678',
      email: 'saeed.pottery@elsa3ed.eg',
      governorate: 'قنا',
      city: 'قنا القديمة',
      specialty: 'فخار قناوي وأواني فخارية تراثية',
      bio: 'عائلة تتوارث صناعة الفخار القناوي والخزف اليدوي منذ أكثر من 70 عاماً في قنا.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      status: 'approved',
      verified: true,
      rating: 4.9,
      reviewCount: 48,
      salesCount: 156,
      joinedDate: '2023-01-15',
      updatedAt: now
    };

    await db.collection('sellers').deleteMany({});
    await db.collection('sellers').insertOne(sellerDoc as any);
    console.log('✅ تم تهيئة وتثبيت ورشة البائع (seller-1) بحالة معتمدة (approved).');

    // 6. التأكد من فهارس الحماية الفريدة
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ id: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1 });

    const totalUsers = await db.collection('users').countDocuments();
    console.log(`\n📊 العدد الإجمالي للمستخدمين في قاعدة البيانات الآن: ${totalUsers}`);
    console.log('====================================================');
    console.log('🎉 تم الانتهاء بنجاح!');
    console.log('====================================================');
  } catch (error) {
    console.error('❌ حدث خطأ:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seedThreeUsers();
