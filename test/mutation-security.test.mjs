import test from "node:test";
import assert from "node:assert/strict";
import {
  isAllowedMutationOrigin,
  selectAuthenticatedUser,
} from "../src/lib/mutationSecurity.mjs";
import { getOwnedReceipt } from "../src/lib/receiptValidation.mjs";

test("Given cookie authentication and an exact configured Origin, When checking a mutation, Then it is allowed", () => {
  const allowed = isAllowedMutationOrigin({
    authMethod: "cookie",
    origin: "https://app.example.com",
    appOrigin: "https://app.example.com, https://staging.example.com",
  });

  assert.equal(allowed, true);
});

test("Given cookie authentication with no, null, malformed, or mismatched Origin, When checking a mutation, Then it is denied", () => {
  const appOrigin = "https://app.example.com";

  for (const origin of [null, "null", "not a url", "https://evil.example.com"]) {
    assert.equal(
      isAllowedMutationOrigin({ authMethod: "cookie", origin, appOrigin }),
      false,
    );
  }
});

test("Given a valid bearer user without Origin, When checking a mutation, Then bearer authentication is selected and allowed", () => {
  const bearerUser = { id: "bearer-user" };
  const identity = selectAuthenticatedUser(bearerUser, null);

  assert.deepEqual(identity, { authMethod: "bearer", user: bearerUser });
  assert.equal(
    isAllowedMutationOrigin({
      authMethod: identity.authMethod,
      origin: null,
      appOrigin: "https://app.example.com",
    }),
    true,
  );
});

test("Given valid bearer and cookie users, When selecting authentication, Then bearer takes precedence", () => {
  const bearerUser = { id: "bearer-user" };
  const cookieUser = { id: "cookie-user" };

  assert.deepEqual(selectAuthenticatedUser(bearerUser, cookieUser), {
    authMethod: "bearer",
    user: bearerUser,
  });
});

test("Given a dynamic-folder Cloudinary image with an expense-receipts public ID, When validating its owner, Then its canonical receipt data is accepted without an asset folder", () => {
  const asset = {
    context: { custom: { owner_id: "user-1" } },
    public_id: "expense-receipts/receipt-1",
    resource_type: "image",
    secure_url: "https://res.cloudinary.com/example/image/upload/expense-receipts/receipt-1.jpg",
    type: "upload",
  };

  assert.deepEqual(getOwnedReceipt(asset, "expense-receipts/receipt-1", "user-1"), {
    publicId: asset.public_id,
    secureUrl: asset.secure_url,
  });
});
