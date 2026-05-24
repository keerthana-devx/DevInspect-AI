import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const SUPPORTED_TEXT_EXTS = new Set([
  '.txt',
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.py',
  '.java',
  '.c',
  '.cpp',
  '.cc',
  '.cs',
  '.go',
  '.rb',
  '.php',
  '.rs',
  '.kt',
  '.swift',
  '.sh',
  '.bash',
  '.html',
  '.css',
  '.scss',
  '.json',
  '.xml',
  '.yaml',
  '.yml',
  '.md',
  '.sql',
]);

/**
 * Extract plain text from uploaded files
 * Supports:
 * - Text / code files
 * - PDF
 * - DOCX
 */

export const extractFileContent = async (file) => {
  const {
    path: filePath,
    originalname,
    mimetype,
  } = file;

  const ext = path.extname(originalname).toLowerCase();

  try {
    // ─────────────────────────────────────────────
    // DOCX FILES
    // ─────────────────────────────────────────────
    if (
      ext === '.docx' ||
      mimetype ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = await mammoth.extractRawText({
        path: filePath,
      });

      const text = result.value?.trim();

      if (!text) {
        throw new Error(
          'DOCX file appears to be empty or unreadable.'
        );
      }

      return text;
    }

    // ─────────────────────────────────────────────
    // LEGACY DOC FILES
    // ─────────────────────────────────────────────
    if (
      ext === '.doc' ||
      mimetype === 'application/msword'
    ) {
      throw new Error(
        'Legacy .doc format is not supported. Please convert to .docx.'
      );
    }

    // ─────────────────────────────────────────────
    // PDF FILES
    // ─────────────────────────────────────────────
    if (
      ext === '.pdf' ||
      mimetype === 'application/pdf'
    ) {
      const buffer = fs.readFileSync(filePath);

      const result = await pdfParse(buffer);

      const text = result.text?.trim();

      if (!text) {
        throw new Error(
          'PDF appears empty or contains only images.'
        );
      }

      return text;
    }

    // ─────────────────────────────────────────────
    // TEXT / CODE FILES
    // ─────────────────────────────────────────────
    if (
      SUPPORTED_TEXT_EXTS.has(ext) ||
      mimetype.startsWith('text/')
    ) {
      const text = fs
        .readFileSync(filePath, 'utf-8')
        .trim();

      if (!text) {
        throw new Error('File is empty.');
      }

      return text;
    }

    // ─────────────────────────────────────────────
    // UNSUPPORTED FILE
    // ─────────────────────────────────────────────
    throw new Error(
      `Unsupported file format "${ext || mimetype}".`
    );
  } finally {
    // Cleanup uploaded temp file
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error(
        'Failed to cleanup temp file:',
        err.message
      );
    }
  }
};