const zoneId = process.env.CLOUDFLARE_ZONE;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;
const email = process.env.CLOUDFLARE_EMAIL;
const globalKey = process.env.CLOUDFLARE_KEY;

if (!zoneId) {
  throw new Error("CLOUDFLARE_ZONE is required");
}

if (!apiToken && (!email || !globalKey)) {
  throw new Error(
    "Set CLOUDFLARE_API_TOKEN or CLOUDFLARE_EMAIL and CLOUDFLARE_KEY"
  );
}

const apiBase = `https://api.cloudflare.com/client/v4/zones/${zoneId}`;
const authHeaders = apiToken
  ? { Authorization: `Bearer ${apiToken}` }
  : { "X-Auth-Email": email, "X-Auth-Key": globalKey };
const expression =
  '(http.host eq "fronterasmicrofilm.com" and ' +
  'http.request.uri.path starts_with "/assets/")';

const managedRules = [
  {
    phase: "http_request_cache_settings",
    rulesetName: "Fronteras content-addressed asset caching",
    rule: {
      action: "set_cache_settings",
      action_parameters: {
        cache: true,
        browser_ttl: {
          default: 31536000,
          mode: "override_origin",
        },
        edge_ttl: {
          default: 31536000,
          mode: "override_origin",
        },
      },
      description: "Fronteras content-addressed assets: one-year cache",
      enabled: true,
      expression,
    },
  },
  {
    phase: "http_response_cache_settings",
    rulesetName: "Fronteras immutable asset response headers",
    rule: {
      action: "set_cache_control",
      action_parameters: {
        immutable: { operation: "set" },
        "max-age": { operation: "set", value: 31536000 },
        "s-maxage": {
          cloudflare_only: true,
          operation: "set",
          value: 31536000,
        },
      },
      description: "Fronteras content-addressed assets: immutable response",
      enabled: true,
      expression: `${expression.slice(0, -1)} and http.response.code eq 200)`,
    },
  },
];

async function cloudflare(pathname, options = {}) {
  const response = await fetch(`${apiBase}${pathname}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...options.headers,
    },
  });
  const payload = await response.json();

  if (!response.ok || payload.success === false) {
    const details = (payload.errors || [])
      .map((error) => `${error.code || "error"}: ${error.message}`)
      .join("; ");
    throw new Error(
      `Cloudflare ${options.method || "GET"} ${pathname} failed ` +
        `(${response.status}): ${details || response.statusText}`
    );
  }

  return payload.result;
}

async function syncManagedRule({ phase, rulesetName, rule }) {
  const rulesets = await cloudflare("/rulesets");
  let ruleset = rulesets.find(
    (candidate) => candidate.kind === "zone" && candidate.phase === phase
  );

  if (!ruleset) {
    ruleset = await cloudflare("/rulesets", {
      body: JSON.stringify({
        kind: "zone",
        name: rulesetName,
        phase,
        rules: [rule],
      }),
      method: "POST",
    });
    console.log(`Created ${rule.description}`);
    return;
  }

  const fullRuleset = await cloudflare(`/rulesets/${ruleset.id}`);
  const existingRule = fullRuleset.rules.find(
    (candidate) => candidate.description === rule.description
  );

  if (existingRule) {
    await cloudflare(`/rulesets/${ruleset.id}/rules/${existingRule.id}`, {
      body: JSON.stringify(rule),
      method: "PATCH",
    });
    console.log(`Updated ${rule.description}`);
    return;
  }

  await cloudflare(`/rulesets/${ruleset.id}/rules`, {
    body: JSON.stringify(rule),
    method: "POST",
  });
  console.log(`Created ${rule.description}`);
}

for (const managedRule of managedRules) {
  await syncManagedRule(managedRule);
}
