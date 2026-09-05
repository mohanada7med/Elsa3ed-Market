import { hashPassword } from '../server/services/authService.ts';
import { getDatabase } from '../server/db/mongodb.ts';

async function main() {
  const { db } = await getDatabase();
  const hash = await hashPassword('099099099m');
  await db.collection('users').updateOne({ role: 'admin' }, { $set: { passwordHash: hash } });
  console.log('Admin password successfully set to Admin@123456');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
