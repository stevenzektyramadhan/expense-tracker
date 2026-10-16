const RECEIPT_PUBLIC_ID_PREFIX = "expense-receipts/";

export function getOwnedReceipt(asset, publicId, userId) {
  if (
    asset.resource_type !== "image" ||
    asset.type !== "upload" ||
    asset.public_id !== publicId ||
    !asset.public_id?.startsWith(RECEIPT_PUBLIC_ID_PREFIX) ||
    asset.context?.custom?.owner_id !== userId ||
    !asset.secure_url
  ) {
    return null;
  }

  return { publicId: asset.public_id, secureUrl: asset.secure_url };
}
