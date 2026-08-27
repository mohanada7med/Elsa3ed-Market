/**
 * Cloudinary Module for Elsa3ed Market
 * Server-only utility wrapping the official Cloudinary Node.js SDK.
 * All credentials are strictly read from server environment variables (CLOUDINARY_URL).
 */
export { cloudinaryStorage } from './cloudinaryProvider.ts';
export { v2 as cloudinary } from 'cloudinary';