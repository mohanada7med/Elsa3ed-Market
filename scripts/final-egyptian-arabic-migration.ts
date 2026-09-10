import dotenv from 'dotenv';
dotenv.config();
import { MongoClient } from 'mongodb';
import { PLATFORM_CATEGORIES } from '../server/config/platformCategories.ts';

async function runFinalMigration() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'Elsa3ed_market';
  if (!uri) {
    console.error('Missing MONGODB_URI');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  console.log('Connected to MongoDB for final colloquial Arabic migration...');

  // 1. Update SELLERS
  console.log('Updating sellers collection...');
  const sellersRes = await db.collection('sellers').updateMany(
    {},
    {
      $set: {
        bio: 'ورشة متخصصة في عمل المشغولات الصعيدية والتراثية على أصولها في محافظة أسيوط.',
        story: 'بدأنا بصنعة أجدادنا وورثناها جيل ورا جيل عشان نوصلكم أحسن وأجدع ما طلع من إيدين شيوخ الصنعة في الصعيد.',
        badge: 'صنايعي معتمد',
        specialty: 'مشغولات وحرف صعيدية على أصولها',
        updatedAt: new Date().toISOString()
      }
    }
  );
  console.log(`✅ Updated ${sellersRes.modifiedCount} sellers.`);

  // 2. Update PAYMENT CONFIGS
  console.log('Updating payment_configs collection...');
  const payRes = await db.collection('payment_configs').updateMany(
    {},
    {
      $set: {
        instaPayInstructions: 'حوّل من تطبيق إنستاباي لعنوان الدفع المكتوب فوق، وبعد ما تخلص دوس على "تم التحويل".',
        vodafoneCashInstructions: 'حوّل المبلغ لرقم فودافون كاش المكتوب فوق، وبعد ما تخلص دوس على "تم التحويل".',
        updatedAt: new Date().toISOString()
      }
    }
  );
  console.log(`✅ Updated ${payRes.modifiedCount} payment_configs.`);

  // 3. Update CATEGORIES
  console.log('Updating categories collection...');
  for (const cat of PLATFORM_CATEGORIES) {
    await db.collection('categories').updateOne(
      { id: cat.id },
      {
        $set: {
          name: cat.name,
          description: cat.description,
          heritageNote: cat.heritageNote,
          active: true
        }
      }
    );
  }
  console.log(`✅ Updated ${PLATFORM_CATEGORIES.length} categories.`);

  // 4. Update VILLAGES (refine formal phrasing)
  console.log('Refining villages with 100% natural Egyptian colloquial...');
  await db.collection('wah_villages').updateOne(
    { id: 'village-gurna' },
    {
      $set: {
        description: 'قاعدة في البر الغربي للأقصر في حضن جبل الفراعنة، مشهورة بورش نحت الألباستر اليدوية وقرية حسن فتحي اللي بناها بالطين والقباب على أصول العمارة البيئية.',
        updatedAt: new Date().toISOString()
      }
    }
  );
  await db.collection('wah_villages').updateOne(
    { id: 'village-qasr-islamic' },
    {
      $set: {
        description: 'قرية ومدينة إسلامية مبنية كلها بالطوب اللبن وجذوع النخل في قلب واحة الداخلة من القرون الوسطى، معمولة بهندسة عبقرية بترطب الجو وبتقهر حر الصحراء.',
        updatedAt: new Date().toISOString()
      }
    }
  );
  console.log('✅ Refined villages.');

  // 5. Update PLATFORM SETTINGS
  console.log('Updating platform_settings...');
  await db.collection('platform_settings').updateMany(
    {},
    {
      $set: {
        siteName: 'وه | WAH — العالم الرقمي لصعيد مصر',
        siteTagline: 'منصة الصعيد الأولى — بنوثق التراث وبنقربك من حكاياته وناسه وحرفه الأصيلة',
        heroHeadline: 'أصالة الصعيد بين إيديك',
        heroSubheadline: 'من قلب صعيد مصر للعالم كله؛ بنحكي قصص البلاد والناس وبندعم أصحاب الصنعة الحقيقيين',
        updatedAt: new Date().toISOString()
      }
    }
  );
  console.log('✅ Updated platform settings.');

  await client.close();
  console.log('🎉 Final colloquial Arabic migration completed successfully!');
}

runFinalMigration().catch(err => {
  console.error(err);
  process.exit(1);
});
