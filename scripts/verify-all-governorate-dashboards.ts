async function main() {
  const governorateSlugs = [
    'bani-suef',
    'minya',
    'asyut',
    'sohag',
    'qena',
    'luxor',
    'aswan',
    'new-valley'
  ];

  console.log('🔍 Testing Live Governorate Dashboard APIs on http://localhost:3000 ...\n');

  for (const slug of governorateSlugs) {
    try {
      const res = await fetch(`http://localhost:3000/api/wah/governorates/${slug}/dashboard`);
      if (!res.ok) {
        console.error(`❌ [${slug}] Failed with status ${res.status}: ${res.statusText}`);
        continue;
      }
      const json = await res.json();
      if (!json.success || !json.data) {
        console.error(`❌ [${slug}] Invalid API response:`, json);
        continue;
      }

      const stats = json.data;
      const gov = stats.governorate;
      console.log(`🏛️  ${gov.name} — "${gov.nickname || ''}"`);
      console.log(`    - الأماكن والمعالم التراثية: ${stats.placesCount} (مواقع تاريخية: ${stats.heritageSitesCount})`);
      console.log(`    - الحرف التراثية الموثقة: ${stats.craftsCount}`);
      console.log(`    - الأكلات والوصفات التقليدية: ${stats.foodsCount}`);
      console.log(`    - الشخصيات وشيوخ الصنعة: ${stats.peopleCount} (حرفيون نشطون: ${stats.artisansCount})`);
      console.log(`    - القصص وحكايات التراث: ${stats.storiesCount}`);
      console.log(`    - الفعاليات والمهرجانات: ${stats.eventsCount}`);
      console.log(`    - المواسم التراثية والزراعية: ${stats.seasonsCount}`);
      console.log(`    - المراكز والمدن: ${stats.citiesCount}`);
      console.log(`    - القرى التراثية المعتمدة: ${stats.villagesCount}`);
      console.log(`    - بانتظار المراجعة: ${stats.pendingReviewCount}`);
      console.log('----------------------------------------------------');
    } catch (err: any) {
      console.error(`❌ [${slug}] Fetch error:`, err.message);
    }
  }
}

main();
