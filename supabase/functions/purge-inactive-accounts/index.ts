import { createClient } from "npm:@supabase/supabase-js@2.110.8";

const BATCH_LIMIT = 1000;
const HTTP_TIMEOUT_MS = 10_000;
const encoder = new TextEncoder();
type Candidate = {
  user_id: string;
  purge_after: string;
  state: "active";
  activity_version: number | string;
  purge_claimed_at: string | null;
  purge_committed_at: string | null;
};
type OutboxCandidate = {
  id: string;
  user_id: string;
  anonymous_user_hash: string;
  activity_version: number | string;
  purge_claimed_at: string;
  purge_committed_at: string;
  kakao_provider_user_id: string | null;
  status: "pending";
};
type Claim = {
  activity_version: number | string;
  purge_claimed_at: string;
};
type CommittedClaim = Claim & {
  purge_committed_at: string;
  purge_outbox_id: string;
};

type FailureCode =
  | "candidate_query_failed"
  | "claim_failed"
  | "outbox_readback_failed"
  | "auth_pre_readback_failed"
  | "kakao_identity_invalid"
  | "kakao_unlink_disabled"
  | "kakao_unlink_failed"
  | "claim_readback_failed"
  | "auth_delete_not_confirmed"
  | "auth_delete_readback_failed"
  | "audit_readback_failed"
  | "outbox_completion_failed";
type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function firstClaim(value: unknown): Claim | null {
  if (!Array.isArray(value) || value.length !== 1 || !isRecord(value[0])) {
    return null;
  }
  const activityVersion = value[0].activity_version;
  const claimedAt = value[0].purge_claimed_at;
  if (
    (typeof activityVersion !== "number" &&
      typeof activityVersion !== "string") ||
    typeof claimedAt !== "string"
  ) {
    return null;
  }
  return {
    activity_version: activityVersion,
    purge_claimed_at: claimedAt,
  };
}

function firstCommittedClaim(value: unknown): CommittedClaim | null {
  const claim = firstClaim(value);
  if (!claim || !Array.isArray(value) || !isRecord(value[0])) {
    return null;
  }
  const committedAt = value[0].purge_committed_at;
  const outboxId = value[0].purge_outbox_id;
  return typeof committedAt === "string" &&
      typeof outboxId === "string"
    ? {
        ...claim,
        purge_committed_at: committedAt,
        purge_outbox_id: outboxId,
      }
    : null;
}

function candidatesFrom(value: unknown): Candidate[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  const candidates: Candidate[] = [];
  for (const item of value) {
    if (!isRecord(item)) {
      return null;
    }
    const activityVersion = item.activity_version;
    if (
      typeof item.user_id !== "string" ||
      typeof item.purge_after !== "string" ||
      item.state !== "active" ||
      (typeof activityVersion !== "number" &&
        typeof activityVersion !== "string")
    ) {
      return null;
    }
    candidates.push({
      user_id: item.user_id,
      purge_after: item.purge_after,
      state: item.state,
      activity_version: activityVersion,
      purge_claimed_at:
        typeof item.purge_claimed_at === "string"
          ? item.purge_claimed_at
          : null,
      purge_committed_at:
        typeof item.purge_committed_at === "string"
          ? item.purge_committed_at
          : null,
    });
  }
  return candidates;
}

function outboxCandidatesFrom(value: unknown): OutboxCandidate[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  const candidates: OutboxCandidate[] = [];
  for (const item of value) {
    if (!isRecord(item)) {
      return null;
    }
    const activityVersion = item.activity_version;
    if (
      typeof item.id !== "string" ||
      typeof item.user_id !== "string" ||
      typeof item.anonymous_user_hash !== "string" ||
      (typeof activityVersion !== "number" &&
        typeof activityVersion !== "string") ||
      typeof item.purge_claimed_at !== "string" ||
      typeof item.purge_committed_at !== "string" ||
      item.status !== "pending" ||
      (item.kakao_provider_user_id !== null &&
        typeof item.kakao_provider_user_id !== "string")
    ) {
      return null;
    }
    candidates.push({
      id: item.id,
      user_id: item.user_id,
      anonymous_user_hash: item.anonymous_user_hash,
      activity_version: activityVersion,
      purge_claimed_at: item.purge_claimed_at,
      purge_committed_at: item.purge_committed_at,
      kakao_provider_user_id: item.kakao_provider_user_id,
      status: "pending",
    });
  }
  return candidates;
}

