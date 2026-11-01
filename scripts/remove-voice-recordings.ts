import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import {
  cloudinaryStorage,
  extractCloudinaryPublicId,
  isCloudinaryAvailable
} from '../server/services/storage/cloudinaryProvider.ts';
import { storageService } from '../server/services/storage/storageProvider.ts';

dotenv.config();

const productFields = [
  'audioUrl',
  'transcript',
  'artisanName',
  'artisanPortrait',
  'artisanGovernorate',
  'artisanCraft',
  'audioDuration'
];
const sellerFields = ['introAudioUrl', 'introAudioDuration'];

type StoredVoiceRecord = Record<string, unknown>;

async function deleteRecordingAsset(value: unknown): Promise<boolean> {
  if (typeof value !== 'string' || !value || value.startsWith('data:')) return false;

  if (value.startsWith('WAH/')) {
    if (!isCloudinaryAvailable()) {
      throw new Error('Cloudinary غير متاح لحذف التسجيلات الصوتية المحفوظة.');
    }
    if (!await cloudinaryStorage.delete(value)) {
      throw new Error(`تعذر حذف ملف Cloudinary: ${value}`);
    }
    return true;
  }

  let url: URL;
  try {
    url = new URL(value, 'http://localhost');
  } catch {
    throw new Error('تعذر تحديد مسار أحد التسجيلات المحفوظة.');
  }

  if (url.hostname.endsWith('cloudinary.com')) {
    if (!isCloudinaryAvailable()) {
      throw new Error('Cloudinary غير متاح لحذف التسجيلات الصوتية المحفوظة.');
    }
    const publicId = extractCloudinaryPublicId(value);
    if (!publicId || !await cloudinaryStorage.delete(publicId)) {
      throw new Error('تعذر حذف أحد التسجيلات الصوتية من Cloudinary.');
    }
    return true;
  }

  const uploadsPrefix = '/uploads/';
  const uploadIndex = url.pathname.indexOf(uploadsPrefix);
  if (uploadIndex !== -1) {
    const fileKey = decodeURIComponent(url.pathname.slice(uploadIndex + uploadsPrefix.length));
    if (!await storageService.delete(fileKey)) {
      throw new Error(`تعذر حذف ملف التسجيل المحلي: ${fileKey}`);
    }
    return true;
  }

  throw new Error('يوجد تسجيل محفوظ بمسار تخزين غير مدعوم؛ لم يتم حذف بياناته.');
}

async function removeVoiceRecordings(): Promise<void> {
  if (!process.argv.includes('--confirm')) {
    throw new Error('الحذف نهائي. أعد التشغيل مع --confirm بعد مراجعة النطاق.');
  }

  const uri = (
    process.env.MONGODB_URI ||
    process.env.MONGODB_CONNECTION_URL ||
    process.env.MONGO_URI ||
    process.env.DATABASE_URL
  )?.trim();
  if (!uri) {
    throw new Error('رابط قاعدة بيانات MongoDB غير مضبوط؛ لم يتم حذف أي تسجيل.');
  }

  const uriDatabase = (() => {
    try {
      return decodeURIComponent(new URL(uri).pathname.slice(1));
    } catch {
      return '';
    }
  })();
  const databaseName = process.env.MONGODB_DB?.trim() || uriDatabase || 'Elsa3ed_market';
  const client = new MongoClient(uri, {
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000
  });

  await client.connect();
  const db = client.db(databaseName);
  try {
    await db.command({ ping: 1 });
    const productQuery = { $or: productFields.map((field) => ({ [field]: { $exists: true } })) };
    const sellerQuery = { $or: sellerFields.map((field) => ({ [field]: { $exists: true } })) };
    const products = await db.collection('products').find(productQuery).toArray() as StoredVoiceRecord[];
    const sellers = await db.collection('sellers').find(sellerQuery).toArray() as StoredVoiceRecord[];

    const recordingUrls = new Set<unknown>();
    for (const product of products) recordingUrls.add(product.audioUrl);
    for (const seller of sellers) recordingUrls.add(seller.introAudioUrl);

    let deletedFiles = 0;
    for (const url of recordingUrls) {
      if (await deleteRecordingAsset(url)) deletedFiles++;
    }

    const unsetProductFields = Object.fromEntries(productFields.map((field) => [field, '']));
    const unsetSellerFields = Object.fromEntries(sellerFields.map((field) => [field, '']));
    const [productResult, sellerResult] = await Promise.all([
      db.collection('products').updateMany(productQuery, { $unset: unsetProductFields }),
      db.collection('sellers').updateMany(sellerQuery, { $unset: unsetSellerFields })
    ]);

    console.log(
      `Removed voice-recording data from ${productResult.modifiedCount} products and ${sellerResult.modifiedCount} workshops; deleted ${deletedFiles} stored audio files.`
    );
  } finally {
    await client.close();
  }
}

removeVoiceRecordings().catch((error: unknown) => {
  console.error('Voice-recording cleanup failed:', error);
  process.exitCode = 1;
});
