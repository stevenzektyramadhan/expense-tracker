import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { v2 as cloudinary } from "cloudinary";
import { requireAuthenticatedUser } from "@/lib/supabaseServer";
import prisma from "@/lib/prisma";

const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const detectImageType = (buffer) => {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
};

export async function POST(request) {
  try {
    const { user, errorResponse } = await requireAuthenticatedUser(request);
    if (errorResponse) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ error: "Invalid file payload" }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, and WebP uploads are allowed" }, { status: 400 });
    }

    if (typeof file.size === "number" && file.size > MAX_UPLOAD_SIZE_BYTES) {
      return NextResponse.json({ error: "File size exceeds 5MB" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.length > MAX_UPLOAD_SIZE_BYTES) {
      return NextResponse.json({ error: "File size exceeds 5MB" }, { status: 400 });
    }

    const detectedType = detectImageType(buffer);
    if (!detectedType || detectedType !== file.type) {
      return NextResponse.json({ error: "Invalid image file" }, { status: 400 });
    }

    // Upload to Cloudinary
    const uploadResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            folder: "expense-receipts", // Organize uploads in a folder
            public_id: randomUUID(),
            context: {
              owner_id: user.id,
            },
            format: "jpg", // Convert to JPG for consistency
            quality: "auto:good", // Optimize file size
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        )
        .end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { user, errorResponse } = await requireAuthenticatedUser(request);
    if (errorResponse) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { expense_id } = await request.json();

    if (!expense_id || typeof expense_id !== "string") {
      return NextResponse.json({ error: "expense_id is required" }, { status: 400 });
    }

    const expense = await prisma.expenses.findFirst({
      where: {
        id: expense_id,
        user_id: user.id,
      },
    });

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        error: "Receipt deletion requires stored Cloudinary public_id ownership mapping before it can be enabled safely.",
      },
      { status: 501 }
    );
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