function kakaoIdentity(
  user: unknown,
):
  | { kind: "none" }
  | { kind: "invalid" }
  | { kind: "valid"; providerUserId: string } {
  if (!isRecord(user)) {
    return { kind: "none" };
  }
  const appMetadata = isRecord(user.app_metadata)
    ? user.app_metadata
    : {};
  const providers = Array.isArray(appMetadata.providers)
    ? appMetadata.providers
    : [];
  const claimsKakao =
    appMetadata.provider === "kakao" ||
    providers.includes("kakao");
  if (!Array.isArray(user.identities)) {
    return claimsKakao ? { kind: "invalid" } : { kind: "none" };
  }
  const identity = user.identities.find(
    (item) => isRecord(item) && item.provider === "kakao",
  );
  if (!isRecord(identity)) {
    return claimsKakao ? { kind: "invalid" } : { kind: "none" };
  }
  const identityData = identity.identity_data;
  if (!isRecord(identityData)) {
    return { kind: "invalid" };
  }
  const providerUserId = identityData.sub;
  const normalized =
    typeof providerUserId === "number"
      ? String(providerUserId)
      : typeof providerUserId === "string"
        ? providerUserId
        : "";
  return /^\d+$/.test(normalized)
    ? { kind: "valid", providerUserId: normalized }
    : { kind: "invalid" };
}

