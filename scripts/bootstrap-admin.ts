import dotenv from 'dotenv';
dotenv.config();
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import readline from 'readline';

/**
 * Secure Production Bootstrap Script: Initialize First Platform Administrator
 *
 * Requirements:
 * - Can be configured via environment variables:
 *   INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_PASSWORD, INITIAL_ADMIN_NAME, INITIAL_ADMIN_PHONE, INITIAL_ADMIN_GOVERNORATE
 * - Or prompts securely in an interactive terminal.
 * - Does NOT hardcode passwords in source code.
 * - Enforces bcrypt password hashing (cost 12).
 * - Verifies uniqueness to avoid duplicate admin accounts.
 */

function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    })
  );
}

async function bootstrapAdmin() {
  const uri = process.env.MONGODB_URI?.trim();
  const dbName = process.env.MONGODB_DB?.trim() || 'Elsa3ed_market';
  const nodeEnv = process.env.NODE_ENV || 'development';

  console.log('====================================================');
  console.log('🔐 Elsa3ed Market — Production Admin Bootstrap');
  console.log('====================================================');
  console.log(`Database: [${dbName}]`);
  console.log(`Environment: [${nodeEnv}]`);

  if (!uri) {
    console.error('⛔ FATAL: MONGODB_URI environment variable is required.');
    process.exit(1);
  }

  let username = process.env.INITIAL_ADMIN_USERNAME?.trim() || 'مدير_المنصة';
  let email = process.env.INITIAL_ADMIN_EMAIL?.trim();
  let password = process.env.INITIAL_ADMIN_PASSWORD?.trim();
  let name = process.env.INITIAL_ADMIN_NAME?.trim() || 'مدير منصة سوق الصعيد';
  let phone = process.env.INITIAL_ADMIN_PHONE?.trim() || '01000000000';
  let governorate = process.env.INITIAL_ADMIN_GOVERNORATE?.trim() || 'قنا';

  // If running interactively and variables are missing, prompt the operator
  if (!username && process.stdin.isTTY) {
    username = await askQuestion('Enter Admin Username (e.g., مدير_المنصة or admin): ');
  }
  if (!password && process.stdin.isTTY) {
    password = await askQuestion('Enter Admin Password (min 8 chars): ');
  }

  if (!username || username.length < 2) {
    console.error('⛔ FATAL: INITIAL_ADMIN_USERNAME must be at least 2 characters.');
    process.exit(1);
  }

  if (!password || password.length < 8) {
    console.error('⛔ FATAL: INITIAL_ADMIN_PASSWORD must be at least 8 characters long.');
    process.exit(1);
  }

  const client = new MongoClient(uri, {
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000,
  });

  try {
    await client.connect();
    const db = client.db(dbName);
    console.log('✅ Connected to MongoDB cluster.\n');

    const usernameNormalized = username.trim().normalize('NFKC').toLowerCase().replace(/\s+/g, ' ');

    // Check if an admin already exists with this username or email
    const queryConditions: any[] = [{ usernameNormalized }];
    if (email) {
      queryConditions.push({ email: email.toLowerCase() });
    }

    const existing = await db.collection('users').findOne({ $or: queryConditions });
    if (existing) {
      if (existing.role === 'admin') {
        console.log(`ℹ️ Admin account [${existing.username || existing.email}] already exists. No action required.`);
      } else {
        console.error(`⛔ A user with username [${username}] already exists with role "${existing.role}". Cannot overwrite.`);
        process.exit(1);
      }
      return;
    }

    console.log(`Creating initial administrator [@${username}]...`);
    const passwordHash = await bcrypt.hash(password, 12);
    const adminUser = {
      id: `admin-${Date.now()}`,
      username: username.trim(),
      usernameNormalized,
      name,
      email: email ? email.toLowerCase() : undefined,
      passwordHash,
      phone,
      role: 'admin',
      governorate,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      savedAddresses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.collection('users').insertOne(adminUser);
    console.log(`✅ Platform administrator [@${username}] created successfully.`);
    console.log('====================================================');
    console.log('🎉 Bootstrap completed. You may now log in using this username.');
    console.log('====================================================');
  } catch (err: any) {
    console.error('❌ Bootstrap failed:', err.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

bootstrapAdmin();
