"use client";

// Hallmark · unified expense form state · Calm Ledger · one mutation owner
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import toast from "react-hot-toast";
import { authenticatedFetch } from "@/lib/authenticatedFetch";
import { DEFAULT_EXPENSE_CATEGORIES } from "@/lib/finance";
import { parseRupiah } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";

const RECEIPT_MAX_SIZE_BYTES = 15 * 1024 * 1024;

const SUBMISSION_ERROR_TITLES = {
  authentication: "Sesi perlu diperbarui",
  upload: "Struk belum dapat diunggah",
  creation: "Pengeluaran belum tersimpan",
  missingAllowance: "Uang saku belum tersedia",
  insufficientBalance: "Sisa uang saku tidak cukup",
};

class ExpenseSubmissionError extends Error {
  constructor(kind, message) {
    super(message);
    this.name = "ExpenseSubmissionError";
    this.kind = kind;
  }
}

export function getLocalDateInputValue(referenceDate = new Date()) {
  const year = referenceDate.getFullYear();
  const month = String(referenceDate.getMonth() + 1).padStart(2, "0");
  const day = String(referenceDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function resolveExpenseCategory(categoryState) {
  if (categoryState.choice === "Lainnya") {
    return categoryState.custom.trim() || "Lainnya";
  }

  return categoryState.choice;
}

function createInitialValues() {
  return {
    amount: "",
    category: {
      choice: "Makanan",
      custom: "",
    },
    date: getLocalDateInputValue(),
    description: "",
  };
}

function getSessionIdentity(session) {
  if (!session?.user?.id) return null;

  return [
    session.user.id,
    session.user.last_sign_in_at || "signed-in",
    session.expires_at || "no-expiry",
  ].join(":");
}

function isAuthenticationMessage(message) {
  return /sesi login|login ulang|unauthorized|jwt|token/i.test(message || "");
}

function getSubmissionError(error, phase) {
  if (error instanceof ExpenseSubmissionError) return error;

  if (isAuthenticationMessage(error?.message)) {
    return new ExpenseSubmissionError(
      "authentication",
      "Sesi Anda berakhir. Masuk kembali lalu coba lagi.",
    );
  }

  if (phase === "uploading") {
    return new ExpenseSubmissionError(
      "upload",
      "Struk gagal diunggah. Periksa koneksi dan coba lagi.",
    );
  }

  return new ExpenseSubmissionError(
    "creation",
    "Pengeluaran belum dapat disimpan. Coba lagi.",
  );
}

async function compressReceipt(file) {
  try {
    const compressedFile = await imageCompression(file, {
      maxSizeMB: 0.6,
      maxWidthOrHeight: 1600,
      useWebWorker: true,
      initialQuality: 0.8,
      fileType: "image/jpeg",
    });

    return {
      file: compressedFile.size < file.size ? compressedFile : file,
      warning: null,
    };
  } catch (error) {
    console.warn("Receipt compression failed, using original file", error);
    return {
      file,
      warning:
        "Foto tidak dapat dikompres. File asli akan diunggah dan tetap diperiksa oleh server.",
    };
  }
}

async function uploadReceipt(file) {
  const uploadData = new FormData();
  uploadData.append("file", file);

  const response = await authenticatedFetch("/api/upload", {
    method: "POST",
    body: uploadData,
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      throw new ExpenseSubmissionError(
        "authentication",
        "Sesi Anda berakhir. Masuk kembali lalu coba lagi.",
      );
    }

    if (/file size exceeds 5mb/i.test(payload.error || "")) {
      throw new ExpenseSubmissionError(
        "upload",
        "Struk masih melebihi batas unggah setelah diproses. Pilih gambar yang lebih kecil.",
      );
    }

    if (/only jpeg|invalid image file/i.test(payload.error || "")) {
      throw new ExpenseSubmissionError(
        "upload",
        "Format struk tidak lolos pemeriksaan server. Gunakan gambar JPEG, PNG, atau WebP.",
      );
    }

    throw new ExpenseSubmissionError(
      "upload",
      "Struk gagal diunggah. Periksa koneksi dan coba lagi.",
    );
  }

  if (!payload.url) {
    throw new ExpenseSubmissionError(
      "upload",
      "Struk gagal diunggah. Coba lagi.",
    );
  }

  return payload.url;
}

async function createExpense(payload) {
  const response = await authenticatedFetch("/api/expenses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));

  if (response.ok) return result;

  if (response.status === 401) {
    throw new ExpenseSubmissionError(
      "authentication",
      "Sesi Anda berakhir. Masuk kembali lalu coba lagi.",
    );
  }

  if (/allowance bulan ini belum dibuat/i.test(result.error || "")) {
    throw new ExpenseSubmissionError(
      "missingAllowance",
      "Uang saku bulan ini belum dibuat. Atur uang saku sebelum menyimpan pengeluaran.",
    );
  }

  if (/saldo tidak cukup/i.test(result.error || "")) {
    throw new ExpenseSubmissionError(
      "insufficientBalance",
      "Sisa uang saku tidak cukup untuk pengeluaran ini.",
    );
  }

  throw new ExpenseSubmissionError(
    "creation",
    "Pengeluaran belum dapat disimpan. Coba lagi.",
  );
}

function createPayloadSignature(values, resolvedCategory) {
  return JSON.stringify({
    amount: Number(values.amount),
    category: resolvedCategory,
    date: values.date,
    description: values.description,
  });
}

export default function useExpenseForm() {
  const router = useRouter();
  const [values, setValues] = useState(createInitialValues);
  const [receipt, setReceipt] = useState(null);
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [requestError, setRequestError] = useState(null);
  const [compressionWarning, setCompressionWarning] = useState("");
  const [submitPhase, setSubmitPhase] = useState("idle");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [focusTarget, setFocusTarget] = useState(null);

  const amountRef = useRef(null);
  const categoryRef = useRef(null);
  const dateRef = useRef(null);
  const mountedRef = useRef(true);
  const submissionLockRef = useRef(false);
  const sessionIdentityRef = useRef(undefined);
  const uploadedReceiptCacheRef = useRef(null);

  const resolvedCategory = resolveExpenseCategory(values.category);
  const isSubmitting = submitPhase !== "idle";

  const invalidateUploadedReceiptCache = useCallback(() => {
    uploadedReceiptCacheRef.current = null;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!receipt) {
      setReceiptPreviewUrl(null);
      return undefined;
    }

    const objectUrl = URL.createObjectURL(receipt);
    setReceiptPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [receipt]);

  useEffect(() => {
    let isActive = true;

    const applySession = (session) => {
      if (!isActive) return;

      const nextIdentity = getSessionIdentity(session);
      const previousIdentity = sessionIdentityRef.current;

      if (
        previousIdentity !== undefined &&
        previousIdentity !== nextIdentity
      ) {
        invalidateUploadedReceiptCache();
      }

      sessionIdentityRef.current = nextIdentity;
    };

    supabase.auth
      .getSession()
      .then(({ data }) => applySession(data.session))
      .catch(() => applySession(null));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [invalidateUploadedReceiptCache]);

  useEffect(() => {
    if (!focusTarget) return;

    if (focusTarget === "date" && !detailsOpen) return;

    const refs = {
      amount: amountRef,
      category: categoryRef,
      date: dateRef,
    };
    refs[focusTarget]?.current?.focus();
    setFocusTarget(null);
  }, [detailsOpen, focusTarget]);

  const clearRetryStateForChangedPayload = () => {
    invalidateUploadedReceiptCache();
    setRequestError(null);
  };

  const handleAmountChange = (event) => {
    const numericValue = parseRupiah(event.target.value);
    clearRetryStateForChangedPayload();
    setValues((current) => ({
      ...current,
      amount: numericValue || "",
    }));
    setFieldErrors((current) => ({ ...current, amount: undefined }));
  };

  const handleCategoryChoiceChange = (choice) => {
    clearRetryStateForChangedPayload();
    setValues((current) => ({
      ...current,
      category: {
        ...current.category,
        choice,
      },
    }));
    setFieldErrors((current) => ({ ...current, category: undefined }));
  };

  const handleCustomCategoryChange = (custom) => {
    clearRetryStateForChangedPayload();
    setValues((current) => ({
      ...current,
      category: {
        ...current.category,
        custom,
      },
    }));
    setFieldErrors((current) => ({ ...current, category: undefined }));
  };

  const handleDateChange = (event) => {
    clearRetryStateForChangedPayload();
    setValues((current) => ({ ...current, date: event.target.value }));
    setFieldErrors((current) => ({ ...current, date: undefined }));
  };

  const handleDescriptionChange = (event) => {
    clearRetryStateForChangedPayload();
    setValues((current) => ({
      ...current,
      description: event.target.value,
    }));
  };

  const handleReceiptSelect = (file) => {
    invalidateUploadedReceiptCache();
    setRequestError(null);
    setCompressionWarning("");

    if (!file?.type?.startsWith("image/")) {
      setReceipt(null);
      setFieldErrors((current) => ({
        ...current,
        receipt: "File struk harus berupa gambar.",
      }));
      return false;
    }

    if (
      typeof file.size === "number" &&
      file.size > RECEIPT_MAX_SIZE_BYTES
    ) {
      setReceipt(null);
      setFieldErrors((current) => ({
        ...current,
        receipt: "Ukuran file struk maksimal 15 MB.",
      }));
      return false;
    }

    setReceipt(file);
    setFieldErrors((current) => ({ ...current, receipt: undefined }));
    return true;
  };

  const handleReceiptRemove = () => {
    invalidateUploadedReceiptCache();
    setReceipt(null);
    setCompressionWarning("");
    setRequestError(null);
    setFieldErrors((current) => ({ ...current, receipt: undefined }));
  };

  const validate = () => {
    const errors = {};
    const amount = Number(values.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      errors.amount = "Masukkan jumlah pengeluaran lebih dari Rp 0.";
    }

    if (
      !DEFAULT_EXPENSE_CATEGORIES.includes(values.category.choice) ||
      !resolvedCategory
    ) {
      errors.category = "Pilih kategori pengeluaran.";
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(values.date)) {
      errors.date = "Pilih tanggal pengeluaran.";
    }

    setFieldErrors((current) => ({
      ...current,
      amount: errors.amount,
      category: errors.category,
      date: errors.date,
    }));

    const firstInvalidField = ["amount", "category", "date"].find(
      (field) => errors[field],
    );

    if (firstInvalidField === "date") {
      setDetailsOpen(true);
    }

    if (firstInvalidField) {
      setFocusTarget(firstInvalidField);
    }

    return Object.keys(errors).length === 0;
  };

  const readSessionIdentity = async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      throw new ExpenseSubmissionError(
        "authentication",
        "Sesi Anda berakhir. Masuk kembali lalu coba lagi.",
      );
    }

    const identity = getSessionIdentity(session);
    const previousIdentity = sessionIdentityRef.current;

    if (previousIdentity !== undefined && previousIdentity !== identity) {
      invalidateUploadedReceiptCache();
    }

    sessionIdentityRef.current = identity;
    return identity;
  };

  const resetForm = () => {
    invalidateUploadedReceiptCache();
    setValues(createInitialValues());
    setReceipt(null);
    setFieldErrors({});
    setRequestError(null);
    setCompressionWarning("");
    setDetailsOpen(false);
    setFocusTarget(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submissionLockRef.current) return;

    setRequestError(null);

    if (!validate()) return;

    submissionLockRef.current = true;
    let currentPhase = "preparing";
    let payloadSignature = "";
    let sessionIdentity = null;

    try {
      sessionIdentity = await readSessionIdentity();
      payloadSignature = createPayloadSignature(values, resolvedCategory);
      let receiptUrl = null;

      if (receipt) {
        const cachedUpload = uploadedReceiptCacheRef.current;
        const canReuseUploadedReceipt =
          cachedUpload?.retryable === true &&
          cachedUpload.file === receipt &&
          cachedUpload.sessionIdentity === sessionIdentity &&
          cachedUpload.payloadSignature === payloadSignature;

        if (canReuseUploadedReceipt) {
          receiptUrl = cachedUpload.url;
          cachedUpload.retryable = false;
        } else {
          invalidateUploadedReceiptCache();
          currentPhase = "compressing";
          setSubmitPhase("compressing");
          const compressionResult = await compressReceipt(receipt);

          if (mountedRef.current) {
            setCompressionWarning(compressionResult.warning || "");
          }

          currentPhase = "uploading";
          setSubmitPhase("uploading");
          receiptUrl = await uploadReceipt(compressionResult.file);
          uploadedReceiptCacheRef.current = {
            file: receipt,
            payloadSignature,
            retryable: false,
            sessionIdentity,
            url: receiptUrl,
          };
        }
      }

      currentPhase = "creating";
      setSubmitPhase("creating");
      await createExpense({
        amount: Number(values.amount),
        category: resolvedCategory,
        date: values.date,
        description: values.description,
        receipt_url: receiptUrl,
      });

      invalidateUploadedReceiptCache();
      resetForm();
      toast.success("Pengeluaran berhasil disimpan!");
      router.push("/");
    } catch (error) {
      const submissionError = getSubmissionError(error, currentPhase);
      const cachedUpload = uploadedReceiptCacheRef.current;

      if (
        currentPhase === "creating" &&
        cachedUpload?.file === receipt &&
        cachedUpload.sessionIdentity === sessionIdentity &&
        cachedUpload.payloadSignature === payloadSignature
      ) {
        cachedUpload.retryable = true;
      }

      if (mountedRef.current) {
        setRequestError({
          kind: submissionError.kind,
          message: submissionError.message,
          title:
            SUBMISSION_ERROR_TITLES[submissionError.kind] ||
            SUBMISSION_ERROR_TITLES.creation,
        });
      }
    } finally {
      submissionLockRef.current = false;
      if (mountedRef.current) {
        setSubmitPhase("idle");
      }
    }
  };

  const handleCancel = () => {
    if (submissionLockRef.current) return;
    resetForm();
    router.push("/");
  };

  return {
    amountRef,
    categoryRef,
    compressionWarning,
    dateRef,
    detailsOpen,
    fieldErrors,
    handleAmountChange,
    handleCancel,
    handleCategoryChoiceChange,
    handleCustomCategoryChange,
    handleDateChange,
    handleDescriptionChange,
    handleReceiptRemove,
    handleReceiptSelect,
    handleSubmit,
    isSubmitting,
    receipt,
    receiptPreviewUrl,
    requestError,
    resolvedCategory,
    setDetailsOpen,
    submitPhase,
    values,
  };
}