async function anonymousHash(userId: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`purge:${userId}`),
  );
  return [...new Uint8Array(signature)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

async function responseJson(response: Response): Promise<unknown> {
  return response.json().catch(() => null);
}

async function kakaoUserIsLinked(
  providerUserId: string,
  adminKey: string,
) {
  const url = new URL("https://kapi.kakao.com/v2/app/users");
  url.searchParams.set("target_id_type", "user_id");
  url.searchParams.set("target_ids", `[${providerUserId}]`);
  const response = await fetch(url, {
    headers: { Authorization: `KakaoAK ${adminKey}` },
    signal: AbortSignal.timeout(HTTP_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error("kakao readback failed");
  }
  const body = await responseJson(response);
  if (!isRecord(body) || !Array.isArray(body.elements)) {
    throw new Error("kakao readback shape invalid");
  }
  return body.elements.some(
    (element) =>
      isRecord(element) && String(element.id) === providerUserId,
  );
}

async function unlinkKakaoUser(
  providerUserId: string,
  adminKey: string,
) {
  if (!(await kakaoUserIsLinked(providerUserId, adminKey))) {
    return;
  }

  const body = new URLSearchParams({
    target_id_type: "user_id",
    target_id: providerUserId,
  });
  const response = await fetch("https://kapi.kakao.com/v1/user/unlink", {
    method: "POST",
    headers: {
      Authorization: `KakaoAK ${adminKey}`,
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
    },
    body,
    signal: AbortSignal.timeout(HTTP_TIMEOUT_MS),
  });
  const result = await responseJson(response);
  if (
    !response.ok ||
    !isRecord(result) ||
    String(result.id) !== providerUserId
  ) {
    throw new Error("kakao unlink response was not authoritative");
  }
  if (await kakaoUserIsLinked(providerUserId, adminKey)) {
    throw new Error("kakao unlink readback still found user");
  }
}

function incrementFailure(
  failures: Partial<Record<FailureCode, number>>,
  code: FailureCode,
) {
  failures[code] = (failures[code] ?? 0) + 1;
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return Response.json({ error: "method not allowed" }, { status: 405 });
  }

  const cronSecret = Deno.env.get("CRON_SECRET");
  if (
    !cronSecret ||
    request.headers.get("authorization") !== `Bearer ${cronSecret}`
  ) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const purgeEnabled =
    Deno.env.get("ACCOUNT_PURGE_ENABLED") === "true";
  const authDeleteEnabled =
    Deno.env.get("ACCOUNT_PURGE_AUTH_DELETE_ENABLED") === "true";
  const kakaoUnlinkEnabled =
    Deno.env.get("ACCOUNT_PURGE_KAKAO_UNLINK_ENABLED") === "true";
  if (!purgeEnabled || !authDeleteEnabled) {
    return Response.json(
      { error: "account purge is disabled" },
      { status: 503 },
    );
  }

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const auditSecret = Deno.env.get("PURGE_AUDIT_HMAC_SECRET");
  if (
    !url ||
    !serviceKey ||
    !auditSecret ||
    auditSecret.length < 32
  ) {
    return Response.json(
      { error: "missing server configuration" },
      { status: 500 },
    );
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const cutoff = new Date().toISOString();
  const failures: Partial<Record<FailureCode, number>> = {};
  const { data: outboxData, error: outboxError } = await supabase
    .from("account_purge_outbox")
    .select(
      "id,user_id,anonymous_user_hash,activity_version,purge_claimed_at,purge_committed_at,kakao_provider_user_id,status",
    )
    .eq("status", "pending")
    .order("created_at")
    .limit(BATCH_LIMIT);
  const outboxCandidates = outboxCandidatesFrom(outboxData);
  if (outboxError || !outboxCandidates) {
    incrementFailure(failures, "candidate_query_failed");
    return Response.json(
      { scanned: 0, purged: 0, failures },
      { status: 500 },
    );
  }
  const remainingLimit = Math.max(
    0,
    BATCH_LIMIT - outboxCandidates.length,
  );
  const { data: activeData, error: activeError } = remainingLimit
    ? await supabase
        .from("account_activity")
        .select(
          "user_id,purge_after,state,activity_version,purge_claimed_at,purge_committed_at",
        )
        .eq("state", "active")
        .lte("purge_after", cutoff)
        .order("purge_after")
        .limit(remainingLimit)
    : { data: [], error: null };
  const activeCandidates = candidatesFrom(activeData);
  if (activeError || !activeCandidates) {
    incrementFailure(failures, "candidate_query_failed");
    return Response.json(
      { scanned: 0, purged: 0, failures },
      { status: 500 },
    );
  }
  const workItems = [
    ...outboxCandidates.map((candidate) => ({
      kind: "outbox" as const,
      candidate,
    })),
    ...activeCandidates.map((candidate) => ({
      kind: "active" as const,
      candidate,
    })),
  ];

  let purged = 0;
  for (const item of workItems) {
    const candidate = item.candidate;
    const userId = candidate.user_id;
    let claim: Claim | null =
      item.kind === "outbox"
        ? {
            activity_version: candidate.activity_version,
            purge_claimed_at: candidate.purge_claimed_at,
          }
        : null;
    let committedAt =
      item.kind === "outbox"
        ? candidate.purge_committed_at
        : null;
    let outboxId =
      item.kind === "outbox"
        ? candidate.id
        : null;
    let userHash =
      item.kind === "outbox"
        ? candidate.anonymous_user_hash
        : null;
    let kakaoProviderUserId =
      item.kind === "outbox"
        ? candidate.kakao_provider_user_id
        : null;

    if (item.kind === "active") {
      const { data: claimData, error: claimError } = await supabase.rpc(
        "claim_inactive_account",
        {
          p_user_id: userId,
          p_expected_activity_version: candidate.activity_version,
          p_cutoff: cutoff,
        },
      );
      claim = firstClaim(claimData);
      if (claimError || !claim) {
        incrementFailure(failures, "claim_failed");
        continue;
      }
    }
    if (!claim) {
      incrementFailure(failures, "claim_failed");
      continue;
    }
    const currentClaim = claim;

    const releaseClaim = async () => {
      if (outboxId) return;
      await supabase.rpc("release_account_purge_claim", {
        p_user_id: userId,
        p_expected_activity_version: currentClaim.activity_version,
        p_claimed_at: currentClaim.purge_claimed_at,
      });
    };
    const verifyClaim = async () => {
      const { data: verified, error: verifyError } =
        await supabase.rpc("verify_account_purge_claim", {
          p_user_id: userId,
          p_expected_activity_version: currentClaim.activity_version,
          p_claimed_at: currentClaim.purge_claimed_at,
        });
      return !verifyError && verified === true;
    };
    const verifyOutbox = async () => {
      if (!outboxId || !committedAt) return false;
      const { data: verified, error: verifyError } =
        await supabase.rpc("verify_account_purge_outbox", {
          p_outbox_id: outboxId,
          p_user_id: userId,
          p_expected_activity_version: currentClaim.activity_version,
          p_claimed_at: currentClaim.purge_claimed_at,
          p_committed_at: committedAt,
        });
      return !verifyError && verified === true;
    };

    const { data: authBefore, error: authBeforeError } =
      await supabase.auth.admin.getUserById(userId);
    const authAlreadyDeleted =
      authBefore.user === null && authBeforeError?.status === 404;
    if (authBeforeError && !authAlreadyDeleted) {
      incrementFailure(failures, "auth_pre_readback_failed");
      await releaseClaim();
      continue;
    }
    if (
      item.kind === "active" &&
      (authAlreadyDeleted || authBefore.user?.id !== userId)
    ) {
      incrementFailure(failures, "auth_pre_readback_failed");
      await releaseClaim();
      continue;
    }

    if (!authAlreadyDeleted) {
      const kakao = kakaoIdentity(authBefore.user);
      if (kakao.kind === "invalid") {
        incrementFailure(failures, "kakao_identity_invalid");
        await releaseClaim();
        continue;
      }
      if (item.kind === "active" && kakao.kind === "valid") {
        kakaoProviderUserId = kakao.providerUserId;
      }
      if (
        item.kind === "outbox" &&
        kakao.kind === "valid" &&
        kakaoProviderUserId !== kakao.providerUserId
      ) {
        incrementFailure(failures, "kakao_identity_invalid");
        continue;
      }
      if (
        item.kind === "outbox" &&
        kakao.kind === "none" &&
        kakaoProviderUserId
      ) {
        incrementFailure(failures, "kakao_identity_invalid");
        continue;
      }
    }

    if (kakaoProviderUserId) {
      const kakaoAdminKey = Deno.env.get("KAKAO_ADMIN_KEY");
      if (
        !kakaoUnlinkEnabled ||
        !kakaoAdminKey
      ) {
        incrementFailure(failures, "kakao_unlink_disabled");
        await releaseClaim();
        continue;
      }
    }

    if (!outboxId) {
      if (!(await verifyClaim())) {
        incrementFailure(failures, "claim_readback_failed");
        await releaseClaim();
        continue;
      }
      userHash = await anonymousHash(userId, auditSecret);
      const { data: commitData, error: commitError } = await supabase.rpc(
        "commit_account_purge_claim",
        {
          p_user_id: userId,
          p_expected_activity_version: currentClaim.activity_version,
          p_claimed_at: currentClaim.purge_claimed_at,
          p_anonymous_user_hash: userHash,
          p_kakao_provider_user_id: kakaoProviderUserId,
        },
      );
      const committed = firstCommittedClaim(commitData);
      if (commitError || !committed) {
        incrementFailure(failures, "claim_readback_failed");
        await releaseClaim();
        continue;
      }
      committedAt = committed.purge_committed_at;
      outboxId = committed.purge_outbox_id;
    }
    if (!userHash || !(await verifyOutbox())) {
      incrementFailure(failures, "outbox_readback_failed");
      continue;
    }

    if (kakaoProviderUserId) {
      const kakaoAdminKey = Deno.env.get("KAKAO_ADMIN_KEY");
      if (!kakaoAdminKey) {
        incrementFailure(failures, "kakao_unlink_disabled");
        continue;
      }
      try {
        await unlinkKakaoUser(kakaoProviderUserId, kakaoAdminKey);
      } catch {
        incrementFailure(failures, "kakao_unlink_failed");
        continue;
      }
      if (!(await verifyOutbox())) {
        incrementFailure(failures, "outbox_readback_failed");
        continue;
      }
    }

    if (!authAlreadyDeleted) {
      await supabase.auth.admin.deleteUser(userId);
      const { data: authAfter, error: authAfterError } =
        await supabase.auth.admin.getUserById(userId);
      const deletionConfirmed =
        authAfter.user === null && authAfterError?.status === 404;
      if (!deletionConfirmed) {
        if (authAfter.user?.id === userId) {
          incrementFailure(failures, "auth_delete_not_confirmed");
        } else {
          incrementFailure(failures, "auth_delete_readback_failed");
        }
        continue;
      }
    }

    const { data: completionData, error: completionError } =
      await supabase.rpc("complete_account_purge_outbox", {
        p_outbox_id: outboxId,
        p_user_id: userId,
      });
    const completion =
      Array.isArray(completionData) &&
        completionData.length === 1 &&
        isRecord(completionData[0])
        ? completionData[0]
        : null;
    if (
      completionError ||
      !completion ||
      completion.purge_outbox_id !== outboxId ||
      completion.anonymous_user_hash !== userHash ||
      completion.purge_claimed_at !== currentClaim.purge_claimed_at ||
      typeof completion.completed_at !== "string"
    ) {
      incrementFailure(failures, "outbox_completion_failed");
      continue;
    }
    const { data: audit, error: auditError } = await supabase
      .from("account_purge_events")
      .select("anonymous_user_hash,reason,purged_at")
      .eq("anonymous_user_hash", userHash)
      .eq("purged_at", currentClaim.purge_claimed_at)
      .single();
    if (
      auditError ||
      audit?.anonymous_user_hash !== userHash ||
      audit.reason !== "inactivity" ||
      audit.purged_at !== currentClaim.purge_claimed_at
    ) {
      incrementFailure(failures, "audit_readback_failed");
      continue;
    }
    purged += 1;
  }

  return Response.json({
    scanned: workItems.length,
    purged,
    failures,
  });
});
