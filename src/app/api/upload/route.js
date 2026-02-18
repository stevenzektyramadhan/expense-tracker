import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { requireAuthenticatedUser } from "@/lib/supabaseServer";

const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const { errorResponse } = await requireAuthenticatedUser();
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

    if (!file.type?.startsWith("image/")) {
      return NextResponse.json({ error: "Only image uploads are allowed" }, { status: 400 });
    }

    if (typeof file.size === "number" && file.size > MAX_UPLOAD_SIZE_BYTES) {
      return NextResponse.json({ error: "File size exceeds 5MB" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "auto",
            folder: "expense-receipts", // Organize uploads in a folder
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
    return NextResponse.json({ error: "Upload failed", details: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { errorResponse } = await requireAuthenticatedUser();
    if (errorResponse) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { public_id } = await request.json();

    if (!public_id || typeof public_id !== "string") {
      return NextResponse.json({ error: "No public_id provided" }, { status: 400 });
    }

    // Delete from Cloudinary
    const deleteResponse = await cloudinary.uploader.destroy(public_id);

    return NextResponse.json({
      success: true,
      result: deleteResponse,
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Delete failed", details: error.message }, { status: 500 });
  }
}
