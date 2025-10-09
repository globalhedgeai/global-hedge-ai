import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configure S3 client for Cloudflare R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'global-hedge-ai-uploads';

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

export interface FileUploadOptions {
  folder?: string;
  generateUniqueName?: boolean;
  allowedTypes?: string[];
  maxSize?: number; // in bytes
}

export class CloudStorageService {
  /**
   * Upload a file to Cloudflare R2
   */
  static async uploadFile(
    file: File | Buffer,
    fileName: string,
    options: FileUploadOptions = {}
  ): Promise<UploadResult> {
    try {
      const {
        folder = 'uploads',
        generateUniqueName = true,
        allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
        maxSize = 10 * 1024 * 1024, // 10MB default
      } = options;

      // Validate file type
      if (file instanceof File) {
        if (!allowedTypes.includes(file.type)) {
          return {
            success: false,
            error: `File type ${file.type} is not allowed`,
          };
        }

        // Validate file size
        if (file.size > maxSize) {
          return {
            success: false,
            error: `File size ${file.size} exceeds maximum allowed size ${maxSize}`,
          };
        }
      }

      // Generate unique filename if requested
      let finalFileName = fileName;
      if (generateUniqueName) {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const extension = fileName.split('.').pop();
        finalFileName = `${timestamp}-${randomString}.${extension}`;
      }

      // Create the key (path) for the file
      const key = `${folder}/${finalFileName}`;

      // Convert File to Buffer if needed
      let fileBuffer: Buffer;
      if (file instanceof File) {
        const arrayBuffer = await file.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuffer);
      } else {
        fileBuffer = file;
      }

      // Upload to R2
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: file instanceof File ? file.type : 'application/octet-stream',
        Metadata: {
          uploadedAt: new Date().toISOString(),
          originalName: fileName,
        },
      });

      await s3Client.send(command);

      // Generate public URL
      const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

      return {
        success: true,
        url: publicUrl,
        key: key,
      };
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown upload error',
      };
    }
  }

  /**
   * Delete a file from Cloudflare R2
   */
  static async deleteFile(key: string): Promise<{ success: boolean; error?: string }> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      await s3Client.send(command);

      return { success: true };
    } catch (error) {
      console.error('Delete error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown delete error',
      };
    }
  }

  /**
   * Generate a presigned URL for temporary access
   */
  static async generatePresignedUrl(
    key: string,
    expiresIn: number = 3600 // 1 hour default
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      const url = await getSignedUrl(s3Client, command, { expiresIn });

      return {
        success: true,
        url: url,
      };
    } catch (error) {
      console.error('Presigned URL error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Extract key from URL
   */
  static extractKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      
      // Remove leading slash and extract key
      const key = pathname.startsWith('/') ? pathname.slice(1) : pathname;
      
      return key || null;
    } catch {
      return null;
    }
  }

  /**
   * Validate file before upload
   */
  static validateFile(file: File, options: FileUploadOptions = {}): { valid: boolean; error?: string } {
    const {
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
      maxSize = 10 * 1024 * 1024, // 10MB default
    } = options;

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      };
    }

    // Check file size
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size ${(maxSize / 1024 / 1024).toFixed(2)}MB`,
      };
    }

    return { valid: true };
  }
}

export default CloudStorageService;
